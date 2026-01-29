"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "../../lib/api";
import { useEmotionSensor } from "../../lib/emotion";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";

type Topic = { id: string; title: string; slug: string };
type Question = {
  id: string;
  prompt: string;
  choices: { id: string; text: string; is_correct?: boolean }[];
  difficulty: number;
  topic: string;
};
type NextQuestionResponse = {
  question: Question;
  meta?: {
    completed_all?: boolean;
  };
};

type AttemptPayload = {
  question_id: string;
  selected_choice_id: string;
  response_time_ms?: number;
  emotion_label?: string;
};

export default function LearnPage() {
  const router = useRouter();
  const [topics, setTopics] = React.useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = React.useState<string | null>(null);
  const [question, setQuestion] = React.useState<Question | null>(null);
  const [selection, setSelection] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string>("");
  const [loadingQuestion, setLoadingQuestion] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [questionStart, setQuestionStart] = React.useState<number | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [sessionDone, setSessionDone] = React.useState(false);
  const { state: sensorState, start: startSensor, stop: stopSensor } = useEmotionSensor({
    context: question ? `question:${question.id}` : "learn-session",
    previewRef: videoRef,
  });

  React.useEffect(() => {
    async function loadTopics() {
      try {
        const data = await apiRequest<{ topics: Topic[] }>("/topics");
        setTopics(data.topics || []);
        if (data.topics?.[0]) setSelectedTopic(data.topics[0].id || (data.topics as any)[0]._id);
      } catch (err: any) {
        setStatus(err?.message || "Failed to load topics");
      }
    }
    loadTopics();
  }, []);

  React.useEffect(() => {
    if (selectedTopic) {
      fetchNextQuestion({ auto: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic]);

  async function fetchNextQuestion(opts?: { auto?: boolean; forceComplete?: boolean }) {
    if (!selectedTopic) {
      if (!opts?.auto) setStatus("Select a topic first.");
      return;
    }
    // If user already completed the topic and explicitly clicks next, show completion instead of repeats.
    if (sessionDone && !opts?.auto && !opts?.forceComplete) {
      setQuestion(null);
      setStatus("Topic complete. No more questions for now.");
      return;
    }
    setLoadingQuestion(true);
    setStatus("");
    setSelection(null);
    setSessionDone(false);
    try {
      const data = await apiRequest<NextQuestionResponse>("/sessions/next-question", {
        method: "POST",
        body: JSON.stringify({ topic_id: selectedTopic }),
      });
      setQuestion(data.question);
      setQuestionStart(Date.now());
      setSessionDone(Boolean(data.meta?.completed_all));
    } catch (err: any) {
      const message = String(err?.message || "").toLowerCase();
      if (message.includes("not authenticated")) {
        router.replace("/login");
        return;
      }
      setStatus(err?.message || "Failed to fetch question");
    } finally {
      setLoadingQuestion(false);
    }
  }

  async function submitAttempt() {
    if (!question || !selection) {
      setStatus("Pick an answer before submitting.");
      return;
    }
    setSubmitting(true);
    setStatus("");

    const payload: AttemptPayload = {
      question_id: question.id,
      selected_choice_id: selection,
    };

    if (questionStart) {
      payload.response_time_ms = Math.max(0, Date.now() - questionStart);
    }

    try {
      await apiRequest("/attempts", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStatus("Attempt logged. Grabbing the next question...");
      await fetchNextQuestion();
    } catch (err: any) {
      setStatus(err?.message || "Failed to save attempt");
    } finally {
      setSubmitting(false);
    }

    // If topic is exhausted, show completion after submitting.
    if (sessionDone) {
      setQuestion(null);
      setStatus("Topic complete. No more questions for now.");
    }
  }

  async function sendEmotion(label: string) {
    setStatus("");
    try {
      await apiRequest("/emotion-events", {
        method: "POST",
        body: JSON.stringify({ label, context: question ? `question:${question.id}` : undefined }),
      });
      setStatus(`Emotion sent: ${label}`);
    } catch (err: any) {
      setStatus(err?.message || "Failed to send emotion");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Module 2 & 3 · Adaptive + Emotion alpha
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              Practice with adaptive pacing and emotion sensing
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Pick a topic, answer a question, and watch difficulty adjust. Emotion sensing runs locally; only labels and confidence leave your browser.
            </p>
          </div>
            <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => router.push("/dashboard")} variant="secondary">
              Back to dashboard
            </Button>
            <Button type="button" onClick={() => fetchNextQuestion()} disabled={!selectedTopic || loadingQuestion}>
              {loadingQuestion ? "Loading..." : "Get next question"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader title="Topic & question" subtitle="Pick a topic; we will fetch the next best question." />
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`rounded-xl border px-4 py-2 text-sm transition ${
                      selectedTopic === topic.id
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {topic.title}
                  </button>
                ))}
                {topics.length === 0 && (
                  <p className="text-sm text-slate-600">No topics yet. Add one via the API to start practicing.</p>
                )}
              </div>

              {(!question && sessionDone) ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-700 space-y-3">
                  <div className="text-sm font-semibold text-slate-900">Topic complete.</div>
                  <div className="text-xs text-slate-600">
                    You have answered all questions for this topic. Add more in Studio or head back to the dashboard.
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={() => router.push("/studio")} variant="secondary">
                      Open Studio
                    </Button>
                    <Button type="button" onClick={() => router.push("/dashboard")}>
                      Go to dashboard
                    </Button>
                  </div>
                </div>
              ) : question ? (
                <div className="space-y-4">
                  {sessionDone && (
                    <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800 ring-1 ring-amber-200">
                      You have answered all questions for this topic before. Showing repeats.
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Question</div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                      Difficulty {question.difficulty}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900 leading-relaxed">{question.prompt}</p>
                  <div className="grid gap-2">
                    {question.choices.map((choice) => (
                      <label
                        key={choice.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                          selection === choice.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="choice"
                          value={choice.id}
                          checked={selection === choice.id}
                          onChange={() => setSelection(choice.id)}
                          className="mt-1"
                        />
                        <span className="text-sm text-slate-800">{choice.text}</span>
                      </label>
                    ))}
                  </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={submitAttempt} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit answer"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fetchNextQuestion({ forceComplete: true })}
                  disabled={loadingQuestion}
                >
                  {loadingQuestion ? "Loading..." : "Next question"}
                </Button>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>Send emotion:</span>
                      {["focused", "confused", "frustrated", "bored"].map((label) => (
                        <button
                          key={label}
                          type="button"
                          className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                          onClick={() => sendEmotion(label)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-600">
                  Choose a topic and click “Get next question” to start.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Emotion sensing (client-side)"
              subtitle="Webcam stays local; only labels/confidence are posted."
            />
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {!sensorState.running ? (
                  <Button type="button" onClick={startSensor}>
                    Enable camera & start
                  </Button>
                ) : (
                  <Button type="button" variant="secondary" onClick={stopSensor}>
                    Stop camera
                  </Button>
                )}
                <div className="text-xs text-slate-600">
                  Permission: <span className="font-semibold">{sensorState.permission}</span>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-slate-900/80">
                <video
                  ref={videoRef}
                  className="block h-64 w-full object-cover opacity-80"
                  autoPlay
                  playsInline
                  muted
                />
                {!sensorState.running && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80 bg-slate-900/60">
                    Camera preview will appear here once enabled.
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4">
                  <div className="text-xs uppercase text-slate-500">Current label</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {sensorState.currentLabel ? sensorState.currentLabel : "—"}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4">
                  <div className="text-xs uppercase text-slate-500">Confidence</div>
                  <div className="mt-1 font-mono">
                    {sensorState.confidence !== null ? sensorState.confidence.toFixed(2) : "—"}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4">
                  <div className="text-xs uppercase text-slate-500">Status</div>
                  <div className="mt-1 text-slate-800">{sensorState.status}</div>
                </div>
              </div>

              <div className="text-xs text-slate-600">
                Models load from <code>face-api.js</code>. Sensing sends labels every few seconds when confidence is high. No video frames leave your browser.
              </div>
            </CardContent>
          </Card>
        </div>

        {status && (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">{status}</div>
        )}
      </div>
    </main>
  );
}
