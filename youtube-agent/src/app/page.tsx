'use client';

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlarmClock,
  ArrowUpRight,
  Loader2,
  PlayCircle,
  Sparkles,
  Wand2,
  Youtube,
} from "lucide-react";

type VideoInsight = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  channel: string;
  views: number;
  ago: string;
  description: string;
  score: number;
  relevance: number;
  highlights: string[];
};

type OutlineSegment = {
  title: string;
  durationHint: string;
  talkingPoints: string[];
  brollIdeas: string[];
};

type ScriptSection = {
  heading: string;
  paragraphs: string[];
  callout?: string;
};

type AnalysisResponse = {
  query: string;
  summary: string;
  hookIdeas: string[];
  narrativeAngle: string;
  keyThemes: string[];
  actionItems: string[];
  seo: {
    titleIdeas: string[];
    description: string;
    tags: string[];
  };
  outline: OutlineSegment[];
  script: ScriptSection[];
  inspiration: VideoInsight[];
  metadata: {
    requestedAudience?: string;
    tone?: string;
    durationHint?: string;
    language?: string;
  };
};

const quickStarts = [
  "AI tools for small business owners",
  "Indian stock market weekly update",
  "Bollywood celebrity wellness trends",
  "How to grow on YouTube Shorts",
];

const formatViews = (views: number) => {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1000) return `${Math.round(views / 1000)}k`;
  return views.toLocaleString();
};

const shimmerClass =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent dark:before:via-white/10";

const defaultFormState = {
  topic: "",
  description: "",
  audience: "Ambitious content creators",
  style: "Energetic and data-backed",
  duration: "7-9 minutes",
  language: "English",
};

