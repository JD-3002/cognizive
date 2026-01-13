"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { apiBaseUrl } from "../../lib/api";
import { logout } from "../../lib/auth";

type MeResponse = {
  user: { id: string; name: string; email: string; created_at: string };
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [me, setMe] = React.useState<MeResponse["user"] | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${apiBaseUrl()}/me`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Not authenticated");
        setMe(data.user);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function onLogout() {
    await logout(apiBaseUrl());
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Module 1 · Auth live
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              Your adaptive learning cockpit
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Profile secured with httpOnly cookies. Launch adaptive practice, watch signals, and track what is coming next.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white ring-1 ring-emerald-500 shadow-sm hover:bg-emerald-500"
              href="/learn"
            >
              Start adaptive practice
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-900 ring-1 ring-emerald-200 hover:bg-emerald-50"
              href="/studio"
            >
              Add topics & questions
            </Link>
            <Button type="button" onClick={onLogout}>
              Logout
            </Button>
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              href="/"
            >
              Back to home
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader title="Identity & session" subtitle="Authenticated via httpOnly cookie." />
            <CardContent>
              {loading ? (
                <div className="text-sm text-slate-600">Loading profile...</div>
              ) : me ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl bg-white ring-1 ring-slate-200 p-4">
                    <div className="text-xs text-slate-500">Name</div>
                    <div className="mt-1 font-semibold text-slate-900">{me.name}</div>
                  </div>
                  <div className="rounded-xl bg-white ring-1 ring-slate-200 p-4">
                    <div className="text-xs text-slate-500">Email</div>
                    <div className="mt-1 font-semibold text-slate-900">{me.email}</div>
                  </div>
                    <div className="rounded-xl bg-white ring-1 ring-slate-200 p-4 sm:col-span-3">
                      <div className="text-xs text-slate-500">User ID</div>
                      <div className="mt-1 font-mono text-sm break-all text-slate-800">{me.id}</div>
                    </div>
                </div>
              ) : (
                <div className="text-sm text-slate-600">No profile loaded.</div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-900 text-white p-5 shadow-lg shadow-slate-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">Adaptive readiness</p>
                  <p className="mt-1 text-lg font-semibold">Signals not connected</p>
                  <p className="mt-1 text-sm text-slate-200">
                    Emotion and engagement feed from the learn session. Start a session to light this up.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Watch
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                { title: "Emotion signals", status: "Alpha", desc: "Client-side webcam sensing; labels only." },
                { title: "Adaptive engine", status: "Alpha", desc: "Rule-based sampler live in /learn; RL up next." },
                { title: "Content brain", status: "Planned", desc: "NLP question generation + summaries." },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white/90 p-4 hover:border-emerald-200 transition"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <span className="text-xs font-semibold text-emerald-700">{item.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
