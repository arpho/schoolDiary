

import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {createUser} from "./bussines/createUser";


initializeApp();

const setCustomClaims = onCall({enforceAppCheck: false}, async (request) => {
  const data = request.data as { userKey: string; claims: Record<string, any> };


  // Verifica che i dati siano un oggetto JSON valido
  if (!data || typeof data !== "object") {
    logger.error("Invalid data format");
    throw new Error("Invalid data format");
  }

  const userKey = data.userKey;
  const claims = data.claims;

  try {
    await getAuth().setCustomUserClaims(userKey, claims);
    return {result: "ok", data: {userKey, claims}};
  } catch (error) {
    logger.error("Error processing data:", error);
    throw new Error("Error processing data: " + (error as Error).message);
  }
});

export {setCustomClaims, createUser};
