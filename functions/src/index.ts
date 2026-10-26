import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {onCall, CallableRequest, HttpsError} from "firebase-functions/v2/https";
import {createUser} from "./bussines/createUser";
import {createUserPlus} from "./bussines/createUserPlus";
import {sendActivationLink} from "./sendActivationLink";
import {dailyAgendaNotifications} from "./bussines/dailyAgendaNotifications";
import {generateEvaluationPdf} from "./bussines/generateEvaluationPdf";
import {UsersRole} from "./shared/models/UsersRole";


interface SetCustomClaimsData {
  userKey: string;
  claims: Record<string, unknown>;
}

initializeApp();

const setCustomClaims = onCall<SetCustomClaimsData>(
  {enforceAppCheck: false},
  async (request: CallableRequest<SetCustomClaimsData>) => {
    // Solo gli utenti autenticati con ruolo ADMIN possono impostare custom claims
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Devi essere autenticato per impostare i custom claims"
      );
    }

    if (request.auth.token.role !== UsersRole.ADMIN) {
      throw new HttpsError(
        "permission-denied",
        "Solo la segreteria o un amministratore può assegnare ruoli"
      );
    }

    const {data} = request;

    // Verifica che i dati siano un oggetto JSON valido
    if (!data || typeof data !== "object") {
      throw new HttpsError("invalid-argument", "Dati non validi");
    }

    const {userKey, claims} = data;

    // Verifica che userKey sia una stringa non vuota
    if (!userKey || typeof userKey !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "userKey è obbligatorio e deve essere una stringa"
      );
    }

    // Verifica che claims sia un oggetto
    if (!claims || typeof claims !== "object" || Array.isArray(claims)) {
      throw new HttpsError(
        "invalid-argument",
        "claims è obbligatorio e deve essere un oggetto"
      );
    }

    try {
      // Imposta i custom claims per l'utente specificato
      await getAuth().setCustomUserClaims(userKey, claims);

      // Aggiorna il documento dell'utente in Firestore
      const userRef = getFirestore().collection("users").doc(userKey);
      await userRef.set(
        {
          customClaims: claims,
          updatedAt: new Date(),
        },
        {merge: true},
      );

      return {
        result: "Custom claims aggiornati con successo",
        data: {userKey, claims},
      };
    } catch (error) {
      logger.error(
        "Errore durante l'aggiornamento dei custom claims:",
        error,
      );
      throw new Error(
        "Si è verificato un errore durante l'aggiornamento dei custom claims",
      );
    }
  }
);

// Esporta tutte le funzioni
export {
  setCustomClaims,
  createUser,
  createUserPlus,
  sendActivationLink,
  dailyAgendaNotifications,
  generateEvaluationPdf,
};
