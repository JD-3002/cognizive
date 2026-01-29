"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ResultPayload = {
  total: number;
  answered: number;
  correct: number;
  unanswered: number;
  topicTitle?: string;
  topicId?: string;
  startedAt?: number | null;
  endedAt?: number | null;
};

export default function TestResultPage() {
  const router = useRouter();
  const [result, setResult] = React.useState<ResultPayload | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("lastTestResult");
    if (!raw) return;
    try {
      setResult(JSON.parse(raw));
    } catch {
      setResult(null);
    }
  }, []);

  if (!result) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="text-lg font-semibold text-slate-900">No recent test results.</div>
          <p className="text-sm text-slate-600">Finish a test to see a summary here.</p>
          <div className="flex justify-center gap-3">
            <Link className="rounded-xl bg-emerald-600 px-4 py-2 text-white text-sm font-semibold" href="/test">
              Back to test
            </Link>
            <Link className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200" href="/dashboard">
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const durationSec =
    result.startedAt && result.endedAt ? Math.max(0, Math.round((result.endedAt - result.startedAt) / 1000)) : null;

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="eyebrow">Test Results</div>
            <h1 className="text-3xl font-semibold text-slate-900">Summary</h1>
            {result.topicTitle && <p className="text-sm text-slate-600">Topic: {result.topicTitle}</p>}
          </div>
          <div className="flex gap-3">
            <button
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => router.push("/test")}
            >
              Retake test
            </button>
            <Link
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200"
              href="/dashboard"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Stat label="Questions" value={result.total} />
          <Stat label="Answered" value={result.answered} />
          <Stat label="Correct" value={result.correct} accent />
          <Stat label="Unanswered" value={result.unanswered} />
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-5 space-y-2">
          {durationSec !== null && (
            <p className="text-sm text-slate-700">
              Duration: <span className="font-semibold text-slate-900">{durationSec}s</span>
            </p>
          )}
          <p className="text-sm text-slate-700">
            Score:{" "}
            <span className="font-semibold text-slate-900">
              {result.correct}/{result.total} (
              {((result.correct / Math.max(1, result.total)) * 100).toFixed(0)}%)
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-800"
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
