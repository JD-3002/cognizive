import Link from "next/link";

const modules = [
  { title: "Module 1: Access & Identity", description: "Secure login, registration, and protected dashboards using cookies + JWT.", cta: "Auth live" },
  { title: "Module 2: Emotion Signals", description: "Real-time engagement sensing via webcam to adapt pacing.", cta: "Planned" },
  { title: "Module 3: Adaptive Engine", description: "RL-driven difficulty tuning based on accuracy and response time.", cta: "Planned" },
  { title: "Module 4: Content Brain", description: "NLP-powered question generation, summaries, and topic scaffolding.", cta: "Planned" },
];

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Emotion-aware adaptive AI teaching assistant
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">
              Cognivize: learn faster with an assistant that senses focus and adapts in real time.
            </h1>
            <p className="text-lg text-slate-700 leading-relaxed">
              Built to feel more human: we watch for confusion, boredom, and momentum, then tune question difficulty,
              pacing, and content. Start with secure access today—auth is live; adaptive, emotion, and content brains are
              queued next.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800"
                href="/register"
              >
                Create account
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                href="/login"
              >
                Login
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200"
                href="/dashboard"
              >
                View dashboard
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-emerald-100 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Live now</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">Module 1 — Auth & Identity</div>
                <p className="mt-1 text-sm text-slate-600">
                  Cookie-based JWT auth, secure forms, and protected routes set the foundation.
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-indigo-100 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-indigo-600 font-semibold">Up next</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">Emotion + Adaptive Engine</div>
                <p className="mt-1 text-sm text-slate-600">
                  Webcam signals + RL tuning to keep learners in the flow state.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/80 p-6 ring-1 ring-slate-200 shadow-xl shadow-slate-900/5 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Build map</div>
                <p className="text-sm text-slate-600">Foundation first, then adaptive intelligence layers.</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">v0.1 Auth</span>
            </div>
            <div className="mt-6 space-y-3">
              {modules.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <span className="text-xs font-semibold text-slate-500">{item.cta}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-slate-900 px-5 py-4 text-white">
              <div className="text-xs uppercase tracking-wide text-emerald-200/80">Vision</div>
              <p className="mt-2 text-sm leading-relaxed">
                Emotion-aware dashboards, adaptive quizzes, and NLP-generated study plans that keep every learner engaged.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
