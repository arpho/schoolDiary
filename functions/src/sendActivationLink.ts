import * as functions from "firebase-functions/v1";
import {sendUserActivationLink} from "./bussines/userActivation";

interface SendActivationLinkData {
  email: string;
}

export const sendActivationLink = functions.https
  .onCall(async (data: SendActivationLinkData, context) => {
    // Verifica che l'utente sia autenticato
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "L'utente deve essere autenticato"
      );
    }

    const {email} = data || {};

    // Verifica che l'email sia stata fornita
    if (!email) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Il campo email è obbligatorio"
      );
    }

    // Verifica il formato dell'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Il formato dell'email non è valido"
      );
    }

    try {
      // Invia il link di attivazione
      return await sendUserActivationLink(email);
    } catch (error) {
      functions.logger.error("Errore in sendActivationLink:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Si è verificato un errore durante l'invio del link di attivazione",
        error
      );
    }
  });
