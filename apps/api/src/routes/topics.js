import { Router } from "express";
import { z } from "zod";

import { Topic } from "../db/models/topic.js";
import { requireAuth } from "../middleware/auth.js";

export const topicsRouter = Router();

const topicSchema = z.object({
  title: z.string().min(2).max(120),
  slug: z.string().min(2).max(140).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  tags: z.array(z.string().max(50)).optional(),
});

topicsRouter.get("/", async (_req, res) => {
  const topics = await Topic.find({}).select("title slug description tags created_at").sort({ created_at: -1 }).lean();
  const formatted = topics.map((t) => ({
    id: t._id?.toString() || "",
    title: t.title,
    slug: t.slug,
    description: t.description || null,
    tags: t.tags || [],
    created_at: t.created_at,
  }));
  return res.json({ topics: formatted });
});

topicsRouter.post("/", requireAuth, async (req, res) => {
  const parsed = topicSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  try {
    const topic = await Topic.create(parsed.data);
    return res.status(201).json({
      topic: {
        id: topic.id,
        title: topic.title,
        slug: topic.slug,
        description: topic.description || null,
        tags: topic.tags || [],
        created_at: topic.created_at,
      },
    });
  } catch (err) {
    console.error("topic create error", err);
    if (err?.code === 11000) return res.status(409).json({ error: "Topic slug already exists" });
    return res.status(500).json({ error: "Server error" });
  }
});
