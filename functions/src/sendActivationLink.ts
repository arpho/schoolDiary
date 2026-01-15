import * as logger from "firebase-functions/logger";
import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import { sendUserActivationLink } from "./bussines/userActivation";

interface SendActivationLinkData {
  email: string;
}

export const sendActivationLink = onCall(
  { enforceAppCheck: false }, // Opzionale: configurazioni v2 simili a quanto visto in altri file
  async (request: CallableRequest<SendActivationLinkData>) => {
    // Verifica che l'utente sia autenticato
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "L'utente deve essere autenticato"
      );
    }

    const { email } = request.data || {};

    // Verifica che l'email sia stata fornita
    if (!email) {
      throw new HttpsError(
        "invalid-argument",
        "Il campo email è obbligatorio"
      );
    }

    // Verifica il formato dell'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpsError(
        "invalid-argument",
        "Il formato dell'email non è valido"
      );
    }

    try {
      // Invia il link di attivazione
      return await sendUserActivationLink(email);
    } catch (error) {
      logger.error("Errore in sendActivationLink:", error);
      throw new HttpsError(
        "internal",
        "Si è verificato un errore durante l'invio del link di attivazione",
        error
      );
    }
  }
);
