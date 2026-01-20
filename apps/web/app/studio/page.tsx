"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

type Topic = { id: string; title: string; slug: string; description?: string };

const defaultChoices = [
  { id: "a", text: "", is_correct: false },
  { id: "b", text: "", is_correct: false },
  { id: "c", text: "", is_correct: false },
];

export default function StudioPage() {
  const router = useRouter();
  const [topics, setTopics] = React.useState<Topic[]>([]);
  const [status, setStatus] = React.useState<string>("");

  // topic form
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");

  // question form
  const [selectedTopicId, setSelectedTopicId] = React.useState<string>("");
  const [prompt, setPrompt] = React.useState("");
  const [difficulty, setDifficulty] = React.useState(3);
  const [tags, setTags] = React.useState("");
  const [choices, setChoices] = React.useState(defaultChoices);

  React.useEffect(() => {
    loadTopics();
  }, []);

  async function loadTopics() {
    try {
      const data = await apiRequest<{ topics: Topic[] }>("/topics");
      setTopics(data.topics || []);
      if (data.topics?.[0]) setSelectedTopicId(data.topics[0].id);
    } catch (err: any) {
      setStatus(err?.message || "Failed to load topics");
    }
  }

  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 140);
  }

  async function createTopic() {
    setStatus("");
    try {
      const body = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        description: description.trim() || undefined,
      };
      await apiRequest("/topics", { method: "POST", body: JSON.stringify(body) });
      setStatus("Topic created.");
      setTitle("");
      setSlug("");
      setDescription("");
      await loadTopics();
    } catch (err: any) {
      setStatus(err?.message || "Failed to create topic");
    }
  }

  function updateChoiceText(index: number, value: string) {
    setChoices((prev) => prev.map((c, i) => (i === index ? { ...c, text: value } : c)));
  }

  function markCorrect(index: number) {
    setChoices((prev) => prev.map((c, i) => ({ ...c, is_correct: i === index })));
  }

  async function createQuestion() {
    setStatus("");
    if (!selectedTopicId) {
      setStatus("Select a topic first.");
      return;
    }
    const hasCorrect = choices.some((c) => c.is_correct);
    if (!hasCorrect) {
      setStatus("Mark one choice as correct.");
      return;
    }
    try {
      const payload = {
        topic_id: selectedTopicId,
        prompt: prompt.trim(),
        difficulty,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        choices: choices.map((c) => ({ ...c, text: c.text.trim() })),
      };
      await apiRequest("/questions", { method: "POST", body: JSON.stringify(payload) });
      setStatus("Question created.");
      setPrompt("");
      setDifficulty(3);
      setTags("");
      setChoices(defaultChoices);
    } catch (err: any) {
      setStatus(err?.message || "Failed to create question");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-600 font-semibold">Authoring</p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">Create topics & questions</h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Add topics, then draft questions with choices and difficulty. Uses the same API the learner consumes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => router.push("/dashboard")}>
              Back to dashboard
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/pdf-to-mcq")}>
              PDF → MCQ Generator
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="New topic" subtitle="Create a topic slug + description." />
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Algebra Basics" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Slug</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="algebra-basics"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  rows={3}
                  placeholder="Intro to linear equations and factoring."
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={createTopic} disabled={!title.trim()}>
                  Save topic
                </Button>
                <div className="text-xs text-slate-600">
                  Existing topics: {topics.length > 0 ? topics.map((t) => t.title).join(", ") : "none yet"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="New question" subtitle="Attach to a topic, add choices, mark the correct one." />
            <CardContent className="space-y-4">
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
                <label className="text-sm font-medium text-slate-700">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  rows={3}
                  placeholder="What is the value of x in 2x + 3 = 7?"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Difficulty (1-5)</label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={difficulty}
                    onChange={(e) => setDifficulty(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tags (comma-separated)</label>
                  <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="algebra, linear-equations"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-800">Choices</div>
                {choices.map((choice, idx) => (
                  <div
                    key={choice.id}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                      choice.is_correct ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="correct"
                      checked={choice.is_correct}
                      onChange={() => markCorrect(idx)}
                    />
                    <Input
                      value={choice.text}
                      onChange={(e) => updateChoiceText(idx, e.target.value)}
                      placeholder={`Choice ${choice.id.toUpperCase()}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={createQuestion} disabled={!prompt.trim() || !selectedTopicId}>
                  Save question
                </Button>
                <Button type="button" variant="secondary" onClick={() => setChoices(defaultChoices)}>
                  Reset choices
                </Button>
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
