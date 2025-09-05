/* eslint-disable max-len */
import {getAuth, UserRecord} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import {UsersRole} from "../shared/models/UsersRole";
import {emailService} from '../services/email.service';

/**
 * Verifica se un utente esiste
 * @param {string} email - L'email dell'utente da verificare
 * @return {Promise<boolean>} True se l'utente esiste, false altrimenti
 */
async function checkUserExists(email: string): Promise<boolean> {
  try {
    await getAuth().getUserByEmail(email);
    logger.info("Utente trovato:", email);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "auth/user-not-found") {
      logger.info("Utente non trovato:", email);
      return false;
    }
    throw error;
  }
}

/**
 * Invia una mail di attivazione all'utente
 * @param {string} email - L'email a cui inviare il link di attivazione
 * @param {string} activationLink - Il link di attivazione da inviare
 */
async function sendActivationEmail(email: string, activationLink: string) {
  try {
    const success = await emailService.sendActivationEmail(email, activationLink);
    if (success) {
      logger.info(`Email di attivazione inviata con successo a ${email}`);
    } else {
      logger.error(`Invio email di attivazione fallito per ${email}`);
    }
  } catch (error) {
    logger.error("Errore nell'invio dell'email di attivazione:", error);
  }
}

interface CreateUserPlusData {
  email: string;
  /** Password (obbligatoria solo per nuovi utenti) */
  password?: string;
  role: UsersRole;
  firstName: string;
  lastName: string;
  classKey?: string;
  additionalData?: Partial<{
    displayName: string;
    photoURL: string;
    [key: string]: unknown;
  }>;
}

/**
 * Crea o aggiorna un utente nel sistema con funzionalità avanzate.
 * Questa funzione fornisce un'interfaccia unificata per:
 * - Creare nuovi utenti con profilo e ruoli personalizzati
 * - Aggiornare utenti esistenti mantenendo i dati storici
 * - Gestire l'invio di email di attivazione
 * - Gestire i custom claims per l'autorizzazione
*
 * @param {Object} request - La richiesta HTTP ricevuta da Firebase
 * @param {Object} request.auth - Dati di autenticazione dell'utente che effettua la richiesta
 * @param {Object} request.data - Dati della richiesta
 * @param {string} request.data.email - Email dell'utente (obbligatoria)
 * @param {string} [request.data.password] - Password (obbligatoria solo per nuovi utenti)
 * @param {UsersRole} request.data.role - Ruolo dell'utente nel sistema
 * @param {string} request.data.firstName - Nome dell'utente
 * @param {string} request.data.lastName - Cognome dell'utente
 * @param {string} [request.data.classKey] - Chiave della classe a cui è assegnato l'utente (opzionale)
 * @param {Object} [request.data.additionalData] - Dati aggiuntivi opzionali
 * @param {string} [request.data.additionalData.displayName] - Nome visualizzato
 * @param {string} [request.data.additionalData.photoURL] - URL della foto profilo
*
 * @returns {Promise<Object>} Risultato dell'operazione
 * @property {boolean} success - Indica se l'operazione è andata a buon fine
 * @property {string} userId - ID dell'utente creato/aggiornato
 * @property {string} email - Email dell'utente
 * @property {boolean} isNewUser - Indica se è un nuovo utente
 * @property {string|null} classKey - Chiave della classe assegnata
 * @property {UsersRole} role - Ruolo dell'utente
*
 * @throws {functions.https.HttpsError} Se si verifica un errore durante l'operazione
 * @throws {functions.https.HttpsError} Se i dati richiesti non sono validi
 * @throws {functions.https.HttpsError} Se l'utente non è autenticato
 *
 * @example
 * // Creazione nuovo utente
 * const result = await createUserPlus({
 *   email: "nuovo@esempio.com",
 *   password: "passwordSicura123",
 *   role: UsersRole.STUDENT,
 *   firstName: "Mario",
 *   lastName: "Rossi",
 *   classKey: "classe-2023"
 * });
 *
 * @example
 * // Aggiornamento utente esistente
 * const result = await createUserPlus({
 *   email: "esistente@esempio.com",
 *   role: UsersRole.TEACHER,
 *   firstName: "Luigi",
 *   lastName: "Verdi",
 *   classKey: "classe-2023"
 * });
 */
export const createUserPlus = onCall(
  {enforceAppCheck: false},
  async (request) => {
    const data = request.data as CreateUserPlusData;
    const {email, password, role, firstName, lastName, classKey, additionalData = {}} = data;
    const auth = getAuth();
    const db = getFirestore();
    // Verifica autenticazione
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Devi essere autenticato per creare o aggiornare un utente",
      );
    }

    // Validazione dei campi obbligatori
    if (!email || !role || !firstName || !lastName) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Email, ruolo, nome e cognome sono campi obbligatori"
      );
    }

    try {
      let userRecord: UserRecord;
      const userEmail = email.toLowerCase().trim();
      const userAlreadyExists = await checkUserExists(userEmail);

      if (userAlreadyExists) {
        // 1. UTENTE ESISTENTE: aggiorna classKey e custom claims
        userRecord = await auth.getUserByEmail(userEmail);

        // Aggiorna i custom claims
        const customClaims = {
          role,
          classKey: classKey || null,
          ...(additionalData || {}),
        };

        await auth.setCustomUserClaims(userRecord.uid, customClaims);

        // Aggiorna il profilo utente in Firestore
        const userProfileRef = db.collection("userProfiles").doc(userRecord.uid);
        await userProfileRef.set(
          {
            email: userEmail,
            firstName,
            lastName,
            classKey: classKey || null,
            role,
            updatedAt: new Date(),
          },
          {merge: true},
        );

        logger.info(`Utente esistente aggiornato: ${userEmail}`);
      } else {
        // 2. NUOVO UTENTE: crea l'utente
        if (!password) {
          throw new functions.https.HttpsError(
            "invalid-argument",
            "La password è obbligatoria per la creazione di un nuovo utente",
          );
        }

        // Crea l'utente in Authentication
        userRecord = await auth.createUser({
          email: userEmail,
          password,
          displayName: `${firstName} ${lastName}`.trim(),
          ...(additionalData.photoURL && {photoURL: additionalData.photoURL}),
        });

        // Imposta i custom claims
        const customClaims = {
          role,
          classKey: classKey || null,
          ...(additionalData || {}),
        };

        await auth.setCustomUserClaims(userRecord.uid, customClaims);

        // Crea il profilo utente in Firestore
        const userProfileRef = db.collection("userProfiles").doc(userRecord.uid);
        await userProfileRef.set({
          email: userEmail,
          firstName,
          lastName,
          classKey: classKey || null,
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...(additionalData.photoURL && {photoURL: additionalData.photoURL}),
        });

        logger.info(`Nuovo utente creato: ${userEmail}`);
      }

      // Invia la mail di attivazione in entrambi i casi
      const actionCodeSettings = {
        url: `${process.env.APP_URL || "https://schooldiary-b8434.web.app"}/login`,
        handleCodeInApp: true,
      };

      const activationLink = await getAuth().generatePasswordResetLink(userEmail, actionCodeSettings);
      await sendActivationEmail(userEmail, activationLink);

      return {
        success: true,
        userId: userRecord.uid,
        email: userEmail,
        isNewUser: !userAlreadyExists,
        classKey: classKey || null,
        role,
      };
    } catch (error) {
      logger.error("Errore in createUserPlus:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Si è verificato un errore durante l'operazione",
        error,
      );
    }
  }
);
