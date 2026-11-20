"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Search,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { SECTION_META } from "@/lib/curriculum";
import type { SectionKey } from "@/lib/types";
import {
  EmptyState,
  ProgressBar,
  ProgressRing,
  SectionPill,
  SectionTitle,
  StatCard,
  fullDate,
  formatTime,
  type ViewProps,
} from "@/components/shared";

export default function Performance({ data, actions }: ViewProps) {
  const { metrics } = data;
  const [sectionFilter, setSectionFilter] = useState<"all" | SectionKey>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"weak" | "accuracy" | "attempted">("weak");

  const visibleStats = useMemo(() => {
    const search = query.toLowerCase().trim();
    return metrics.topicStats
      .filter((stat) => sectionFilter === "all" || stat.section === sectionFilter)
      .filter((stat) => `${stat.title} ${stat.chapterTitle}`.toLowerCase().includes(search))
      .filter((stat) => sort !== "attempted" || stat.attempted > 0)
      .sort((a, b) => {
        if (sort === "accuracy") return b.accuracy - a.accuracy || a.title.localeCompare(b.title);
        if (sort === "attempted") return b.attempted - a.attempted;
        const aScore = a.attempted ? a.accuracy : a.confidence * 25;
        const bScore = b.attempted ? b.accuracy : b.confidence * 25;
        return aScore - bScore || a.title.localeCompare(b.title);
      });
  }, [metrics.topicStats, sectionFilter, query, sort]);

  const maxTrend = Math.max(100, ...metrics.weeklyAccuracy.map((point) => point.accuracy));

  return (
    <div className="animate-slide-up">
      <SectionTitle
        eyebrow="Performance tracker"
        title="Know exactly where you stand"
        description="Every test answer is tagged by section, chapter and subtopic. Use the weak-first table to choose your next study block, then watch readiness move as you complete the routine."
        action={<div className="rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-800 ring-1 ring-slate-200">Readiness {metrics.readiness}%</div>}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Target size={20} />} label="Average accuracy" value={`${metrics.averageAccuracy}%`} hint="Across all graded questions" color="#0f9c8a" />
        <StatCard icon={<Award size={20} />} label="Topic mastery" value={`${metrics.topicsMastered}/${metrics.totalTopics}`} hint="Topics marked confident" color="#5b5bd6" />
        <StatCard icon={<BarChart3 size={20} />} label="Tests completed" value={String(metrics.testsTaken)} hint={`${metrics.sectionStats.reduce((sum, stat) => sum + stat.attempted, 0)} answers analysed`} color="#e8833a" />
        <StatCard icon={<Clock3 size={20} />} label="Study logged" value={`${(metrics.totalMinutes / 60).toFixed(1)}h`} hint={`${metrics.daysCompleted} of 60 routine days`} color="#e14f72" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="app-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">7-day accuracy trend</h2>
              <p className="mt-1 text-xs text-slate-500">Average score of tests taken on each day</p>
            </div>
            <TrendingUp size={19} className="text-teal-600" />
          </div>
          <div className="flex h-52 items-end gap-3 border-b border-slate-100 pb-2">
            {metrics.weeklyAccuracy.map((point, index) => {
              const height = point.accuracy ? Math.max(8, (point.accuracy / maxTrend) * 100) : 3;
              return (
                <div key={`${point.label}-${index}`} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-extrabold text-slate-500 opacity-0 transition group-hover:opacity-100">{point.accuracy}%</span>
                  <div className="flex w-full max-w-11 flex-1 items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-indigo-300 transition-all duration-500"
                      style={{ height: `${height}%`, opacity: point.accuracy ? 1 : 0.25 }}
                      title={`${point.label}: ${point.tests} tests`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{point.label}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-slate-500">No attempts on a day appear as a faint baseline. Take a short chapter test daily to build a meaningful trend.</p>
        </div>

        <div className="app-card flex flex-col items-center justify-center p-6">
          <ProgressRing value={metrics.readiness} size={158} stroke={13} color="#5b5bd6" label={`${metrics.readiness}%`} sublabel="Ready" />
          <h2 className="mt-5 text-lg font-extrabold text-slate-900">Exam readiness score</h2>
          <p className="mt-1 text-center text-xs leading-5 text-slate-500">A balanced signal, not just a test average. Improve it fastest by completing daily plans, fixing low-accuracy topics and taking mocks.</p>
          <div className="mt-5 w-full space-y-2.5">
            {[
              ["Routine completion", Math.round((metrics.daysCompleted / 60) * 100), "35%"],
              ["Test accuracy", metrics.averageAccuracy, "30%"],
              ["Topic mastery", Math.round((metrics.topicsMastered / Math.max(1, metrics.totalTopics)) * 100), "25%"],
              ["Mock exposure", Math.min(100, Math.round((metrics.testsTaken / 8) * 100)), "10%"],
            ].map(([label, value, weight]) => (
              <div key={label as string} className="grid grid-cols-[1fr_90px_34px] items-center gap-2 text-[11px]">
                <span className="font-semibold text-slate-600">{label}</span>
                <ProgressBar value={value as number} height={6} />
                <span className="text-right font-extrabold text-slate-500">{weight}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="app-card p-6">
          <h2 className="text-base font-extrabold text-slate-900">Section comparison</h2>
          <p className="mt-1 text-xs text-slate-500">Accuracy from answers vs. mastery from topic confidence</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {metrics.sectionStats.map((stat) => {
              const meta = SECTION_META[stat.section];
              return (
                <div key={stat.section} className="rounded-2xl border border-slate-100 p-4 text-center">
                  <ProgressRing value={stat.accuracy} size={92} stroke={8} color={meta.color} label={`${stat.accuracy}%`} />
                  <p className="mt-3 text-xs font-extrabold text-slate-800">{meta.short}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{stat.correct}/{stat.attempted} correct</p>
                  <div className="mt-3"><ProgressBar value={stat.mastery} color="#c8cbe0" height={5} /></div>
                  <p className="mt-2 text-[10px] font-bold text-slate-400">{stat.mastery}% mastery</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="app-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div><h2 className="text-base font-extrabold text-slate-900">Weak-area queue</h2><p className="mt-1 text-xs text-slate-500">Prioritised by accuracy, confidence and exam weight</p></div>
            <AlertTriangle size={19} className="text-amber-500" />
          </div>
          <div className="space-y-2.5">
            {metrics.weakAreas.slice(0, 5).map((area) => (
              <button key={area.topicId} onClick={() => actions.startQuiz({ scope: "chapter", chapterSlug: area.chapterSlug })} className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600"><Zap size={16} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-extrabold text-slate-800">{area.title}</p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">{area.chapterTitle}</p>
                </div>
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-extrabold text-slate-600">{area.attempted ? `${area.accuracy}%` : "Not started"}</span>
                <ArrowRight size={14} className="text-slate-400" />
              </button>
            ))}
          </div>
          <button className="btn-ghost mt-4 w-full" onClick={() => actions.startQuiz({ scope: "weak" })}><Target size={15} /> Start weak-area repair drill</button>
        </div>
      </section>

      <section className="mt-5 app-card p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Topic-wise performance</h2>
            <p className="mt-1 text-xs text-slate-500">{visibleStats.length} subtopics · accuracy updates after each test</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="app-input !w-48 !py-2 !pl-8 text-xs" placeholder="Search topic..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <select className="app-input !w-auto !py-2 text-xs" value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value as "all" | SectionKey)}>
              <option value="all">All sections</option>
              <option value="numerical">Numerical</option>
              <option value="verbal">Verbal</option>
              <option value="reasoning">Reasoning</option>
            </select>
            <select className="app-input !w-auto !py-2 text-xs" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
              <option value="weak">Weakest first</option>
              <option value="accuracy">Highest accuracy</option>
              <option value="attempted">Attempted only</option>
            </select>
          </div>
        </div>
        {visibleStats.length ? (
          <div className="max-h-[440px] overflow-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[760px] text-left">
              <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                <tr><th className="px-4 py-3 font-extrabold">Subtopic</th><th className="px-4 py-3 font-extrabold">Chapter</th><th className="px-4 py-3 font-extrabold">Section</th><th className="px-4 py-3 font-extrabold">Attempts</th><th className="px-4 py-3 font-extrabold">Accuracy</th><th className="px-4 py-3 font-extrabold">Confidence</th><th className="px-4 py-3 font-extrabold">Action</th></tr>
              </thead>
              <tbody>
                {visibleStats.map((stat) => (
                  <tr key={stat.topicId} className="border-t border-slate-50 text-xs hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-bold text-slate-800">{stat.title}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-slate-500">{stat.chapterTitle}</td>
                    <td className="px-4 py-3"><SectionPill section={stat.section} compact /></td>
                    <td className="px-4 py-3 font-bold text-slate-600">{stat.correct}/{stat.attempted}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={stat.accuracy} color={stat.accuracy >= 75 ? "#0f9c8a" : stat.accuracy >= 50 ? "#e8833a" : "#e14f72"} height={6} />
                        <span className="w-9 text-right font-extrabold text-slate-600">{stat.attempted ? `${stat.accuracy}%` : "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-lg px-2 py-1 text-[10px] font-bold ${stat.status === "confident" ? "bg-emerald-50 text-emerald-700" : stat.status === "learning" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                        {stat.status.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3"><button className="text-[11px] font-extrabold text-indigo-600 hover:underline" onClick={() => actions.startQuiz({ scope: "chapter", chapterSlug: stat.chapterSlug })}>Practice</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={<BookOpen size={24} />} title="No topics match" description="Clear the filters or take a test to generate topic performance data." />
        )}
      </section>

      <section className="mt-5 app-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div><h2 className="text-base font-extrabold text-slate-900">Complete test history</h2><p className="mt-1 text-xs text-slate-500">Scores are stored permanently in your planner</p></div>
          <Trophy size={19} className="text-amber-500" />
        </div>
        {data.attempts.length ? (
          <div className="grid gap-2.5 md:grid-cols-2">
            {data.attempts.map((attempt) => (
              <div key={attempt.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><CheckCircle2 size={18} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-extrabold text-slate-800">{attempt.title}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{fullDate(attempt.createdAt.slice(0, 10))} · {formatTime(attempt.seconds)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-indigo-600">{attempt.score}/{attempt.total}</p>
                  <p className="text-[10px] font-bold text-slate-400">{Math.round(attempt.accuracy)}% accuracy</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={<BarChart3 size={24} />} title="No attempts recorded" description="Take a chapter test from the Test Center to start your performance history." />
        )}
        <button className="btn-primary mt-5" onClick={() => actions.goTo("tests")}>Take another test <ArrowRight size={15} /></button>
      </section>
    </div>
  );
}
