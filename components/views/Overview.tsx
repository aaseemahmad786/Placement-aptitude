"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { PHASES, SECTION_META } from "@/lib/curriculum";
import type { DayPlanDTO, TestScope } from "@/lib/types";
import {
  ProgressBar,
  ProgressRing,
  SectionPill,
  StatCard,
  fullDate,
  planDate,
  shortDate,
  type ViewProps,
} from "@/components/shared";

function quizForPlan(plan: DayPlanDTO): { scope: TestScope; chapterSlug?: string } {
  if (plan.testKind.includes("Full")) return { scope: "full" };
  if (plan.testKind.includes("Advanced")) return { scope: "advanced" };
  if (plan.testKind.includes("Section")) return { scope: "section", chapterSlug: plan.chapterSlugs[0] };
  if (plan.testKind.includes("Final") || plan.testKind.includes("Light")) return { scope: "weak" };
  return { scope: "chapter", chapterSlug: plan.chapterSlugs[0] };
}

export default function Overview({ data, actions }: ViewProps) {
  const { metrics, dayPlans, dailyProgress, chapters } = data;
  const today = dayPlans[metrics.currentDay - 1] ?? dayPlans[0];
  const completedDays = new Set(dailyProgress.filter((day) => day.completed).map((day) => day.dayNumber));
  const upcoming = dayPlans.slice(metrics.currentDay, metrics.currentDay + 4);
  const chapterBySlug = new Map(chapters.map((chapter) => [chapter.slug, chapter]));
  const phaseRanges = [
    [1, 14],
    [15, 35],
    [36, 52],
    [53, 60],
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <section className="relative overflow-hidden rounded-[24px] bg-[#151f42] p-6 text-white shadow-[0_18px_50px_rgba(20,30,65,0.18)] sm:p-8">
        <div className="grid-pattern absolute inset-0 opacity-60" />
        <div className="absolute -right-14 -top-24 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-24 right-36 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_190px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-indigo-200">
                Today&apos;s mission · Day {metrics.currentDay} of 60
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80">
                {shortDate(new Date().toISOString().slice(0, 10))}
              </span>
            </div>
            <h1 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-[40px]">
              {today.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100/80">{today.focus}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white/90">{today.phase}</span>
              <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white/90">
                <Clock3 size={14} /> {today.targetMinutes} min
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white/90">
                <Target size={14} /> {today.testKind}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {today.chapterSlugs.slice(0, 3).map((slug) => {
                const chapter = chapterBySlug.get(slug);
                return chapter ? (
                  <span key={slug} className="rounded-lg border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-white/85">
                    {chapter.icon} {chapter.title}
                  </span>
                ) : null;
              })}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button className="btn-primary border-0 bg-white !text-[#3030a8] shadow-none" onClick={() => actions.startQuiz(quizForPlan(today))}>
                <Play size={16} fill="currentColor" /> Start today&apos;s test
              </button>
              <button className="btn-ghost border-white/20 bg-white/10 !text-white hover:!bg-white/20" onClick={() => actions.goTo("routine")}>
                <CalendarDays size={16} /> View full routine <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-5">
            <ProgressRing value={metrics.readiness} size={132} stroke={11} color="#8b8bff" label={`${metrics.readiness}%`} sublabel="Ready" light />
            <p className="mt-4 text-center text-sm font-bold">Exam readiness</p>
            <p className="mt-1 text-center text-xs leading-5 text-white/55">Blends plan completion, accuracy, mastery and mocks</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<CalendarDays size={20} />} label="60-day plan" value={`${metrics.daysCompleted}/60`} hint={`${Math.round((metrics.daysCompleted / 60) * 100)}% of routine completed`} color="#5b5bd6" />
        <StatCard icon={<Target size={20} />} label="Average accuracy" value={`${metrics.averageAccuracy}%`} hint={`${metrics.testsTaken} tests recorded`} color="#0f9c8a" />
        <StatCard icon={<Clock3 size={20} />} label="Study time" value={`${(metrics.totalMinutes / 60).toFixed(1)}h`} hint={`Goal: ${data.profile.dailyGoalMinutes} min per day`} color="#e8833a" />
        <StatCard icon={<Flame size={20} />} label="Current streak" value={`${metrics.streak} days`} hint="Consecutive completed plan days" color="#e14f72" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <div className="app-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Section readiness</h2>
              <p className="mt-1 text-xs text-slate-500">Test accuracy vs. self-rated topic mastery</p>
            </div>
            <button className="text-xs font-bold text-indigo-600 hover:underline" onClick={() => actions.goTo("performance")}>Full analytics</button>
          </div>
          <div className="space-y-5">
            {metrics.sectionStats.map((stat) => {
              const meta = SECTION_META[stat.section];
              return (
                <div key={stat.section}>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold" style={{ background: meta.soft, color: meta.color }}>{meta.icon}</span>
                      <span className="text-sm font-bold text-slate-800">{meta.label}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{stat.attempted} answers logged</span>
                  </div>
                  <div className="grid grid-cols-[70px_1fr_42px] items-center gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Accuracy</span>
                    <ProgressBar value={stat.accuracy} color={meta.color} />
                    <span className="text-right text-xs font-extrabold text-slate-700">{stat.accuracy}%</span>
                  </div>
                  <div className="mt-2 grid grid-cols-[70px_1fr_42px] items-center gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Mastery</span>
                    <ProgressBar value={stat.mastery} color="#c8cbe0" />
                    <span className="text-right text-xs font-extrabold text-slate-700">{stat.mastery}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="app-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">60-day roadmap</h2>
              <p className="mt-1 text-xs text-slate-500">Four phases from concepts to exam readiness</p>
            </div>
            <Sparkles size={19} className="text-indigo-500" />
          </div>
          <div className="space-y-3">
            {PHASES.map((phase, index) => {
              const [start, end] = phaseRanges[index];
              const done = Array.from({ length: end - start + 1 }, (_, offset) => start + offset).filter((day) => completedDays.has(day)).length;
              const percent = Math.round((done / (end - start + 1)) * 100);
              const active = metrics.currentDay >= start && metrics.currentDay <= end;
              return (
                <div key={phase.name} className={`rounded-xl border p-3.5 ${active ? "border-indigo-200 bg-indigo-50/60" : "border-slate-100 bg-slate-50/60"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${active ? "bg-indigo-600 text-white" : "bg-white text-slate-500"}`}>{index + 1}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{phase.name}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">{phase.days} · {phase.detail}</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-slate-600">{percent}%</span>
                  </div>
                  <div className="mt-3"><ProgressBar value={percent} color={active ? "#5b5bd6" : "#cbd2e4"} height={5} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr_1fr]">
        <div className="app-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Next up</h2>
            <BookOpen size={18} className="text-indigo-500" />
          </div>
          <div className="space-y-2.5">
            {upcoming.map((plan) => (
              <button key={plan.dayNumber} onClick={() => actions.goTo("routine")} className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-600">D{plan.dayNumber}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800">{plan.title}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{shortDate(planDate(data.profile.startDate, plan.dayNumber))} · {plan.targetMinutes} min</p>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        <div className="app-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Fix these next</h2>
            <Zap size={18} className="text-amber-500" />
          </div>
          <div className="space-y-2.5">
            {metrics.weakAreas.slice(0, 4).map((area) => (
              <button key={area.topicId} onClick={() => actions.startQuiz({ scope: "chapter", chapterSlug: area.chapterSlug })} className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 text-left transition hover:border-amber-200 hover:bg-amber-50/40">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600"><TrendingUp size={15} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800">{area.title}</p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">{area.chapterTitle}</p>
                </div>
                <span className="text-[11px] font-extrabold text-amber-600">{area.attempted ? `${area.accuracy}%` : "New"}</span>
              </button>
            ))}
          </div>
          <button className="mt-4 text-xs font-bold text-indigo-600 hover:underline" onClick={() => actions.goTo("syllabus")}>Open chapter syllabus →</button>
        </div>

        <div className="app-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Recent tests</h2>
            <BarChart3 size={18} className="text-teal-600" />
          </div>
          {data.attempts.length ? (
            <div className="space-y-2.5">
              {data.attempts.slice(0, 4).map((attempt) => (
                <div key={attempt.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-600"><CheckCircle2 size={15} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800">{attempt.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{fullDate(attempt.createdAt.slice(0, 10))}</p>
                  </div>
                  <span className="text-xs font-extrabold text-teal-600">{attempt.score}/{attempt.total}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
              <p className="text-sm font-bold text-slate-700">No attempts yet</p>
              <p className="mt-1 text-xs text-slate-500">Your test scores will appear here.</p>
              <button className="btn-primary mt-4" onClick={() => actions.goTo("tests")}>Take first test</button>
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-indigo-600"><Target size={19} /></span>
          <div>
            <p className="text-sm font-bold text-slate-800">Foundation pattern covered: Numerical, Verbal & Reasoning</p>
            <p className="mt-0.5 text-xs text-slate-500">Advanced quant/reasoning is included; coding is outside this aptitude planner.</p>
          </div>
        </div>
        <button className="btn-ghost" onClick={() => actions.goTo("syllabus")}>Explore {chapters.length} chapters <ArrowRight size={15} /></button>
      </div>
    </div>
  );
}
