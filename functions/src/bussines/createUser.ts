import {getAuth, UserRecord} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import {UsersRole} from "../shared/models/UsersRole";

export interface CreateUserData {
  email: string;
  password: string;
  role: UsersRole; // Ora è un numero (enum)
  firstName: string;
  lastName: string;
  classKey?: string;
  additionalData?: {
    displayName?: string;
    photoURL?: string;
    [key: string]: any;
  };
}

/**
 * Crea un nuovo utente in Firebase Authenticatione
 *  un documento nella collezione userProfiles
 * @param {CreateUserData} data - Dati dell'utente
 * @param {functions.https.CallableRequest} request - Richiesta della chiamata
 * @returns {Promise<Object>} Dettagli dell'utente creato
 */
export const createUser = onCall({enforceAppCheck: false}, async (request) => {
  const data = request.data as CreateUserData;

  // Solo gli utenti autenticati possono creare nuovi utenti
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Devi essere autenticato per creare un utente"
    );
  }


  const {email, password, role, classKey, additionalData = {}} = data;
  const auth = getAuth();
  const db = getFirestore();
  let userRecord: UserRecord | null = null;

  // Validazione dei campi obbligatori
  if (!email || !password || !role) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email, password e ruolo sono obbligatori"
    );
  }

  // Valida il ruolo
  if (typeof role !== "number" || !Object.values(UsersRole).includes(role)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      `Ruolo non valido. I ruoli validi sono: ${Object.entries(UsersRole)
        .filter(([key]) => isNaN(Number(key)))
        .map(([key, value]) => `${key}=${value}`)
        .join(", ")}`
    );
  }

  // Se l'utente è uno studente, verifichiamo che sia specificata la classe
  if (role === UsersRole.STUDENT && !classKey) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Per gli studenti è obbligatorio specificare la classe"
    );
  }

  try {
    // 0. Verifica se l'utente esiste già
    try {
      const existingUser = await auth.getUserByEmail(email);
      if (existingUser) {
        throw new functions.https.HttpsError(
          "already-exists",
          "Un utente con questa email esiste già"
        );
      }
    } catch (error: any) {
      // Se l'errore è diverso da "user-not-found", rilanciamo l'errore
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
      // Se l'errore è "user-not-found", procediamo con la creazione
    }

    // 1. Crea l'utente in Authentication
    userRecord = await auth.createUser({
      email,
      password,
      emailVerified: false,
      displayName: `${
        data.firstName || additionalData.firstName || ""
      } ${
        data.lastName || additionalData.lastName || ""
      }`.trim(),
    });

    logger.info(`Utente creato con successo: ${userRecord.uid}`);

    // 2. Prepara i dati per il profilo utente
    const userProfileData = {
      firstName: data.firstName || additionalData.firstName || "",
      lastName: data.lastName || additionalData.lastName || "",
      classKey: data.classKey || additionalData.classKey || "",
      uid: userRecord.uid,
      email,
      role,
      // Includi classKey solo se definito
      ...(classKey && {classKey}),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Filtra eventuali valori undefined da additionalData
      ...Object.fromEntries(
        Object.entries(additionalData)
          .filter(([_, v]) => v !== undefined)
          .filter(([k]) => !["firstName", "lastName"].includes(k)
          ) // Rimuovi firstName e lastName da additionalData se presenti
      ),
    };

    // Validazione dei campi obbligatori
    if (!userProfileData.firstName || !userProfileData.lastName) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Nome e cognome sono obbligatori"
      );
    }

    // 3. Crea il documento nella collezione userProfiles
    await db.collection("userProfile").doc(userRecord.uid).set(userProfileData);

    // 4. Prepara i custom claims
    const customClaims = {
      role,
      classKey,
    };

    // 5. Assegna i custom claims all'utente
    await auth.setCustomUserClaims(userRecord.uid, customClaims);
    logger.info(`Custom claims impostati per l'utente ${userRecord.uid}`);

    // 6. Restituisci i dati dell'utente creato
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      role,
      classKey: role === UsersRole.STUDENT ? classKey : null,
      emailVerified: userRecord.emailVerified,
      displayName: userRecord.displayName || "",
      photoURL: userRecord.photoURL || "",
      customClaims,
    };
  } catch (error) {
    logger.error("Errore nella creazione utente:", error);

    // Se l'utente è stato creato ma si è verificato un errore dopo,
    // prova a eliminarlo per mantenere la coerenza
    if (userRecord) {
      try {
        await auth.deleteUser(userRecord.uid);
        logger.info(`Utente ${userRecord.uid} eliminato a causa di un errore`);
      } catch (deleteError) {
        logger.error("Errore durante la pulizia dell'utente:", deleteError);
      }
    }

    // Gestisci i diversi tipi di errore
    const errorCode = (error as any).code;
    if (errorCode === "auth/email-already-exists") {
      throw new functions.https.HttpsError(
        "already-exists",
        "Un utente con questa email esiste già"
      );
    } else if (errorCode === "auth/invalid-email") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Formato email non valido"
      );
    } else if (errorCode === "auth/weak-password") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "La password deve essere di almeno 6 caratteri"
      );
    } else if (errorCode === "permission-denied") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Non hai i permessi necessari per eseguire questa operazione"
      );
    }

    // Per altri errori non gestiti
    throw new functions.https.HttpsError(
      "internal",
      "Si è verificato un errore durante la creazione dell'utente",
      {message: (error as Error).message, code: errorCode}
    );
  }
});
