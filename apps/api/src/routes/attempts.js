import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";

import { Attempt } from "../db/models/attempt.js";
import { Question } from "../db/models/question.js";
import { requireAuth } from "../middleware/auth.js";

export const attemptsRouter = Router();

const attemptSchema = z.object({
  question_id: z.string(),
  selected_choice_id: z.string().min(1).max(20),
  response_time_ms: z.number().min(0).max(30 * 60 * 1000).optional(),
  emotion_label: z.string().max(40).optional(),
});

attemptsRouter.get("/recent", requireAuth, async (req, res) => {
  const userId = req.user?.sub;
  const attempts = await Attempt.find({ user: userId })
    .select("question topic correct response_time_ms difficulty created_at emotion_label")
    .sort({ created_at: -1 })
    .limit(20)
    .lean();

  return res.json({ attempts });
});

attemptsRouter.post("/", requireAuth, async (req, res) => {
  const parsed = attemptSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const { question_id, selected_choice_id, response_time_ms, emotion_label } = parsed.data;
  if (!isValidObjectId(question_id)) return res.status(400).json({ error: "Invalid question id" });

  const question = await Question.findById(question_id).lean();
  if (!question) return res.status(404).json({ error: "Question not found" });

  const choice = question.choices.find((c) => c.id === selected_choice_id);
  if (!choice) return res.status(400).json({ error: "Selected choice not part of question" });

  try {
    const attempt = await Attempt.create({
      user: req.user.sub,
      question: question._id,
      topic: question.topic,
      selected_choice_id,
      correct: Boolean(choice.is_correct),
      response_time_ms,
      difficulty: question.difficulty,
      emotion_label: emotion_label?.toLowerCase(),
    });

    return res.status(201).json({
      attempt: {
        id: attempt.id,
        correct: attempt.correct,
        response_time_ms: attempt.response_time_ms,
        difficulty: attempt.difficulty,
        topic: attempt.topic,
        question: attempt.question,
        emotion_label: attempt.emotion_label || null,
        created_at: attempt.created_at,
      },
    });
  } catch (err) {
    console.error("attempt create error", err);
    return res.status(500).json({ error: "Server error" });
  }
});
