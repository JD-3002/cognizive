import { Attempt } from "../db/models/attempt.js";
import { EmotionEvent } from "../db/models/emotionEvent.js";
import { Question } from "../db/models/question.js";

function randomPick(array) {
  if (!array.length) return null;
  const idx = Math.floor(Math.random() * array.length);
  return array[idx];
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

async function fetchRecentSignals({ userId, topicId }) {
  const [attempts, emotions] = await Promise.all([
    Attempt.find({ user: userId, topic: topicId }).sort({ created_at: -1 }).limit(12).lean(),
    EmotionEvent.find({ user: userId }).sort({ created_at: -1 }).limit(8).lean(),
  ]);

  const accuracy =
    attempts.length === 0
      ? null
      : attempts.reduce((acc, curr) => acc + (curr.correct ? 1 : 0), 0) / attempts.length;

  const avgTime =
    attempts.length === 0
      ? null
      : attempts.reduce((acc, curr) => acc + (curr.response_time_ms || 0), 0) / attempts.length;

  const emotionCounts = emotions.reduce((acc, evt) => {
    const label = evt.label || "unknown";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];

  return {
    attempts,
    emotions,
    accuracy,
    avgTime,
    latestEmotion: emotions[0] || null,
    dominantEmotion: dominantEmotion
      ? { label: dominantEmotion[0], count: dominantEmotion[1], sample_size: emotions.length }
      : null,
  };
}

export async function chooseNextQuestion({ userId, topicId }) {
  const signals = await fetchRecentSignals({ userId, topicId });
  // Pull all attempted question ids for this user/topic to avoid repeats when possible.
  const attemptedIds = await Attempt.find({ user: userId, topic: topicId }).distinct("question");

  // Baseline difficulty is 3; nudge based on accuracy and recent emotion label.
  let targetDifficulty = 3;

  if (signals.accuracy !== null) {
    if (signals.accuracy >= 0.8) targetDifficulty += 1;
    else if (signals.accuracy <= 0.5) targetDifficulty -= 1;
  }

  const emotionLabel = signals.dominantEmotion?.label || signals.latestEmotion?.label;
  if (emotionLabel === "frustrated" || emotionLabel === "confused" || emotionLabel === "angry") targetDifficulty -= 1;
  if (emotionLabel === "bored") targetDifficulty += 1;
  if (emotionLabel === "engaged" || emotionLabel === "focused") targetDifficulty += 0; // keep steady

  targetDifficulty = clamp(targetDifficulty, 1, 5);

  // Try questions near the target difficulty, but keep a buffer to avoid dead-ends.
  const difficultyRange = [clamp(targetDifficulty - 1, 1, 5), clamp(targetDifficulty + 1, 1, 5)];

  const baseFilter = {
    topic: topicId,
    _id: { $nin: attemptedIds },
  };

  const candidates = await Question.find({
    ...baseFilter,
    difficulty: { $gte: difficultyRange[0], $lte: difficultyRange[1] },
  })
    .select("prompt choices difficulty topic tags")
    .limit(40)
    .lean();

  if (candidates.length > 0) {
    return { question: randomPick(candidates), signals, targetDifficulty, completedAll: false };
  }

  // Fallback: any unattempted question in topic.
  const fallback = await Question.find(baseFilter).select("prompt choices difficulty topic tags").limit(40).lean();
  if (fallback.length > 0) {
    return { question: randomPick(fallback), signals, targetDifficulty, completedAll: false };
  }

  // All questions attempted; allow repeats but mark completion.
  const anyQuestion = await Question.find({ topic: topicId }).select("prompt choices difficulty topic tags").limit(40).lean();
  if (anyQuestion.length > 0) {
    return { question: randomPick(anyQuestion), signals, targetDifficulty, completedAll: true };
  }

  // No questions exist for topic.
  return { question: null, signals, targetDifficulty, completedAll: true };
}
