

import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";


initializeApp();

// eslint-disable-next-line max-len
const setCustomClaims = functions.https.onCall(async (request) => {
  logger.info("request ", request);
  logger.info("request.data ", request.data);

  // Verifica che i dati siano un oggetto JSON valido
  if (!request.data || typeof request.data !== "object") {
    logger.error("Invalid data format");
    return {result: "error", message: "Invalid data format"};
  }

  try {
    const userKey = request.data.userKey;
    const claims = request.data.claims;

    logger.info("userKey", userKey);
    logger.info("claims", claims);
    if (!userKey || !claims) {
      return {result: "error", message: "Missing required parameters"};
    }

    // Verifica che claims sia un oggetto valido
    if (typeof claims !== "object" || claims === null) {
      return {result: "error", message: "Claims must be a valid object"};
    }

    // Filtra solo i campi validi per claims
    const validClaims = Object.fromEntries(
      Object.entries(claims).filter(([key, value]) => {
        logger.info("key", key);
        logger.debug("value", value);
        // Verifica che il valore sia serializzabile
        try {
          JSON.stringify(value);
          return true;
        } catch {
          return false;
        }
      })
    );

    logger.info("Valid claims", validClaims);
    const validUserKey = validClaims.userKey;
    const validClaims2 = validClaims.claims;
    logger.info("validUserKey", validUserKey);
    logger.info("validClaims2", validClaims2);
    await getAuth().setCustomUserClaims(userKey, validClaims);
    return {result: "ok", data: {userKey, claims: validClaims}};
  } catch (error) {
    logger.error("Error processing data:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error processing data: " + (error as Error).message
    );
  }
});

export {setCustomClaims};

