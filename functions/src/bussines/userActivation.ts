/* eslint-disable max-len */
/* eslint-disable valid-jsdoc */
import * as functions from "firebase-functions";
import {getAuth} from "firebase-admin/auth";
import {sendActivationEmail} from "./sendActivationMail";

/**
 * Invia il link di attivazione all'utente
 // eslint-disable-next-line valid-jsdoc
 * @param email Email dell'utente a cui inviare il link
 * @return Oggetto con esito dell'operazione
 */
export const sendUserActivationLink = async (email: string): Promise<{
  success: boolean;
  email: string;
}> => {
  try {
    // Genera il link di attivazione
    const actionCodeSettings = {
      url: process.env.APP_URL || "https://schooldiary-b8434.web.app",
      handleCodeInApp: true,
    };

    const activationLink = await getAuth().generatePasswordResetLink(email, actionCodeSettings);

    // Invia l'email di attivazione
    await sendActivationEmail(email, activationLink);

    return {
      success: true,
      email,
    };
  } catch (error) {
    functions.logger.error("Errore nell'invio del link di attivazione:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Si è verificato un errore durante l'invio del link di attivazione",
      error
    );
  }
};
