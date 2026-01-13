import { Router } from "express";
import { z } from "zod";

import { EmotionEvent } from "../db/models/emotionEvent.js";
import { requireAuth } from "../middleware/auth.js";

export const emotionEventsRouter = Router();

const eventSchema = z.object({
  label: z.string().min(2).max(40),
  confidence: z.number().min(0).max(1).optional(),
  context: z.string().max(120).optional(),
  window_ms: z.number().int().min(0).max(10 * 60 * 1000).optional(),
  sample_count: z.number().int().min(1).max(1000).optional(),
});

emotionEventsRouter.get("/recent", requireAuth, async (req, res) => {
  const events = await EmotionEvent.find({ user: req.user?.sub })
    .select("label confidence context window_ms sample_count created_at")
    .sort({ created_at: -1 })
    .limit(20)
    .lean();
  return res.json({ events });
});

emotionEventsRouter.get("/current", requireAuth, async (req, res) => {
  const latest = await EmotionEvent.findOne({ user: req.user?.sub })
    .select("label confidence context window_ms sample_count created_at")
    .sort({ created_at: -1 })
    .lean();

  if (!latest) return res.json({ current: null });
  return res.json({
    current: {
      label: latest.label,
      confidence: latest.confidence ?? null,
      context: latest.context || null,
      window_ms: latest.window_ms || null,
      sample_count: latest.sample_count || null,
      created_at: latest.created_at,
    },
  });
});

emotionEventsRouter.post("/", requireAuth, async (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  try {
    const event = await EmotionEvent.create({
      user: req.user.sub,
      label: parsed.data.label.toLowerCase(),
      confidence: parsed.data.confidence,
      context: parsed.data.context,
      window_ms: parsed.data.window_ms,
      sample_count: parsed.data.sample_count,
    });

    return res.status(201).json({
      event: {
        id: event.id,
        label: event.label,
        confidence: event.confidence ?? null,
        context: event.context || null,
        window_ms: event.window_ms || null,
        sample_count: event.sample_count || null,
        created_at: event.created_at,
      },
    });
  } catch (err) {
    console.error("emotion event error", err);
    return res.status(500).json({ error: "Server error" });
  }
});
