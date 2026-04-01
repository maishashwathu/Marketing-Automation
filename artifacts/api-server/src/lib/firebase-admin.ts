/**
 * Firebase Admin SDK initialization (server-side only).
 *
 * Reads the FIREBASE_SERVICE_ACCOUNT environment variable (a JSON string
 * containing the full service account credentials from Firebase Console →
 * Project Settings → Service Accounts → Generate new private key).
 *
 * Call initAdmin() once at startup and then import `adminDb` anywhere you need
 * Firestore access from server code.
 */

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { logger } from "./logger";

let _app: App | null = null;
let _db: Firestore | null = null;

export function initAdmin(): void {
  if (getApps().length > 0) return;

  const raw = process.env["FIREBASE_SERVICE_ACCOUNT"];
  if (!raw) {
    logger.warn(
      "FIREBASE_SERVICE_ACCOUNT env var is not set. Firestore writes will be skipped.",
    );
    return;
  }

  try {
    const serviceAccount = JSON.parse(raw);
    _app = initializeApp({ credential: cert(serviceAccount) });
    _db = getFirestore(_app);
    logger.info("Firebase Admin initialized");
  } catch (err) {
    logger.error({ err }, "Failed to initialize Firebase Admin");
  }
}

export function getAdminDb(): Firestore | null {
  return _db;
}
