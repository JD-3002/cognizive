import Link from "next/link";

const stats = [
  { label: "Learner focus signals", value: "Realtime" },
  { label: "MCQs generated", value: "AI‑powered" },
  { label: "Question difficulty", value: "Adaptive" },
];

const steps = [
  { title: "Upload & ingest", desc: "Drop a PDF or paste content. We extract clean text and map it to a topic." },
  { title: "Draft MCQs", desc: "Gemini writes 1–10 focused questions with explanations. You approve before saving." },
  { title: "Deliver & adapt", desc: "Learners practice, signals feed the adaptive engine, and content keeps pace." },
];

const features = [
  { title: "Adaptive delivery", desc: "Difficulty and pacing respond to attempts and emotion signals.", badge: "Live" },
  { title: "Authoring studio", desc: "Manual and AI-drafted questions share the same clean workflow.", badge: "Improved" },
  { title: "PDF → MCQ", desc: "Upload once, get ready-to-use multiple choice sets with explanations.", badge: "New" },
];

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-20">
        {/* Hero */}
        <header className="space-y-8">
          <div className="flex items-center justify-between gap-4">
            <div className="eyebrow">Cognivize · Adaptive AI learning</div>
            <div className="hidden md:flex items-center gap-3 text-sm text-slate-700">
              <Link href="#features" className="hover:text-slate-900">
                Features
              </Link>
              <Link href="#flow" className="hover:text-slate-900">
                How it works
              </Link>
              <Link href="#cta" className="hover:text-slate-900">
                Start
              </Link>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">
                A one-page learning stack: land, onboard, generate questions, and adapt in real time.
              </h1>
              <p className="text-lg text-slate-700 leading-relaxed">
                Cognivize blends AI-authored questions, emotion-aware signals, and adaptive delivery—so every learner
                stays in the flow. No clunky funnels: just sign up, upload, and start practicing.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500"
                  href="/register"
                >
                  Get started free
                </Link>
                <Link
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
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

              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 shadow-sm glass">
                    <div className="text-xs font-semibold text-emerald-700">{s.label}</div>
                    <div className="mt-2 text-xl font-semibold text-slate-900">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">The stack</div>
                  <p className="text-sm text-slate-600">From content ingestion to adaptive delivery.</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  v0.3 beta
                </span>
              </div>
              <div className="mt-6 space-y-4" id="features">
                {features.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 hover:border-emerald-200 transition"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <span className="text-xs font-semibold text-emerald-700">{item.badge}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-slate-900 px-5 py-4 text-white">
                <div className="text-xs uppercase tracking-wide text-emerald-200/80">Promise</div>
                <p className="mt-2 text-sm leading-relaxed">
                  Less busywork. Better questions. An adaptive loop that senses when to push and when to slow down.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* How it works */}
        <section id="flow" className="section">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="space-y-3">
              <div className="eyebrow">Flow</div>
              <h2 className="text-3xl font-semibold text-slate-900">Three steps from content to adaptive practice</h2>
              <p className="text-base text-slate-700 max-w-2xl">
                A tight loop: ingest → generate → deliver. Each step is observable and editable so you stay in control.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, idx) => (
                <div key={step.title} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-700">Step {idx + 1}</span>
                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold grid place-items-center">
                      {idx + 1}
                    </div>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="section">
          <div className="glass rounded-3xl px-6 py-10 md:px-10 md:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="eyebrow">Launch ready</div>
              <h3 className="text-2xl font-semibold text-slate-900">Ship adaptive learning in one sprint.</h3>
              <p className="text-sm text-slate-700">
                Start with AI-generated MCQs, layer in emotion signals, and serve learners with a clean dashboard.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500"
                href="/register"
              >
                Create account
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                href="/login"
              >
                Login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
