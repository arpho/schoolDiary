/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {getAuth} from "firebase-admin/auth";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import {emailService} from "../services/email.service";
import {onCall} from "firebase-functions/https";
import {CreateUserPlusData} from "./createUserPlus";

/**
 * Invia una mail di attivazione all'utente
 * @param {string} email - L'email a cui inviare il link di attivazione
 * @param {string} activationLink - Il link di attivazione da inviare
 */
export async function sendActivationEmail(email: string, activationLink: string) {
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

export const sendActivationMail = onCall(
  {enforceAppCheck: false},
  async (request) => {
    const data = request.data as CreateUserPlusData;
    const {email, role, firstName, lastName, classKey, additionalData = {}} = data;
    const auth = getAuth();

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

    const actionCodeSettings = {
      url: `${process.env.APP_URL || "https://schooldiary-b8434.web.app"}`,
      handleCodeInApp: true,
    };

    const activationLink = await auth.generatePasswordResetLink(email, actionCodeSettings);
    await sendActivationEmail(email, activationLink);
    return {
      success: true,
      email,
      role,
      firstName,
      lastName,
      classKey,
      additionalData,
    };
  }

);
