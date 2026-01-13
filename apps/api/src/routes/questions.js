import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";

import { Question } from "../db/models/question.js";
import { Topic } from "../db/models/topic.js";
import { requireAuth } from "../middleware/auth.js";

export const questionsRouter = Router();

const choiceSchema = z.object({
  id: z.string().min(1).max(20),
  text: z.string().min(1).max(500),
  is_correct: z.boolean(),
});

const createQuestionSchema = z.object({
  topic_id: z.string(),
  prompt: z.string().min(10).max(1000),
  choices: z.array(choiceSchema).min(2),
  difficulty: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string().max(50)).optional(),
  source: z.enum(["manual", "generated"]).optional(),
  explanation: z.string().max(1000).optional(),
});

questionsRouter.get("/", async (req, res) => {
  const topicId = req.query.topic_id;
  const difficulty = Number(req.query.difficulty);

  const filter = {};
  if (topicId && isValidObjectId(topicId)) filter.topic = topicId;
  if (!Number.isNaN(difficulty) && difficulty >= 1 && difficulty <= 5) filter.difficulty = difficulty;

  const questions = await Question.find(filter)
    .select("prompt choices difficulty topic tags source created_at")
    .sort({ created_at: -1 })
    .limit(50)
    .lean();

  return res.json({ questions });
});

questionsRouter.post("/", requireAuth, async (req, res) => {
  const parsed = createQuestionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const { topic_id, choices } = parsed.data;
  if (!isValidObjectId(topic_id)) return res.status(400).json({ error: "Invalid topic id" });

  const hasCorrect = choices.some((c) => c.is_correct);
  if (!hasCorrect) return res.status(400).json({ error: "At least one choice must be marked correct" });

  const topicExists = await Topic.exists({ _id: topic_id });
  if (!topicExists) return res.status(404).json({ error: "Topic not found" });

  try {
    const question = await Question.create({
      topic: topic_id,
      prompt: parsed.data.prompt,
      choices: parsed.data.choices,
      difficulty: parsed.data.difficulty ?? 3,
      tags: parsed.data.tags || [],
      source: parsed.data.source || "manual",
      explanation: parsed.data.explanation,
    });

    return res.status(201).json({
      question: {
        id: question.id,
        topic: question.topic,
        prompt: question.prompt,
        choices: question.choices,
        difficulty: question.difficulty,
        tags: question.tags || [],
        source: question.source,
        explanation: question.explanation || null,
        created_at: question.created_at,
      },
    });
  } catch (err) {
    console.error("question create error", err);
    return res.status(500).json({ error: "Server error" });
  }
});
