"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  Play,
  Save,
  Settings2,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";
import type { DayPlanDTO, TestScope } from "@/lib/types";
import {
  ProgressBar,
  SectionTitle,
  fullDate,
  planDate,
  shortDate,
  type ViewProps,
} from "@/components/shared";

function planQuiz(plan: DayPlanDTO): { scope: TestScope; chapterSlug?: string } {
  if (plan.testKind.includes("Full")) return { scope: "full" };
  if (plan.testKind.includes("Advanced")) return { scope: "advanced" };
  if (plan.testKind.includes("Section")) return { scope: "section" };
  if (plan.testKind.includes("Final") || plan.testKind.includes("Light")) return { scope: "weak" };
  return { scope: "chapter", chapterSlug: plan.chapterSlugs[0] };
}

function taskIcon(type: string) {
  if (type === "learn") return "📘";
  if (type === "practice") return "✍️";
  if (type === "test") return "⏱️";
  return "🔁";
}

function DayCard({
  plan,
  data,
  actions,
  isToday,
}: {
  plan: DayPlanDTO;
  data: ViewProps["data"];
  actions: ViewProps["actions"];
  isToday: boolean;
}) {
  const progress = data.dailyProgress.find((entry) => entry.dayNumber === plan.dayNumber);
  const completed = Boolean(progress?.completed);
  const targetMinutes = progress?.minutes || plan.targetMinutes;
  const targetNote = progress?.note ?? "";
  const [prevSyncKey, setPrevSyncKey] = useState(`${plan.dayNumber}-${targetMinutes}-${targetNote}`);
  const [minutes, setMinutes] = useState(String(targetMinutes));
  const [note, setNote] = useState(targetNote);

  const currentSyncKey = `${plan.dayNumber}-${targetMinutes}-${targetNote}`;
  if (currentSyncKey !== prevSyncKey) {
    setPrevSyncKey(currentSyncKey);
    setMinutes(String(targetMinutes));
    setNote(targetNote);
  }

  const date = planDate(data.profile.startDate, plan.dayNumber);
  const chapterBySlug = new Map(data.chapters.map((chapter) => [chapter.slug, chapter]));

  const saveNote = () => actions.saveDay(plan.dayNumber, completed, Number(minutes) || 0, note);

  return (
    <article id={`day-${plan.dayNumber}`} className={`app-card overflow-hidden ${isToday ? "ring-2 ring-indigo-200" : ""} ${completed ? "border-emerald-200" : ""}`}>
      <div className="flex flex-wrap items-start gap-4 border-b border-slate-100 p-5">
        <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${completed ? "bg-emerald-50 text-emerald-600" : isToday ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
          {completed ? <CheckCircle2 size={24} /> : <span className="text-lg font-extrabold">{plan.dayNumber}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">Day {plan.dayNumber}</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{plan.phase}</span>
            {isToday && <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">Today</span>}
            {plan.isMilestone && <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">Milestone</span>}
            {completed && <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">Completed</span>}
          </div>
          <h3 className="mt-2 text-base font-extrabold text-slate-900">{plan.title}</h3>
          <p className="mt-1 text-xs text-slate-500">{plan.focus}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><CalendarDays size={13} /> {fullDate(date)}</span>
            <span className="flex items-center gap-1.5"><Timer size={13} /> {plan.targetMinutes} min target</span>
            <span className="flex items-center gap-1.5"><Target size={13} /> {plan.testKind}</span>
          </div>
        </div>
        <button
          onClick={() => actions.startQuiz(planQuiz(plan))}
          className="btn-ghost shrink-0 !px-3 !py-2 text-xs"
        >
          <Play size={13} fill="currentColor" /> Practice test
        </button>
      </div>

      <div className="p-5">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {plan.chapterSlugs.slice(0, 5).map((slug) => {
            const chapter = chapterBySlug.get(slug);
            return chapter ? (
              <span key={slug} className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                {chapter.icon} {chapter.title}
              </span>
            ) : null;
          })}
        </div>

        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Today&apos;s chapter-wise topic routine</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {plan.topicTitles.slice(0, 8).map((topic) => (
            <span key={topic} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">{topic}</span>
          ))}
        </div>

        <div className="grid gap-2 lg:grid-cols-2">
          {plan.tasks.map((task, index) => (
            <div key={`${task.label}-${index}`} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <span className="text-base leading-none">{taskIcon(task.type)}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-extrabold text-slate-800">{task.label}</p>
                  <span className="shrink-0 text-[10px] font-extrabold text-slate-500">{task.minutes}m</span>
                </div>
                <p className="mt-1 text-[11px] leading-4 text-slate-500">{task.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Minutes studied</span>
            <input type="number" min="0" max="600" className="app-input !w-32 !py-2" value={minutes} onChange={(event) => setMinutes(event.target.value)} />
          </label>
          <label className="flex min-w-[210px] flex-1 flex-col gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Reflection / error-log note</span>
            <input className="app-input !py-2" placeholder="Example: revise successive percentage traps" value={note} onChange={(event) => setNote(event.target.value)} onBlur={saveNote} />
          </label>
          <button className="btn-ghost !py-2.5" onClick={saveNote}><Save size={14} /> Save note</button>
          <button
            className={completed ? "btn-ghost !border-emerald-200 !bg-emerald-50 !py-2.5 !text-emerald-700" : "btn-primary !py-2.5"}
            onClick={() => actions.saveDay(plan.dayNumber, !completed, Number(minutes) || 0, note)}
          >
            <Check size={15} /> {completed ? "Mark pending" : "Mark complete"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Routine({ data, actions }: ViewProps) {
  const currentWeek = Math.ceil(data.metrics.currentDay / 7);
  const [weekFilter, setWeekFilter] = useState<number | "all">(currentWeek);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "done" | "milestone">("all");
  const profileKey = `${data.profile.startDate}-${data.profile.examDate ?? ""}-${data.profile.dailyGoalMinutes}`;
  const [prevProfileKey, setPrevProfileKey] = useState(profileKey);
  const [settings, setSettings] = useState({
    startDate: data.profile.startDate,
    examDate: data.profile.examDate ?? "",
    dailyGoalMinutes: data.profile.dailyGoalMinutes,
  });

  if (profileKey !== prevProfileKey) {
    setPrevProfileKey(profileKey);
    setSettings({
      startDate: data.profile.startDate,
      examDate: data.profile.examDate ?? "",
      dailyGoalMinutes: data.profile.dailyGoalMinutes,
    });
  }
  const [saved, setSaved] = useState(false);

  const completedSet = useMemo(
    () => new Set(data.dailyProgress.filter((entry) => entry.completed).map((entry) => entry.dayNumber)),
    [data.dailyProgress],
  );

  const visiblePlans = data.dayPlans.filter((plan) => {
    const week = Math.ceil(plan.dayNumber / 7);
    if (weekFilter !== "all" && week !== weekFilter) return false;
    if (statusFilter === "pending" && completedSet.has(plan.dayNumber)) return false;
    if (statusFilter === "done" && !completedSet.has(plan.dayNumber)) return false;
    if (statusFilter === "milestone" && !plan.isMilestone) return false;
    return true;
  });

  return (
    <div className="animate-slide-up">
      <SectionTitle
        eyebrow="60-day sprint"
        title="Your daily & topic-wise routine"
        description="Days 1–35 complete the entire chapter syllabus, Days 36–52 build advanced mixed speed, and Days 53–60 are full mocks and final revision. Mark days complete to update readiness automatically."
        action={<div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 ring-1 ring-slate-200"><Flame size={17} className="text-orange-500" /><span className="text-sm font-extrabold text-slate-800">{data.metrics.streak} day streak</span></div>}
      />

      <div className="app-card mb-5 p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Settings2 size={19} /></span>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Plan settings</h2>
              <p className="mt-0.5 text-xs text-slate-500">Dates shift all 60 day cards; your completion history stays attached to day numbers.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Start date</span>
              <input type="date" className="app-input !w-auto !py-2" value={settings.startDate} onChange={(event) => setSettings({ ...settings, startDate: event.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Target exam date</span>
              <input type="date" className="app-input !w-auto !py-2" value={settings.examDate} onChange={(event) => setSettings({ ...settings, examDate: event.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Daily goal (min)</span>
              <input type="number" min="30" max="240" className="app-input !w-32 !py-2" value={settings.dailyGoalMinutes} onChange={(event) => setSettings({ ...settings, dailyGoalMinutes: Number(event.target.value) })} />
            </label>
            <button
              className="btn-primary !py-2.5"
              onClick={() => {
                actions.saveProfile({
                  startDate: settings.startDate,
                  examDate: settings.examDate || null,
                  dailyGoalMinutes: settings.dailyGoalMinutes,
                });
                setSaved(true);
                window.setTimeout(() => setSaved(false), 1800);
              }}
            >
              {saved ? <Check size={15} /> : <Save size={15} />} {saved ? "Saved" : "Save plan"}
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Plan window</p><p className="mt-1 text-xs font-bold text-slate-700">{shortDate(data.profile.startDate)} → {shortDate(planDate(data.profile.startDate, 60))}</p></div>
          <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Completion</p><div className="mt-2 flex items-center gap-3"><ProgressBar value={(data.metrics.daysCompleted / 60) * 100} height={6} /><span className="text-xs font-extrabold text-slate-700">{data.metrics.daysCompleted}/60</span></div></div>
          <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total logged time</p><p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-700"><Clock3 size={13} /> {(data.metrics.totalMinutes / 60).toFixed(1)} hours · {data.metrics.currentDay === 60 ? "final day" : `day ${data.metrics.currentDay}`}</p></div>
        </div>
      </div>

      <div className="app-card mb-5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">60-day completion map</h2>
            <p className="mt-1 text-xs text-slate-500">Click a day to jump to its week. Gold outlines mark weekly milestones and mock checkpoints.</p>
          </div>
          <Sparkles size={19} className="text-amber-500" />
        </div>
        <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] gap-1.5 sm:grid-cols-[repeat(15,minmax(0,1fr))] lg:grid-cols-[repeat(20,minmax(0,1fr))]">
          {data.dayPlans.map((plan) => {
            const complete = completedSet.has(plan.dayNumber);
            const current = plan.dayNumber === data.metrics.currentDay;
            return (
              <button
                key={plan.dayNumber}
                title={`Day ${plan.dayNumber}: ${plan.title}`}
                onClick={() => {
                  setWeekFilter(Math.ceil(plan.dayNumber / 7));
                  window.setTimeout(() => document.getElementById(`day-${plan.dayNumber}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
                }}
                className={`aspect-square rounded-md text-[9px] font-extrabold transition hover:scale-110 ${complete ? "bg-emerald-500 text-white" : current ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"} ${plan.isMilestone && !complete ? "ring-2 ring-amber-300 ring-offset-1" : ""}`}
              >
                {plan.dayNumber}
              </button>
            );
          })}
        </div>
      </div>

      <div className="app-card mb-5 flex flex-wrap items-center gap-3 p-3">
        <span className="ml-1 text-xs font-bold text-slate-500">Week</span>
        <button onClick={() => setWeekFilter("all")} className={`rounded-lg px-3 py-2 text-xs font-bold ${weekFilter === "all" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>All 60</button>
        {Array.from({ length: 9 }, (_, index) => index + 1).map((week) => (
          <button key={week} onClick={() => setWeekFilter(week)} className={`rounded-lg px-3 py-2 text-xs font-bold ${weekFilter === week ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
            W{week}{week === currentWeek ? " •" : ""}
          </button>
        ))}
        <div className="ml-auto flex gap-1.5">
          {(["all", "pending", "done", "milestone"] as const).map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`rounded-lg px-2.5 py-2 text-[11px] font-bold capitalize ${statusFilter === status ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}>{status}</button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">{visiblePlans.length} day plans shown</p>
        <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline" onClick={() => actions.goTo("tests")}>Open test center <ChevronRight size={14} /></button>
      </div>

      <div className="space-y-4">
        {visiblePlans.map((plan) => (
          <DayCard key={plan.dayNumber} plan={plan} data={data} actions={actions} isToday={plan.dayNumber === data.metrics.currentDay} />
        ))}
      </div>
    </div>
  );
}
