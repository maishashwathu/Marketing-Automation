/**
 * POST /api/onboard
 *
 * Body:  { url: string }
 * Returns: { id: string }
 *
 * Flow:
 *  1. Scrape the URL with Firecrawl (falls back to a mock if key is missing)
 *  2. Ask Gemini to extract Business DNA JSON
 *  3. Save the result to Firestore /businesses/{id}
 *  4. Return the generated document ID
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import FirecrawlApp, { type Document as FirecrawlDocument } from "@mendable/firecrawl-js";
import { GoogleGenAI } from "@google/genai";
import { getAdminDb } from "../lib/firebase-admin";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// ── Types ─────────────────────────────────────────────────────────────────────

interface BusinessDNA {
  businessName: string;
  targetAudience: string;
  brandTone: string;
  contentPillars: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DUMMY_DNA: BusinessDNA = {
  businessName: "Acme Corp",
  targetAudience: "Small business owners and entrepreneurs",
  brandTone: "Professional, approachable, and innovative",
  contentPillars: [
    "Product education & tutorials",
    "Customer success stories",
    "Industry trends & insights",
    "Behind-the-scenes culture",
  ],
};

async function scrapeUrl(url: string): Promise<string> {
  const apiKey = process.env["FIRECRAWL_API_KEY"];
  if (!apiKey) {
    logger.warn("FIRECRAWL_API_KEY not set — using mock scrape content");
    return `Mock scraped content for ${url}. This is a placeholder representing the website text that Firecrawl would normally extract. The business appears to offer professional services targeting a broad audience.`;
  }

  try {
    const fc = new FirecrawlApp({ apiKey });
    const result = (await fc.scrape(url, { formats: ["markdown"] })) as FirecrawlDocument;
    const text = result.markdown ?? result.html ?? "";
    return text.slice(0, 8000);
  } catch (err) {
    logger.warn({ err }, "Firecrawl scrape error — falling back to mock content");
    return `Mock scraped content for ${url}. Firecrawl encountered an error. Proceeding with placeholder text for AI analysis.`;
  }
}

async function extractDNA(url: string, scrapedText: string): Promise<BusinessDNA> {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    logger.warn("GEMINI_API_KEY not set — returning dummy DNA");
    return DUMMY_DNA;
  }

  const prompt = `You are a marketing strategist. Analyze the following website content and extract key business information.

Website URL: ${url}

Website Content:
${scrapedText}

Return ONLY a valid JSON object with exactly these fields (no markdown, no explanation):
{
  "businessName": "string — the name of the business",
  "targetAudience": "string — who the business serves (1-2 sentences)",
  "brandTone": "string — the brand voice and tone (1-2 sentences)",
  "contentPillars": ["string", "string", "string", "string"] — exactly 4 content themes for marketing
}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const raw = response.text ?? "";
    const cleaned = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleaned) as BusinessDNA;

    if (
      !parsed.businessName ||
      !parsed.targetAudience ||
      !parsed.brandTone ||
      !Array.isArray(parsed.contentPillars)
    ) {
      throw new Error("Gemini response missing required fields");
    }

    return parsed;
  } catch (err) {
    logger.warn({ err }, "Gemini extraction failed — returning dummy DNA");
    return DUMMY_DNA;
  }
}

// ── Route ─────────────────────────────────────────────────────────────────────

router.post("/onboard", async (req: Request, res: Response) => {
  const { url } = req.body as { url?: string };

  if (!url || typeof url !== "string" || !url.trim()) {
    res.status(400).json({ error: "url is required" });
    return;
  }

  const cleanUrl = url.trim();
  const id = randomUUID();

  logger.info({ id, url: cleanUrl }, "Starting onboard");

  try {
    const [scrapedText] = await Promise.all([scrapeUrl(cleanUrl)]);
    const dna = await extractDNA(cleanUrl, scrapedText);

    const db = getAdminDb();
    if (db) {
      await db
        .collection("businesses")
        .doc(id)
        .set({
          url: cleanUrl,
          status: "done",
          dna,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      logger.info({ id }, "Business saved to Firestore");
    } else {
      logger.warn({ id }, "Firestore unavailable — skipping save");
    }

    res.json({ id, dna });
  } catch (err) {
    logger.error({ err, id, url: cleanUrl }, "Onboard failed");
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

export default router;
