"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { apiRequest } from "../../lib/api";

type LoginResponse = {
  user: { id: string; name: string; email: string; created_at: string };
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <div className="rounded-3xl bg-slate-900 text-white p-8 shadow-xl shadow-slate-900/20 ring-1 ring-slate-800">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">Module 1</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Access & Identity</h1>
          <p className="mt-3 text-sm text-slate-200 leading-relaxed">
            Secure sign-in for Cognivize. Your session uses httpOnly cookies and JWT to keep the adaptive, emotion-aware
            experience personalized. Logging in unlocks your dashboard, future engagement signals, and RL-tuned quizzes.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="text-xs text-emerald-200 font-semibold">Secure foundation</div>
              <div className="mt-1 text-sm text-slate-100">Cookie-based JWT, CSRF-safe forms, rate-limited flows.</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="text-xs text-emerald-200 font-semibold">Next steps</div>
              <div className="mt-1 text-sm text-slate-100">Engagement sensing + adaptive difficulty after sign-in.</div>
            </div>
          </div>
          <div className="mt-6 text-sm text-emerald-100">
            New here?{" "}
            <Link className="underline font-semibold hover:text-white" href="/register">
              Create an account
            </Link>
          </div>
        </div>

        <div className="w-full max-w-xl lg:ml-auto">
          <Card>
            <CardHeader
              title="Welcome back"
              subtitle="Log in to continue your adaptive learning journey."
            />
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
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
                  Login
                </Button>
              </form>

              <div className="mt-6 text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link className="text-slate-900 font-medium hover:underline" href="/register">
                  Create one
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
