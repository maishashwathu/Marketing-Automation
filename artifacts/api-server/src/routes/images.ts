/**
 * GET /api/images?q=<query>&per_page=<n>
 *
 * Server-side proxy to Unsplash Search API.
 * Keeps the Access Key out of the browser bundle.
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

interface UnsplashPhoto {
  id: string;
  urls: { regular: string; small: string; thumb: string };
  alt_description: string | null;
  user: { name: string; links: { html: string } };
  links: { html: string };
}

interface UnsplashSearchResult {
  results: UnsplashPhoto[];
  total: number;
}

export interface ImageResult {
  id: string;
  url: string;
  thumb: string;
  small: string;
  alt: string;
  author: string;
  authorUrl: string;
  photoUrl: string;
}

router.get("/images", async (req: Request, res: Response) => {
  const accessKey = process.env["UNSPLASH_API_KEY"];
  if (!accessKey) {
    res.status(503).json({ error: "Unsplash not configured" });
    return;
  }

  const q = typeof req.query["q"] === "string" ? req.query["q"].trim() : "";
  const perPage = Math.min(Number(req.query["per_page"] ?? 4), 10);

  if (!q) {
    res.status(400).json({ error: "q is required" });
    return;
  }

  try {
    const apiUrl =
      `https://api.unsplash.com/search/photos` +
      `?query=${encodeURIComponent(q)}` +
      `&per_page=${perPage}` +
      `&orientation=landscape` +
      `&content_filter=high`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      logger.warn({ status: response.status, body: text }, "Unsplash API error");
      res.status(response.status).json({ error: "Unsplash request failed" });
      return;
    }

    const data = (await response.json()) as UnsplashSearchResult;

    const images: ImageResult[] = data.results.map((p) => ({
      id: p.id,
      url: p.urls.regular,
      thumb: p.urls.thumb,
      small: p.urls.small,
      alt: p.alt_description ?? q,
      author: p.user.name,
      authorUrl: p.user.links.html,
      photoUrl: p.links.html,
    }));

    res.json({ images, total: data.total });
  } catch (err) {
    logger.error({ err, q }, "Unsplash proxy error");
    res.status(500).json({ error: "Image search failed" });
  }
});

export default router;
