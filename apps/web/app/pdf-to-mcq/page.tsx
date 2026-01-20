"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { apiBaseUrl, apiRequest } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

type Topic = { id: string; title: string; slug: string; description?: string };
type GeneratedQuestion = {
  id?: string;
  prompt: string;
  choices: { id: string; text: string; is_correct: boolean }[];
  difficulty?: number;
  tags?: string[];
  explanation?: string | null;
};

export default function PdfToMcqPage() {
  const router = useRouter();
  const [topics, setTopics] = React.useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = React.useState<string>("");
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);
  const [genStatus, setGenStatus] = React.useState("");
  const [genLoading, setGenLoading] = React.useState(false);
  const [generatedQuestions, setGeneratedQuestions] = React.useState<GeneratedQuestion[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest<{ topics: Topic[] }>("/topics");
        setTopics(data.topics || []);
        if (data.topics?.[0]) setSelectedTopicId(data.topics[0].id);
      } catch (err: any) {
        setGenStatus(err?.message || "Failed to load topics");
      }
    })();
  }, []);

  async function generateFromPdf() {
    setGenStatus("");
    if (!selectedTopicId) {
      setGenStatus("Select a topic first.");
      return;
    }
    if (!pdfFile) {
      setGenStatus("Choose a PDF to upload.");
      return;
    }
    setGenLoading(true);
    try {
      const fd = new FormData();
      fd.append("pdf", pdfFile);
      fd.append("topic_id", selectedTopicId);

      const res = await fetch(`${apiBaseUrl()}/questions/generate-from-pdf`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) {
        throw new Error(data?.error || "Generation failed");
      }
      setGeneratedQuestions(data.questions || []);
      setGenStatus(`Generated ${data.questions?.length || 0} questions. Review before using.`);
    } catch (err: any) {
      setGenStatus(err?.message || "Failed to generate questions");
    } finally {
      setGenLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-600 font-semibold">Authoring</p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">PDF → MCQ Generator</h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Upload a PDF, we’ll send the text to Gemini and draft multiple-choice questions for a topic.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => router.push("/dashboard")}>
              Back to dashboard
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/studio")}>
              Manual question authoring
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader title="Generate from PDF" subtitle="Upload a PDF, we’ll ask Gemini to draft MCQs." />
          <CardContent className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Topic</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                  >
                    <option value="">Select a topic</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">PDF</label>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-slate-500">Max 8 MB. Text is sent to Gemini to draft questions.</p>
                </div>
                <Button type="button" onClick={generateFromPdf} disabled={genLoading}>
                  {genLoading ? "Generating..." : "Generate MCQs"}
                </Button>
                {genStatus && <div className="text-sm text-slate-700">{genStatus}</div>}
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-800">Preview</div>
                {generatedQuestions.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                    No generated questions yet.
                  </div>
                )}
                {generatedQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="rounded-xl border border-slate-200 bg-white px-4 py-3 space-y-2">
                    <div className="text-sm font-semibold text-slate-800">{q.prompt}</div>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {q.choices.map((c) => (
                        <li key={c.id} className={c.is_correct ? "font-semibold text-emerald-700" : ""}>
                          {c.id}) {c.text}
                        </li>
                      ))}
                    </ul>
                    {q.explanation && <p className="text-xs text-slate-600">Why: {q.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
