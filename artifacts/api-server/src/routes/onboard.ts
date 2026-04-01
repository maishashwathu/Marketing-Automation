/**
 * POST /api/onboard
 *
 * Body:  { url: string }
 * Returns: { id: string, plan: FullPlan }
 *
 * Flow:
 *  1. Scrape the URL with Firecrawl
 *  2. Ask Gemini to generate a complete 28-day marketing plan (DNA + calendar + captions + insights)
 *  3. Save the result to Firestore /businesses/{id}
 *  4. Return the generated document ID and plan
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

export interface BusinessDNA {
  businessName: string;
  targetAudience: string;
  brandTone: string;
  contentPillars: string[];
}

export interface CalendarPost {
  day: number;
  date: string;
  dayName: string;
  platform: string;
  pillar: string;
  postIdea: string;
  caption: string;
  festival?: string | null;
  festivalAngle?: string | null;
}

export interface PlatformCaptions {
  Instagram: string;
  LinkedIn: string;
  X: string;
  Facebook: string;
}

export interface StrategyInsight {
  title: string;
  insight: string;
  action: string;
}

export interface FullPlan {
  dna: BusinessDNA;
  calendar: CalendarPost[];
  platformCaptions: Record<string, PlatformCaptions>;
  strategyInsights: StrategyInsight[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PLATFORMS = ["Instagram", "LinkedIn", "X", "Facebook"] as const;

const APRIL_2026_FESTIVALS: Array<{ day: number; name: string }> = [
  { day: 1,  name: "April Fools' Day" },
  { day: 3,  name: "Good Friday" },
  { day: 5,  name: "Easter Sunday" },
  { day: 13, name: "Baisakhi" },
  { day: 14, name: "Tamil New Year & Dr. Ambedkar Jayanti" },
  { day: 22, name: "Earth Day" },
  { day: 30, name: "Eid ul-Fitr" },
];

// Apr 1 2026 is a Wednesday → index 2 in DAYS_OF_WEEK (Mon=0)
const APR1_2026_DAY_INDEX = 2;

// ── Fallback plan (used when Gemini is unavailable) ───────────────────────────

function guessBusinessName(url: string, scrapedText: string): string {
  const h1 = scrapedText.match(/^#\s+(.+)/m)?.[1]?.trim();
  if (h1 && h1.length < 80) return h1;

  const titleMeta = scrapedText.match(/^title:\s*(.+)/im)?.[1]?.trim();
  if (titleMeta && titleMeta.length < 80) {
    return titleMeta.replace(/\s*[|\-–—]\s*.+$/, "").trim();
  }

  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    const domain = hostname.split(".")[0];
    return domain
      .replace(/[-_]/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return "Your Business";
  }
}

function buildFallbackPlan(url: string, scrapedText: string): FullPlan {
  const businessName = guessBusinessName(url, scrapedText);

  const dna: BusinessDNA = {
    businessName,
    targetAudience: "Customers and prospects who can benefit from the products and services offered",
    brandTone: "Professional, friendly, and customer-focused",
    contentPillars: [
      "Product highlights & benefits",
      "Customer testimonials & success stories",
      "Industry tips & best practices",
      "Behind-the-scenes & company culture",
    ],
  };

  const pillars = dna.contentPillars;

  const calendar: CalendarPost[] = Array.from({ length: 28 }, (_, i) => {
    const dayNum = i + 1;
    const pillar = pillars[i % pillars.length];
    const platform = PLATFORMS[i % PLATFORMS.length];
    const dayName = DAYS_OF_WEEK[(APR1_2026_DAY_INDEX + i) % 7];
    const festival = APRIL_2026_FESTIVALS.find((f) => f.day === dayNum) ?? null;

    const tag = `#${businessName.replace(/\s+/g, "")}`;
    const festTag = festival ? `#${festival.name.replace(/[^a-zA-Z]/g, "")}` : "";

    return {
      day: dayNum,
      date: `Apr ${dayNum}`,
      dayName,
      platform,
      pillar,
      postIdea: festival
        ? `Celebrate ${festival.name} with a message about how ${businessName} connects with the community`
        : `Highlight your ${pillar.toLowerCase()} to build trust with potential customers`,
      caption: festival
        ? `Happy ${festival.name}! 🎉 At ${businessName}, we celebrate every occasion with the people who matter most — our customers. ${pillar} is at the heart of everything we do. ${tag} ${festTag}`
        : `At ${businessName}, ${pillar.toLowerCase()} is more than a promise — it's how we show up every day. Follow us to see how we make a difference. ${tag} #Marketing #Business`,
      festival: festival?.name ?? null,
      festivalAngle: festival
        ? `Tie ${festival.name} to your brand values and thank your community`
        : null,
    };
  });

  const platformCaptions: Record<string, PlatformCaptions> = {};
  pillars.forEach((pillar) => {
    const tag = `#${businessName.replace(/\s+/g, "")}`;
    platformCaptions[pillar] = {
      Instagram: `✨ ${pillar} — this is what we stand for at ${businessName}.\n\nEvery product, every interaction, every day is built around this commitment. 💡\n\n${tag} #ContentMarketing #SmallBusiness`,
      LinkedIn: `At ${businessName}, our focus on ${pillar.toLowerCase()} drives everything we do.\n\nWe believe that showing up consistently with real value is the key to long-term growth. What does ${pillar.toLowerCase()} mean for your business?\n\n${tag}`,
      X: `${pillar} is our north star at ${businessName}.\n\nHere's why it matters for your business 🧵\n\n${tag} #Marketing`,
      Facebook: `📣 This week at ${businessName}, we're shining a spotlight on ${pillar.toLowerCase()}.\n\nOur customers are at the centre of everything — and this is our commitment to them. 👉 Share this if it resonates!\n\n${tag}`,
    };
  });

  const strategyInsights: StrategyInsight[] = [
    {
      title: `Lead with ${pillars[0]}`,
      insight: `Your strongest asset is ${pillars[0].toLowerCase()}. Start by posting 3 times this week on this theme across Instagram and Facebook — these platforms reward consistency with organic reach.`,
      action: `Write and schedule 3 posts about ${pillars[0].toLowerCase()} for this week using the captions in the Caption Generator tab.`,
    },
    {
      title: "Use festivals to grow reach for free",
      insight: `April has Baisakhi (Apr 13), Easter (Apr 5), and Earth Day (Apr 22) — each is a free boost opportunity. Festival posts get 2-3× more engagement than regular posts.`,
      action: `Check the Content Calendar for Apr 5, 13, and 22. Use those festival captions as-is or personalise them slightly before posting.`,
    },
    {
      title: "Post consistently, not perfectly",
      insight: `Businesses that post 4-5 times a week grow their following 3× faster than those who post sporadically. Use this 28-day calendar as your posting schedule.`,
      action: `Pick one platform to focus on first (Instagram works best for most consumer businesses). Post every day for 7 days using the Week 1 plan.`,
    },
  ];

  return { dna, calendar, platformCaptions, strategyInsights };
}

// ── Scraping ──────────────────────────────────────────────────────────────────

async function scrapeUrl(url: string): Promise<string> {
  const apiKey = process.env["FIRECRAWL_API_KEY"];
  if (!apiKey) {
    logger.warn("FIRECRAWL_API_KEY not set — using placeholder content");
    return `Website: ${url}. Content unavailable (no Firecrawl key).`;
  }

  try {
    const fc = new FirecrawlApp({ apiKey });
    const result = (await fc.scrape(url, { formats: ["markdown"] })) as FirecrawlDocument;
    const text = result.markdown ?? result.html ?? "";
    logger.info({ url, chars: text.length }, "Firecrawl scrape complete");
    return text.slice(0, 8000);
  } catch (err) {
    logger.warn({ err }, "Firecrawl error — using URL-only context");
    return `Website: ${url}. Could not scrape content. Please generate plan based on the URL and domain name alone.`;
  }
}

// ── Gemini full plan generation ───────────────────────────────────────────────

async function generateFullPlan(url: string, scrapedText: string): Promise<FullPlan> {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    logger.warn("GEMINI_API_KEY not set — using fallback plan");
    return buildFallbackPlan(url, scrapedText);
  }

  const festivalList = APRIL_2026_FESTIVALS
    .map((f) => `  - Apr ${f.day}: ${f.name}`)
    .join("\n");

  const prompt = `You are a world-class marketing strategist helping a small business owner who has zero marketing knowledge.
Analyze the website below and generate a complete, ready-to-execute April 2026 marketing plan.

Website URL: ${url}

Scraped website content:
${scrapedText}

April 2026 festivals and occasions (use these strategically):
${festivalList}

IMPORTANT: Every single piece of content (post ideas, captions, insights) must be SPECIFIC to this exact business — its products, services, industry, and audience. Do NOT write generic marketing content.

Return ONLY a valid JSON object with EXACTLY this structure (no markdown fences, no explanation, just JSON):

{
  "dna": {
    "businessName": "exact business name",
    "targetAudience": "specific description of who they sell to (1-2 sentences)",
    "brandTone": "description of their voice and personality (1-2 sentences)",
    "contentPillars": ["pillar 1", "pillar 2", "pillar 3", "pillar 4"]
  },
  "calendar": [
    {
      "day": 1,
      "date": "Apr 1",
      "dayName": "Wed",
      "platform": "Instagram",
      "pillar": "exact pillar from contentPillars above",
      "postIdea": "one specific, actionable post idea tied to this business's actual products/services (1 sentence)",
      "caption": "ready-to-post caption specific to this business (2-3 sentences + 4-5 relevant hashtags)",
      "festival": "April Fools' Day",
      "festivalAngle": "creative way to connect this festival to the business's product/service"
    }
  ],
  "platformCaptions": {
    "pillar name": {
      "Instagram": "Instagram caption with emojis, line breaks, and hashtags",
      "LinkedIn": "professional LinkedIn caption without excessive emojis",
      "X": "tweet under 260 chars with 2-3 hashtags",
      "Facebook": "Facebook caption with a clear call to action"
    }
  },
  "strategyInsights": [
    {
      "title": "short, specific insight title",
      "insight": "1-2 sentences of marketing insight specific to this business and industry",
      "action": "one concrete step the business owner can take TODAY, written simply for someone with no marketing experience"
    }
  ]
}

RULES:
- calendar: exactly 28 entries, days 1-28 (Apr 1 to Apr 28)
- dayName cycle starting Apr 1: Wed, Thu, Fri, Sat, Sun, Mon, Tue, Wed, Thu, Fri, Sat, Sun, Mon, Tue, Wed, Thu, Fri, Sat, Sun, Mon, Tue, Wed, Thu, Fri, Sat, Sun, Mon, Tue
- Platform distribution across 28 posts: ~8 Instagram, ~7 LinkedIn, ~7 X, ~6 Facebook
- Assign festival ONLY on matching days; for all other days set festival and festivalAngle to null
- platformCaptions: exactly one entry per content pillar (4 total)
- strategyInsights: exactly 3 entries
- NEVER use generic phrases like "our brand", "your audience", "content marketing" — always reference the specific business`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { maxOutputTokens: 8192 },
    });

    const raw = response.text ?? "";
    const cleaned = raw
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned) as FullPlan;

    if (
      !parsed.dna?.businessName ||
      !Array.isArray(parsed.calendar) ||
      parsed.calendar.length < 20 ||
      !parsed.platformCaptions ||
      !Array.isArray(parsed.strategyInsights)
    ) {
      throw new Error("Gemini response missing required fields");
    }

    logger.info(
      { businessName: parsed.dna.businessName, calendarDays: parsed.calendar.length },
      "Gemini plan generated successfully",
    );

    return parsed;
  } catch (err) {
    logger.warn({ err }, "Gemini plan generation failed — using fallback plan");
    return buildFallbackPlan(url, scrapedText);
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
    const scrapedText = await scrapeUrl(cleanUrl);
    const plan = await generateFullPlan(cleanUrl, scrapedText);

    const db = getAdminDb();
    if (db) {
      await db
        .collection("businesses")
        .doc(id)
        .set({
          url: cleanUrl,
          status: "done",
          plan,
          dna: plan.dna,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      logger.info({ id }, "Business plan saved to Firestore");
    } else {
      logger.warn({ id }, "Firestore unavailable — skipping save");
    }

    res.json({ id, plan });
  } catch (err) {
    logger.error({ err, id, url: cleanUrl }, "Onboard failed");
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

export default router;
