"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { apiRequest } from "../../lib/api";

type RegisterResponse = {
  user: { id: string; name: string; email: string; created_at: string };
};

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiRequest<RegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-start">
        <div className="w-full max-w-xl">
          <Card>
            <CardHeader
              title="Create your account"
              subtitle="Register to unlock your adaptive, emotion-aware learning workspace."
            />
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <Input
                  label="Full name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {error ? (
                  <div className="rounded-xl bg-red-50 ring-1 ring-red-200 p-3 text-sm text-red-700">{error}</div>
                ) : null}

                <Button loading={loading} type="submit" className="w-full">
                  Create account
                </Button>
              </form>

              <div className="mt-6 text-sm text-slate-600">
                Already have an account?{" "}
                <Link className="text-slate-900 font-medium hover:underline" href="/login">
                  Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-3xl bg-white/80 p-8 ring-1 ring-slate-200 shadow-xl shadow-slate-900/5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-semibold">Cognivize Roadmap</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Adaptive, emotion-aware teaching—your profile is the launchpad.
          </h2>
          <p className="mt-3 text-sm text-slate-700 leading-relaxed">
            Profiles tie together identity, engagement signals, and the adaptive engine. As you learn, we will adjust
            difficulty, pace, and recommendations to keep you in flow.
          </p>
          <div className="mt-6 space-y-3">
            {[
              { title: "Engagement sensing", desc: "Webcam-powered signals to detect focus, confusion, or boredom." },
              { title: "Adaptive tuning", desc: "RL-backed difficulty curves that respond to accuracy and time-on-task." },
              { title: "Content brain", desc: "NLP-generated questions, summaries, and scaffolds based on your path." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <span className="text-xs font-semibold text-slate-500">Coming soon</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-slate-900 px-5 py-4 text-white">
            <div className="text-xs uppercase tracking-wide text-emerald-200/80">Why register</div>
            <p className="mt-2 text-sm leading-relaxed">
              Secure identity enables emotion-aware dashboards, adaptive quizzes, and personalized study plans tailored
              to your signals.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
