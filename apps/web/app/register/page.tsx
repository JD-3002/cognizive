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
      <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-[1fr_1fr] items-start">
        <div className="glass rounded-3xl bg-white/70 p-8">
          <div className="eyebrow">New to Cognivize</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Create an account and launch adaptive learning.
          </h2>
          <p className="mt-3 text-sm text-slate-700 leading-relaxed">
            One workspace for manual authoring, PDF → MCQ generation, and adaptive delivery. Your profile keeps progress
            and difficulty curves in sync.
          </p>
          <div className="mt-6 space-y-3">
            {[
              { title: "AI content brain", desc: "Gemini drafts MCQs with explanations—edit before saving." },
              { title: "Adaptive engine", desc: "Attempts and emotion signals shape the next question." },
              { title: "Secure by default", desc: "httpOnly cookies, JWT, and CSRF-safe forms." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-sm text-slate-700">
            Already have an account?{" "}
            <Link className="font-semibold text-emerald-700 hover:underline" href="/login">
              Login
            </Link>
          </div>
        </div>

        <div className="w-full max-w-xl lg:ml-auto">
          <Card>
            <CardHeader
              title="Create your account"
              subtitle="Register to unlock adaptive dashboards and AI question generation."
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
                <Link className="text-emerald-700 font-semibold hover:underline" href="/login">
                  Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