export default function Home() {
  const [form, setForm] = useState(defaultFormState);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasResults = Boolean(analysis);

  const submitDisabled = loading || form.topic.trim().length < 3;

  const themesHighlight = useMemo(() => analysis?.keyThemes.slice(0, 3) ?? [], [analysis]);

  const handleAnalyze = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Failed to analyze the topic.");
        return;
      }

      setAnalysis(payload as AnalysisResponse);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStart = (value: string) => {
    setForm((prev) => ({ ...prev, topic: value }));
  };

  const handleReset = () => {
    setForm(defaultFormState);
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-16 text-slate-50">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(147,51,234,0.35),_transparent_60%)]" />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 ring-1 ring-sky-400/40">
            <Youtube className="h-6 w-6 text-sky-300" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-200/60">Agentic Studio</p>
            <h1 className="text-2xl font-semibold text-white">YouTube Trend Navigator</h1>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white/50 hover:text-white"
        >
          Reset
        </button>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-10 px-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="flex flex-col gap-6 self-start rounded-3xl border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-sky-500/10 p-2">
              <Sparkles className="h-5 w-5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Command your agent</h2>
              <p className="text-sm text-slate-200/70">
                Describe the story you want and the agent will research the winning playbook.
              </p>
            </div>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleAnalyze}>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-200/60">
                Topic / Mission
              </label>
              <textarea
                className="h-32 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white shadow-inner outline-none transition focus:border-sky-400/70 focus:ring-4 focus:ring-sky-400/20"
                value={form.topic}
                onChange={(event) => setForm((prev) => ({ ...prev, topic: event.target.value }))}
                placeholder="Example: Decode the latest AI breakthroughs for Indian SaaS founders..."
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-200/60">
                Additional context
              </label>
              <textarea
                className="h-24 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/70 focus:ring-4 focus:ring-sky-400/20"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Goals, angles, pain points, mandatory talking points..."
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-200/60">
                  Target audience
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/70 focus:ring-4 focus:ring-sky-400/20"
                  value={form.audience}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, audience: event.target.value }))
                  }
                  placeholder="Ex: First-time founders, college students..."
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-200/60">
                  Tone / style
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/70 focus:ring-4 focus:ring-sky-400/20"
                  value={form.style}
                  onChange={(event) => setForm((prev) => ({ ...prev, style: event.target.value }))}
                  placeholder="Energetic, storytelling, investigative..."
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-200/60">
                  Ideal duration
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/70 focus:ring-4 focus:ring-sky-400/20"
                  value={form.duration}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, duration: event.target.value }))
                  }
                  placeholder="5 minutes, 12 minutes..."
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-200/60">
                  Language
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/70 focus:ring-4 focus:ring-sky-400/20"
                  value={form.language}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, language: event.target.value }))
                  }
                  placeholder="English, Hinglish..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitDisabled}
              className={`flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-500/30 transition hover:from-sky-300 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 ${
                loading ? "animate-pulse" : ""
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Crunching signal…
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate strategy
                </>
              )}
            </button>

            {error ? (
              <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-100">
                {error}
              </p>
            ) : null}
          </form>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/40">
              Quick briefs
            </p>
            <div className="flex flex-wrap gap-3">
              {quickStarts.map((item) => (
                <button
                  key={item}
                  onClick={() => handleQuickStart(item)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 transition hover:border-sky-400/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          {!hasResults ? (
            <div className={`grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 ${shimmerClass}`}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/5 rounded-full bg-white/10" />
                  <div className="h-3 w-2/5 rounded-full bg-white/5" />
                </div>
              </div>
              <div className="h-24 rounded-3xl bg-white/5" />
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="h-32 rounded-3xl bg-white/5" />
                <div className="h-32 rounded-3xl bg-white/5" />
                <div className="h-32 rounded-3xl bg-white/5" />
              </div>
              <p className="text-center text-sm text-white/60">
                Feed me a topic to start the agentic workflow.
              </p>
            </div>
          ) : null}

          {analysis ? (
            <>
              <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 to-transparent p-8 shadow-2xl shadow-sky-500/10 backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-200/60">
                      Strategy summary
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      {analysis.query}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-100/80">
                    <AlarmClock className="h-4 w-4" />
                    <span>{analysis.metadata.durationHint ?? form.duration}</span>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-100/80">{analysis.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {themesHighlight.map((theme) => (
                    <span
                      key={theme}
                      className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-200"
                    >
                      #{theme}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center gap-2 text-sky-200">
                    <Sparkles className="h-4 w-4" />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200/80">
                      Hook & title lab
                    </h3>
                  </div>
                  <p className="text-sm text-slate-100/90">{analysis.narrativeAngle}</p>
                  <div className="space-y-3">
                    {analysis.hookIdeas.map((hook) => (
                      <p
                        key={hook}
                        className="rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-3 text-sm text-white/90 shadow-inner"
                      >
                        {hook}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center gap-2 text-indigo-200">
                    <PlayCircle className="h-4 w-4" />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-200/80">
                      SEO control room
                    </h3>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/40">Title ideas</p>
                    <ul className="mt-2 space-y-2 text-sm text-white/90">
                      {analysis.seo.titleIdeas.map((title) => (
                        <li key={title} className="rounded-xl bg-white/5 px-3 py-2">
                          {title}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/40">Description</p>
                    <p className="mt-2 rounded-xl bg-white/5 px-3 py-3 text-sm text-white/80">
                      {analysis.seo.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/40">Tags</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {analysis.seo.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-emerald-200">
                  <Wand2 className="h-4 w-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200/80">
                    Action plan
                  </h3>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-white/80">
                  {analysis.actionItems.map((item) => (
                    <li
                      key={item}
                      className="rounded-2xl border border-white/5 bg-emerald-500/10 px-4 py-3 text-white/80"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-amber-200">
                  <Sparkles className="h-4 w-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-200/80">
                    Outline
                  </h3>
                </div>
                <div className="mt-4 space-y-5">
                  {analysis.outline.map((segment) => (
                    <div
                      key={segment.title}
                      className="rounded-2xl border border-white/5 bg-slate-950/40 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="text-base font-semibold text-white">{segment.title}</h4>
                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">
                          {segment.durationHint}
                        </span>
                      </div>
                      <ul className="mt-3 space-y-2 text-sm text-white/80">
                        {segment.talkingPoints.map((point) => (
                          <li key={point} className="flex gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-white/60" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {segment.brollIdeas.map((idea) => (
                          <span
                            key={idea}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
                          >
                            {idea}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-pink-200">
                  <PlayCircle className="h-4 w-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-200/80">
                    Script draft
                  </h3>
                </div>
                <div className="mt-5 space-y-5">
                  {analysis.script.map((section) => (
                    <div key={section.heading} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                      <h4 className="text-base font-semibold text-white">{section.heading}</h4>
                      <div className="mt-3 space-y-3 text-sm text-white/80">
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                      {section.callout ? (
                        <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                          {section.callout}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-sky-200">
                  <Youtube className="h-4 w-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200/80">
                    Reference intelligence
                  </h3>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {analysis.inspiration.map((video) => (
                    <div
                      key={video.id}
                      className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 transition hover:border-sky-400/50"
                    >
                      <div className="relative aspect-video overflow-hidden bg-slate-900">
                        {video.thumbnail ? (
                          <Image
                            src={video.thumbnail}
                            alt={video.title}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-white/40">
                            No thumbnail
                          </div>
                        )}
                      </div>
                      <div className="space-y-3 px-4 py-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="clamp-2 text-sm font-semibold text-white">
                              {video.title}
                            </h4>
                            <p className="mt-1 text-xs text-white/60">{video.channel}</p>
                          </div>
                          <Link
                            href={video.url}
                            target="_blank"
                            className="text-xs text-sky-300 transition hover:text-sky-100"
                          >
                            Watch
                            <ArrowUpRight className="ml-1 inline h-4 w-4" />
                          </Link>
                        </div>
                        <div className="flex gap-3 text-xs text-white/60">
                          <span>{formatViews(video.views)} views</span>
                          <span>•</span>
                          <span>{video.ago}</span>
                        </div>
                        <p className="clamp-2 text-xs text-white/50">{video.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {video.highlights.map((highlight) => (
                            <span
                              key={highlight}
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
}
