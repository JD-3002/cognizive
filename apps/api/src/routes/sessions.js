import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";

import { Topic } from "../db/models/topic.js";
import { requireAuth } from "../middleware/auth.js";
import { chooseNextQuestion } from "../lib/adaptive.js";

export const sessionsRouter = Router();

const nextQuestionSchema = z.object({
  topic_id: z.string(),
});

sessionsRouter.post("/next-question", requireAuth, async (req, res) => {
  const parsed = nextQuestionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const topicId = parsed.data.topic_id;
  if (!isValidObjectId(topicId)) return res.status(400).json({ error: "Invalid topic id" });

  const topicExists = await Topic.exists({ _id: topicId });
  if (!topicExists) return res.status(404).json({ error: "Topic not found" });

  try {
    const result = await chooseNextQuestion({ userId: req.user.sub, topicId });
    if (!result.question) return res.status(404).json({ error: "No questions available for topic" });

    return res.json({
      question: {
        id: result.question._id?.toString() || result.question.id,
        prompt: result.question.prompt,
        choices: result.question.choices,
        difficulty: result.question.difficulty,
        topic: result.question.topic,
        tags: result.question.tags || [],
      },
      meta: {
        target_difficulty: result.targetDifficulty,
        recent_accuracy: result.signals.accuracy,
        recent_emotion: result.signals.latestEmotion
          ? {
              label: result.signals.latestEmotion.label,
              confidence: result.signals.latestEmotion.confidence ?? null,
              created_at: result.signals.latestEmotion.created_at,
            }
          : null,
        dominant_emotion: result.signals.dominantEmotion || null,
        completed_all: Boolean(result.completedAll),
      },
    });
  } catch (err) {
    console.error("next-question error", err);
    return res.status(500).json({ error: "Server error" });
  }
});
