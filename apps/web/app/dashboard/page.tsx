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
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-600 font-semibold">Module 1 • Auth live</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Your adaptive learning cockpit</h1>
            <p className="text-sm text-slate-600">
              Profile secured with httpOnly cookies. Emotion sensing, adaptive difficulty, and content brain connect here.
            </p>
          </div>
          <div className="flex gap-3">
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

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader title="Identity & session" subtitle="Authenticated via httpOnly cookie." />
            <CardContent>
              {loading ? (
                <div className="text-sm text-slate-600">Loading profile...</div>
              ) : me ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4">
                    <div className="text-xs text-slate-500">Name</div>
                    <div className="mt-1 font-medium">{me.name}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4">
                    <div className="text-xs text-slate-500">Email</div>
                    <div className="mt-1 font-medium">{me.email}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4 sm:col-span-2">
                    <div className="text-xs text-slate-500">User ID</div>
                    <div className="mt-1 font-mono text-sm break-all">{me.id}</div>
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
                  <p className="mt-1 text-lg font-semibold">Signal capture pending</p>
                  <p className="mt-1 text-sm text-slate-200">
                    Emotion + engagement capture will light up here once connected.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Upcoming
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                { title: "Emotion signals", status: "Planned", desc: "Webcam-based focus/frustration detection." },
                { title: "Adaptive engine", status: "Planned", desc: "RL-driven difficulty adjustments on the fly." },
                { title: "Content brain", status: "Planned", desc: "NLP question gen + summaries." },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-4 hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <span className="text-xs font-semibold text-slate-500">{item.status}</span>
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
