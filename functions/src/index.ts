

import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
initializeApp();

const setCustomClaims = functions.https.onCall(async (data, context) => {
  logger.info("setCustomClaims called");
  // Verifica che i dati siano un oggetto JSON valido
  if (!data || typeof data !== "object") {
    logger.error("Invalid data format");
    return {result: "error", message: "Invalid data format"};
  }

  try {
    // Filtra i dati per rimuovere eventuali proprietà non JSON
    logger.debug("data", data);
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => {
        // Se il valore è un oggetto, controlliamo se è JSON valido
        if (typeof value === "object" && value !== null) {
          try {
            // Prova a serializzare il valore
            JSON.stringify(value);
            return true;
          } catch {
            return false;
          }
        }
        return true;
      })
    );

    logger.info("Returning data");
    logger.debug("data", data.data);
    getAuth().setCustomUserClaims(
      data.data.userKey,
      data.data.claims
    );
    return {result: "ok", data: cleanedData};
  } catch (error) {
    logger.error("Error processing data:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error processing data: " + (error as Error).message
    );
  }
});

export {setCustomClaims};

