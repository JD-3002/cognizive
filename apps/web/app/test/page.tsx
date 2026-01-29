"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "../../lib/api";
import { useEmotionSensor } from "../../lib/emotion";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";

type Topic = { id: string; title: string };
type Choice = { id: string; text: string; is_correct?: boolean };
type Question = { id: string; prompt: string; choices: Choice[]; difficulty?: number; topic?: string; _id?: string };

export default function TestPage() {
  const router = useRouter();
  const [topics, setTopics] = React.useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = React.useState<string>("");
  const [selectedTopicName, setSelectedTopicName] = React.useState<string>("");
  const [questionCount, setQuestionCount] = React.useState<number>(10);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [status, setStatus] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [locked, setLocked] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const { state: sensorState, start: startSensor, stop: stopSensor } = useEmotionSensor({
    context: locked ? "test-session" : "test-idle",
    previewRef: videoRef,
  });

  React.useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest<{ topics: Topic[] }>("/topics");
        setTopics(data.topics || []);
        if (data.topics?.[0]) {
          setSelectedTopic(data.topics[0].id);
          setSelectedTopicName(data.topics[0].title);
        }
      } catch (err: any) {
        setStatus(err?.message || "Failed to load topics");
      }
    })();
  }, []);

  async function loadQuestions() {
    if (!selectedTopic) {
      setStatus("Pick a topic before starting the test.");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const data = await apiRequest<{ questions: Question[] }>(`/questions?topic_id=${selectedTopic}`);
      if (!data.questions || data.questions.length === 0) {
        setStatus("No questions found for this topic. Add some in Studio first.");
        return;
      }
      const normalizeId = (q: Question) => ({ ...q, id: q.id || (q as any)._id || "" });
      const normalized = data.questions.map(normalizeId).filter((q) => q.id);
      const shuffled = [...normalized].sort(() => Math.random() - 0.5);
      const limited = shuffled.slice(0, Math.min(questionCount, shuffled.length));
      setQuestions(limited);
      setCurrentIndex(0);
      setAnswers({});
      setLocked(true);
      setStartedAt(Date.now());
      setStatus(`Test started with ${limited.length} questions. Good luck!`);
    } catch (err: any) {
      setStatus(err?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(questionId: string, choiceId: string) {
    if (!locked) return;
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  }

  async function submitExam() {
    if (questions.length === 0) return;
    setSubmitting(true);
    setStatus("Submitting your answers...");
    try {
      // Submit only answered questions; skip unanswered.
      const submissions = Object.entries(answers).map(([question_id, selected_choice_id]) =>
        apiRequest<{ attempt: { correct: boolean } }>("/attempts", {
          method: "POST",
          body: JSON.stringify({ question_id, selected_choice_id }),
        })
      );
      const attemptResults = await Promise.all(submissions);
      const correct = attemptResults.reduce((sum, res) => (res.attempt?.correct ? sum + 1 : sum), 0);
      const answered = Object.keys(answers).length;
      const total = questions.length;
      const resultPayload = {
        total,
        answered,
        correct,
        unanswered: Math.max(0, total - answered),
        startedAt,
        endedAt: Date.now(),
        topicId: selectedTopic,
        topicTitle: selectedTopicName,
      };
      if (typeof window !== "undefined") {
        window.localStorage.setItem("lastTestResult", JSON.stringify(resultPayload));
      }
      setStatus("Exam submitted. Great job!");
      setLocked(false);
      router.push("/test/result");
    } catch (err: any) {
      setStatus(err?.message || "Failed to submit exam");
    } finally {
      setSubmitting(false);
    }
  }

  function exitExam() {
    setLocked(false);
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setStatus("Exam ended. You can start again anytime.");
  }

  const currentQuestion = questions[currentIndex];
  const total = questions.length;

  return (
    <main className="min-h-screen py-12">
      <div className="w-full space-y-8 px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="eyebrow">Test Mode</div>
            <h1 className="text-3xl font-semibold text-slate-900">Sit a timed-like test experience</h1>
            <p className="text-sm text-slate-700">
              Pick a set, lock the environment, navigate with next/previous, and submit when done.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => router.push("/dashboard")}>
              Back to dashboard
            </Button>
            <Button onClick={loadQuestions} disabled={loading}>
              {loading ? "Preparing..." : locked ? "Restart test" : "Start test"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.4fr_1.1fr_0.8fr]">
          <Card>
            <CardHeader title="Test setup" subtitle="Choose topic and number of questions." />
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Topic</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  value={selectedTopic}
                  onChange={(e) => {
                    setSelectedTopic(e.target.value);
                    const t = topics.find((x) => x.id === e.target.value);
                    if (t) setSelectedTopicName(t.title);
                  }}
                  disabled={locked}
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Questions to include</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={questionCount}
                  disabled={locked}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-32 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
                <p className="text-xs text-slate-600">We’ll pull up to this many questions from the topic.</p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-800">Exam controls</div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-700">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 ring-1 ring-emerald-100">Locked while testing</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200">Next / Previous</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200">Submit & End</span>
                </div>
              </div>
              {locked && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 ring-1 ring-emerald-100">
                  Test is locked. Topic and count are frozen until you submit or exit.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader
              title={
                total > 0
                  ? `Question ${currentIndex + 1} of ${total}`
                  : "No question loaded yet"
              }
              subtitle={locked ? "Answer all you can, then submit." : "Start a test to load questions."}
            />
            <CardContent className="space-y-4">
              {/* Question navigation pills */}
              {total > 0 && (
                <div className="flex flex-wrap gap-2">
                  {questions.map((q, idx) => {
                    const answered = Boolean(answers[q.id]);
                    const isCurrent = idx === currentIndex;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-9 w-9 rounded-full text-xs font-semibold ring-1 transition ${
                          isCurrent
                            ? "bg-emerald-600 text-white ring-emerald-600"
                            : answered
                            ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
                            : "bg-white text-slate-700 ring-slate-200"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Question body */}
              {currentQuestion ? (
                <div className="space-y-3">
                  <div className="text-base font-semibold text-slate-900">{currentQuestion.prompt}</div>
                  <div className="space-y-2">
                    {currentQuestion.choices.map((c) => (
                      <label
                        key={c.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                          answers[currentQuestion.id] === c.id
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`choice-${currentQuestion.id}`}
                          checked={answers[currentQuestion.id] === c.id}
                          onChange={() => selectAnswer(currentQuestion.id, c.id)}
                          className="mt-1"
                          disabled={!locked}
                        />
                        <span className="text-sm text-slate-800">{c.text}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                      disabled={!locked || currentIndex === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
                      disabled={!locked || currentIndex === total - 1}
                    >
                      Next
                    </Button>
                    <Button type="button" onClick={submitExam} disabled={!locked || submitting}>
                      {submitting ? "Submitting..." : "Submit & End"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={exitExam} disabled={submitting}>
                      Exit without submitting
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-600">
                  Start a test to load questions into a locked environment.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emotion sensing moved from /learn */}
          <Card className="lg:col-span-1">
            <CardHeader
              title="Emotion sensing (client-side)"
              subtitle="Optional. Webcam stays local; only labels/confidence are posted."
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

              <div className="flex flex-wrap gap-2 text-xs text-slate-700">
                <span>Send emotion:</span>
                {["focused", "confused", "frustrated", "bored"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                    onClick={async () => {
                      try {
                        await apiRequest("/emotion-events", {
                          method: "POST",
                          body: JSON.stringify({ label, context: locked ? "test-session" : "test-idle" }),
                        });
                        setStatus(`Emotion sent: ${label}`);
                      } catch (err: any) {
                        setStatus(err?.message || "Failed to send emotion");
                      }
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-600">
                Models load from <code>face-api.js</code>. No video frames leave your browser; only labels/confidence are sent.
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
