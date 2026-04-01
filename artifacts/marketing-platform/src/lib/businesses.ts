/**
 * Firestore service layer for the `businesses` collection.
 *
 * Collection schema:
 *   /businesses/{id}
 *     url            string    – the analyzed business website URL
 *     createdAt      Timestamp – when the document was first created
 *     updatedAt      Timestamp – last time the document was modified
 *     status         "pending" | "analyzing" | "done" | "error"
 *     dna            object?   – Business DNA extracted by Gemini
 *     calendar       object[]? – Content Calendar entries
 *     captions       object[]? – Generated captions
 *     adInsights     object?   – Ad copy and targeting recommendations
 *     errorMessage   string?   – Set when status === "error"
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type DocumentReference,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const COLLECTION = "businesses";

// ── Types ─────────────────────────────────────────────────────────────────────

export type BusinessStatus = "pending" | "analyzing" | "done" | "error";

export interface BusinessDNA {
  summary: string;
  brandVoice: string;
  targetAudience: string;
  uniqueSellingPoints: string[];
  competitors?: string[];
  industry?: string;
}

export interface CalendarEntry {
  date: string;
  platform: string;
  contentType: string;
  topic: string;
  caption?: string;
}

export interface CaptionEntry {
  platform: string;
  caption: string;
  hashtags?: string[];
}

export interface AdInsights {
  headlines: string[];
  primaryText: string[];
  callsToAction: string[];
  targetingKeywords: string[];
  audienceSuggestions: string[];
}

export interface Business {
  id: string;
  url: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  status: BusinessStatus;
  dna?: BusinessDNA;
  calendar?: CalendarEntry[];
  captions?: CaptionEntry[];
  adInsights?: AdInsights;
  errorMessage?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function businessRef(id: string): DocumentReference<DocumentData> {
  return doc(collection(db, COLLECTION), id);
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && "toDate" in value) {
    return (value as { toDate(): Date }).toDate();
  }
  return null;
}

function fromFirestore(id: string, data: DocumentData): Business {
  return {
    id,
    url: data.url ?? "",
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    status: (data.status as BusinessStatus) ?? "pending",
    dna: data.dna,
    calendar: data.calendar,
    captions: data.captions,
    adInsights: data.adInsights,
    errorMessage: data.errorMessage,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch a single business document by ID.
 * Returns null if the document does not exist.
 */
export async function getBusiness(id: string): Promise<Business | null> {
  const snap = await getDoc(businessRef(id));
  if (!snap.exists()) return null;
  return fromFirestore(snap.id, snap.data());
}

/**
 * Create a new business document (or overwrite if it already exists).
 * Sets createdAt + updatedAt automatically.
 */
export async function saveBusiness(
  id: string,
  url: string,
): Promise<void> {
  await setDoc(businessRef(id), {
    url,
    status: "pending" as BusinessStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Partially update an existing business document.
 * Always refreshes updatedAt.
 */
export async function updateBusiness(
  id: string,
  fields: Partial<Omit<Business, "id" | "createdAt" | "updatedAt">>,
): Promise<void> {
  await updateDoc(businessRef(id), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}
