/**
 * Firebase client SDK initialization.
 *
 * Uses the VITE_FIREBASE_* environment variables defined in env.ts.
 * This file is safe to import in browser (client-side) code.
 *
 * Required Replit Secrets (all prefixed with VITE_ so Vite exposes them):
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { FIREBASE_CONFIG } from "@/lib/env";

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(FIREBASE_CONFIG);
}

export const app: FirebaseApp = getFirebaseApp();
export const db: Firestore = getFirestore(app);
