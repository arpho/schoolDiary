import {onSchedule} from "firebase-functions/v2/scheduler";
import {getFirestore, Filter} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging";
import * as logger from "firebase-functions/logger";

interface AgendaEvent {
  key?: string;
  title: string;
  description: string;
  dataInizio: string;
  classKey: string;
  targetClasses?: string[];
}

export const dailyAgendaNotifications = onSchedule({
  schedule: "every day 08:00",
  timeZone: "Europe/Rome",
}, async () => {
  const db = getFirestore();
  const messaging = getMessaging();

  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(now);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 2);
  tomorrowEnd.setHours(0, 0, 0, 0);

  logger.info(
    `Checking agenda events between ${tomorrowStart.toISOString()} ` +
    `and ${tomorrowEnd.toISOString()}`
  );

  try {
    const snapshot = await db.collection("agenda-events")
      .where("dataInizio", ">=", tomorrowStart.toISOString())
      .where("dataInizio", "<", tomorrowEnd.toISOString())
      .get();

    if (snapshot.empty) {
      logger.info("Nessun evento in agenda per domani.");
      return;
    }

    const promises: Promise<unknown>[] = [];
    const projectId = process.env.GCLOUD_PROJECT || "schooldiary-b8434";
    const faviconUrl = `https://${projectId}.web.app/assets/icon/favicon.png`;

    // Raggruppa gli eventi per classe per evitare query duplicate
    const classEventsMap = new Map<string, AgendaEvent[]>();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const eventData = data as AgendaEvent;

      if (!eventData.title || !eventData.description) return;

      const targetClasses: string[] = [];
      if (
        eventData.targetClasses &&
        Array.isArray(eventData.targetClasses) &&
        eventData.targetClasses.length > 0
      ) {
        targetClasses.push(...eventData.targetClasses);
      } else if (eventData.classKey) {
        targetClasses.push(eventData.classKey);
      }

      targetClasses.forEach((classId) => {
        if (!classEventsMap.has(classId)) {
          classEventsMap.set(classId, []);
        }
        classEventsMap.get(classId)?.push(eventData);
      });
    });

    for (const [classId, events] of classEventsMap) {
      // 1. Trova tutti gli utenti della classe
      const usersSnapshot = await db.collection("userProfiles")
        .where(
          Filter.or(
            Filter.where("classKey", "==", classId),
            Filter.where("classes", "array-contains", classId)
          )
        )
        .get();

      if (usersSnapshot.empty) continue;

      // 2. Trova tutti i token dei dispositivi per questi utenti
      const tokenPromises: Promise<string[]>[] = [];

      usersSnapshot.forEach((userDoc) => {
        const userDevicesPromise = userDoc.ref.collection("devices").get()
          .then((devicesSnap) => {
            return devicesSnap.docs
              .map((doc) => doc.data().fcmToken)
              .filter((token) => !!token); // Filtra token null/undefined
          });
        tokenPromises.push(userDevicesPromise);
      });

      const tokensArrays = await Promise.all(tokenPromises);
      // Appiattisci e rimuovi duplicati
      const tokens = [...new Set(tokensArrays.flat())];

      if (tokens.length === 0) {
        logger.info(`Nessun token trovato per la classe ${classId}`);
        continue;
      }

      // 3. Invia notifiche per ogni evento della classe
      events.forEach((eventData) => {
        const message = {
          notification: {
            title: `Domani: ${eventData.title}`,
            body: `${eventData.description}\n` +
              `${new Date(eventData.dataInizio).toLocaleString("it-IT", {
                timeZone: "Europe/Rome",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}`,
            imageUrl: faviconUrl,
          },
          webpush: {
            notification: {
              icon: faviconUrl,
            },
          },
          tokens: tokens, // Usa tokens array per multicast
        };

        promises.push(
          messaging.sendEachForMulticast(message)
            .then((response) => {
              logger.info(
                `Inviato messaggio per evento "${eventData.title}" ` +
                `a ${response.successCount} dispositivi della classe ` +
                `${classId}. Falliti: ${response.failureCount}`
              );
              if (response.failureCount > 0) {
                response.responses.forEach((resp, idx) => {
                  if (!resp.success) {
                    logger.error(
                      `Errore invio a token ${tokens[idx]}:`,
                      resp.error
                    );
                  }
                });
              }
            })
            .catch((error) => {
              logger.error(
                `Errore generale invio multicast classe ${classId}:`,
                error
              );
            })
        );
      });
    }

    await Promise.all(promises);
    logger.info(`Processed ${snapshot.size} events and sent notifications.`);
  } catch (error) {
    logger.error(
      "Errore durante l'esecuzione di dailyAgendaNotifications:",
      error
    );
  }
});
