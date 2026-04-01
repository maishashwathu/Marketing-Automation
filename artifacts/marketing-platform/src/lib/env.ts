/**
 * Typed environment variable accessors for the AI Marketing Platform.
 *
 * All sensitive values are stored as Replit Secrets (environment variables).
 * In Vite, env vars are exposed to the browser only when prefixed with VITE_.
 *
 * ── CLIENT-SIDE SECRETS (set these as VITE_* in Replit Secrets) ──────────────
 *
 *   VITE_GEMINI_API_KEY               → from https://aistudio.google.com/apikey
 *   VITE_FIRECRAWL_API_KEY            → from https://firecrawl.dev
 *                                        (npm package: @mendable/firecrawl-js)
 *   VITE_FIREBASE_API_KEY             → Firebase project web API key
 *   VITE_FIREBASE_AUTH_DOMAIN         → e.g. my-project.firebaseapp.com
 *   VITE_FIREBASE_PROJECT_ID          → Firebase project ID
 *   VITE_FIREBASE_STORAGE_BUCKET      → e.g. my-project.appspot.com
 *   VITE_FIREBASE_MESSAGING_SENDER_ID → Firebase messaging sender ID
 *   VITE_FIREBASE_APP_ID              → Firebase app ID
 *
 * ── SERVER-SIDE ONLY (DO NOT use in Vite/browser code) ───────────────────────
 *
 *   FIREBASE_SERVICE_ACCOUNT → Full service account JSON (from Firebase Console
 *                               → Project Settings → Service Accounts).
 *                               Used only in server-side code (e.g. api-server).
 *                               NEVER expose this to the browser.
 */

export const GEMINI_API_KEY: string =
  import.meta.env.VITE_GEMINI_API_KEY ?? "";

export const FIRECRAWL_API_KEY: string =
  import.meta.env.VITE_FIRECRAWL_API_KEY ?? "";

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
} as const;
