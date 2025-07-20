

import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";


initializeApp();

// eslint-disable-next-line max-len
const setCustomClaims = functions.https.onCall(async (data:any, context) => {
  logger.debug("data ", data.data);
  logger.debug("context ", context);
  logger.info("***************************************************");
  logger.debug(data.data.claims);
  logger.debug(data.data);
  logger.info("***************************************************");
  // Verifica che i dati siano un oggetto JSON valido
  if (!data || typeof data !== "object") {
    logger.error("Invalid data format");
    return {result: "error", message: "Invalid data format"};
  }
  const userKey = data.data.userKey;
  const claims = data.data.claims;

  try {
    logger.debug(userKey);
    logger.debug(claims);

    await getAuth().setCustomUserClaims(userKey, claims);
    return {result: "ok", data: {userKey, claims}};
  } catch (error) {
    logger.error("Error processing data:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error processing data: " + (error as Error).message
    );
  }
});

export {setCustomClaims};

