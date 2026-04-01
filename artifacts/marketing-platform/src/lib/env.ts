/**
 * Typed environment variable accessors for the AI Marketing Platform.
 *
 * All sensitive values are stored as Replit Secrets (environment variables).
 * In Vite, env vars are exposed to client code only when prefixed with VITE_.
 * Set the corresponding secret names in Replit Secrets so Vite picks them up.
 *
 * Required secrets:
 *   VITE_GEMINI_API_KEY          → from https://aistudio.google.com/apikey
 *   VITE_FIRECRAWL_API_KEY       → from https://firecrawl.dev
 *   VITE_FIREBASE_API_KEY        → Firebase project web API key
 *   VITE_FIREBASE_AUTH_DOMAIN    → Firebase auth domain
 *   VITE_FIREBASE_PROJECT_ID     → Firebase project ID
 *   VITE_FIREBASE_STORAGE_BUCKET → Firebase storage bucket
 *   VITE_FIREBASE_MESSAGING_SENDER_ID → Firebase messaging sender ID
 *   VITE_FIREBASE_APP_ID         → Firebase app ID
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
