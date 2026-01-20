import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from "module";

import { Question } from "../db/models/question.js";
import { Topic } from "../db/models/topic.js";
import { requireAuth } from "../middleware/auth.js";

export const questionsRouter = Router();

const choiceSchema = z.object({
  id: z.string().min(1).max(20),
  text: z.string().min(1).max(500),
  is_correct: z.boolean(),
});

const generatedQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        prompt: z.string().min(10).max(1000),
        choices: z.array(choiceSchema).min(2),
        difficulty: z.number().int().min(1).max(5).optional(),
        tags: z.array(z.string().max(50)).optional(),
        explanation: z.string().max(1000).optional(),
      })
    )
    .min(1)
    .max(10),
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB PDF cap
});

// Ensure env is loaded even when this module is imported before index initializes dotenv.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;
const geminiModelId = process.env.GEMINI_MODEL || "models/gemini-1.5-flash";

// Diagnostics: confirm Gemini key is detected without logging its value
console.log("[questions] GEMINI_API_KEY set:", Boolean(process.env.GEMINI_API_KEY), "model:", geminiModelId);

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

questionsRouter.post("/generate-from-pdf", requireAuth, upload.single("pdf"), async (req, res) => {
  if (!genAI) return res.status(500).json({ error: "Gemini API key not configured" });
  if (!req.file) return res.status(400).json({ error: "PDF file (field name 'pdf') is required" });

  const { topic_id } = req.body;
  if (!isValidObjectId(topic_id)) return res.status(400).json({ error: "Invalid topic id" });

  const topicExists = await Topic.exists({ _id: topic_id });
  if (!topicExists) return res.status(404).json({ error: "Topic not found" });

  let text = "";
  try {
    const require = createRequire(import.meta.url);
    const { PDFParse } = require("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(req.file.buffer) });
    const parsedPdf = await parser.getText({ pageJoiner: "\n" });
    await parser.destroy?.();
    text = (parsedPdf?.text || "").replace(/\s+/g, " ").trim();
  } catch (err) {
    console.error("pdf parse error", err);
    return res.status(400).json({ error: "Could not read PDF", detail: err?.message || "parse failed" });
  }

  if (!text) return res.status(400).json({ error: "PDF has no readable text" });
  const MAX_CHARS = 12000;
  const material = text.slice(0, MAX_CHARS);

  const prompt = [
    "You are an assessment author. Generate concise multiple-choice questions (MCQs) from the provided study material.",
    "Return ONLY valid JSON (no markdown) shaped as:",
    '{"questions":[{"prompt":"...", "choices":[{"id":"a","text":"...","is_correct":false},{"id":"b","text":"...","is_correct":true}],"difficulty":3,"tags":["pdf"],"explanation":"..."}]}',
    "Rules:",
    "- 1-10 questions total, each with 3-4 choices.",
    "- Exactly one choice per question must have is_correct=true.",
    "- Keep prompt <= 220 chars; choice text <= 160 chars; explanation <= 400 chars.",
    "- Use short, clear language; avoid images/figures.",
    "- Include a brief explanation per question.",
    "Material:",
    material,
  ].join("\n");

  let aiResponse;
  try {
    const model = genAI.getGenerativeModel({ model: geminiModelId });
    const result = await model.generateContent(prompt);
    aiResponse = result.response.text();
  } catch (err) {
    console.error("gemini call error", err);
    return res.status(502).json({ error: "Gemini generation failed" });
  }

  let parsed;
  try {
    const jsonText = aiResponse.match(/\{[\s\S]*\}/)?.[0] || aiResponse;
    parsed = generatedQuestionsSchema.parse(JSON.parse(jsonText));
  } catch (err) {
    console.error("gemini parse error", err, "raw:", aiResponse);
    return res.status(502).json({ error: "Invalid AI response" });
  }

  const sanitized = parsed.questions
    .map((q) => {
      const hasCorrect = q.choices.some((c) => c.is_correct === true);
      if (!hasCorrect) return null;
      return {
        topic: topic_id,
        prompt: q.prompt,
        choices: q.choices,
        difficulty: q.difficulty ?? 3,
        tags: q.tags || ["pdf"],
        source: "generated",
        explanation: q.explanation || undefined,
      };
    })
    .filter(Boolean);

  if (sanitized.length === 0) return res.status(502).json({ error: "No valid questions produced" });

  try {
    const created = await Question.insertMany(sanitized);
    return res.json({
      questions: created.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        choices: q.choices,
        difficulty: q.difficulty,
        tags: q.tags,
        source: q.source,
        explanation: q.explanation || null,
        created_at: q.created_at,
      })),
    });
  } catch (err) {
    console.error("question generation save error", err);
    return res.status(500).json({ error: "Failed to save generated questions" });
  }
});
