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
      <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <div className="glass rounded-3xl bg-white/70 p-8">
          <div className="eyebrow">Welcome back</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Sign in to Cognivize</h1>
          <p className="mt-3 text-sm text-slate-700 leading-relaxed">
            Your session uses secure cookies with JWT. Once logged in, head to the dashboard, generate MCQs from PDFs,
            and track adaptive progress.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
              <div className="text-xs text-emerald-700 font-semibold">Secure foundation</div>
              <div className="mt-1 text-sm text-slate-800">httpOnly cookies · CSRF-safe forms.</div>
            </div>
            <div className="rounded-2xl bg-slate-900 text-white p-4 ring-1 ring-slate-800">
              <div className="text-xs text-emerald-200 font-semibold">What’s inside</div>
              <div className="mt-1 text-sm text-slate-100">Dashboard, Studio, PDF → MCQ, adaptive attempts.</div>
            </div>
          </div>
          <div className="mt-6 text-sm text-slate-700">
            New here?{" "}
            <Link className="font-semibold text-emerald-700 hover:underline" href="/register">
              Create an account
            </Link>
          </div>
        </div>

        <div className="w-full max-w-xl lg:ml-auto">
          <Card>
            <CardHeader title="Login" subtitle="Access your dashboard and start practicing." />
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
                <Link className="text-emerald-700 font-semibold hover:underline" href="/register">
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
