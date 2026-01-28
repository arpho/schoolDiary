import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import * as logger from "firebase-functions/logger";

interface AgendaEvent {
    key?: string;
    title: string;
    description: string;
    dataInizio: string;
    classKey: string;
    targetClasses?: string[];
}

export const dailyAgendaNotifications = onSchedule("every day 00:00", async (event) => {
    const db = getFirestore();
    const messaging = getMessaging();

    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(now);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 2);
    tomorrowEnd.setHours(0, 0, 0, 0);

    logger.info(`Checking agenda events between ${tomorrowStart.toISOString()} and ${tomorrowEnd.toISOString()}`);

    try {
        const snapshot = await db.collection("agenda-events")
            .where("dataInizio", ">=", tomorrowStart.toISOString())
            .where("dataInizio", "<", tomorrowEnd.toISOString())
            .get();

        if (snapshot.empty) {
            logger.info("Nessun evento in agenda per domani.");
            return;
        }

        const promises: Promise<any>[] = [];
        const projectId = process.env.GCLOUD_PROJECT || "schooldiary-b8434";
        const faviconUrl = `https://${projectId}.web.app/assets/icon/favicon.png`;

        snapshot.forEach((doc) => {
            const data = doc.data();
            const eventData = data as Partial<AgendaEvent>;

            if (!eventData.title || !eventData.description) return;

            const title = eventData.title;
            const body = eventData.description;
            const topics: string[] = [];

            if (eventData.targetClasses && Array.isArray(eventData.targetClasses) && eventData.targetClasses.length > 0) {
                eventData.targetClasses.forEach((classId) => {
                    topics.push(`agenda_${classId}`);
                });
            } else if (eventData.classKey) {
                topics.push(`agenda_${eventData.classKey}`);
            }

            topics.forEach((topic) => {
                const message = {
                    notification: {
                        title: `Domani: ${title}`,
                        body: body,
                        imageUrl: faviconUrl,
                    },
                    webpush: {
                        notification: {
                            icon: faviconUrl
                        }
                    },
                    topic: topic
                };

                promises.push(
                    messaging.send(message)
                        .then((response) => {
                            logger.info(`Successfully sent message to topic ${topic}:`, response);
                        })
                        .catch((error) => {
                            logger.error(`Error sending message to topic ${topic}:`, error);
                        })
                );
            });
        });

        await Promise.all(promises);
        logger.info(`Processed ${snapshot.size} events and sent notifications.`);

    } catch (error) {
        logger.error("Errore durante l'esecuzione di dailyAgendaNotifications:", error);
    }
});
