"use client";

import type { ReactNode } from "react";
import { SECTION_META, addDays } from "@/lib/curriculum";
import type { AppData, SectionKey, TestScope, TopicStatus } from "@/lib/types";

export type TabKey = "overview" | "syllabus" | "bank" | "routine" | "tests" | "performance";
export type QuizRequest = { scope: TestScope; chapterSlug?: string; section?: SectionKey; questionIds?: number[]; topicId?: number; topicTitle?: string; title?: string };
export type DashboardActions = {
  goTo: (tab: TabKey) => void;
  openTopicNotes: (topicId: number) => void;
  openBankChapter: (chapterSlug: string) => void;
  startQuiz: (request: QuizRequest) => void;
  toggleBookmark: (questionId: number, saved: boolean) => void;
  setTopicStatus: (topicId: number, status: TopicStatus) => void;
  saveDay: (dayNumber: number, completed: boolean, minutes: number, note: string) => void;
  saveProfile: (values: { startDate: string; examDate: string | null; dailyGoalMinutes: number }) => void;
};
export type ViewProps = { data: AppData; actions: DashboardActions };
export function sectionMeta(section: SectionKey) { return SECTION_META[section]; }
export function planDate(startDate: string, dayNumber: number) { return addDays(startDate, dayNumber - 1); }
export function shortDate(iso: string) { return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }); }
export function fullDate(iso: string) { return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }); }
export function formatTime(seconds: number) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
export function topicStatus(data: AppData, topicId: number): TopicStatus { return data.topicProgress.find(entry => entry.topicId === topicId)?.status ?? "not-started"; }
export function chapterMastery(data: AppData, chapterId: number) {
  const list = data.topics.filter(topic => topic.chapterId === chapterId);
  return list.length ? Math.round(list.reduce((sum, topic) => { const status = topicStatus(data, topic.id); return sum + (status === "confident" ? 100 : status === "learning" ? 50 : 0); }, 0) / list.length) : 0;
}

export function SectionPill({ section, compact = false }: { section: SectionKey; compact?: boolean }) {
  const meta = SECTION_META[section];
  return <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide" style={{ background: meta.soft, color: meta.color }}><span className="text-[13px] leading-none">{meta.icon}</span>{compact ? meta.short : meta.label}</span>;
}
export function PriorityBadge({ priority }: { priority: string }) {
  const palette = priority === "Very High" ? "bg-rose-50 text-rose-600 ring-rose-200" : priority === "High" ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-slate-100 text-slate-600 ring-slate-200";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${palette}`}>{priority}</span>;
}
export function ProgressBar({ value, color = "#5b5bd6", height = 8 }: { value: number; color?: string; height?: number }) {
  return <div className="w-full overflow-hidden rounded-full bg-slate-100" style={{ height }}><div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} /></div>;
}
export function ProgressRing({ value, size = 116, stroke = 10, color = "#5b5bd6", label, sublabel, light = false }: { value: number; size?: number; stroke?: number; color?: string; label?: string; sublabel?: string; light?: boolean }) {
  const radius = (size - stroke) / 2, circumference = 2 * Math.PI * radius, progress = Math.max(0, Math.min(100, value));
  return <div className="relative shrink-0" style={{ width: size, height: size }}><svg width={size} height={size} className="-rotate-90"><circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={light ? "rgba(255,255,255,0.18)" : "#e9ecf4"} strokeWidth={stroke} /><circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference*(1-progress/100)} className="transition-all duration-700" /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className={`text-xl font-extrabold leading-none ${light ? "text-white" : "text-slate-900"}`}>{label ?? `${progress}%`}</span>{sublabel && <span className={`mt-1 text-[10px] font-semibold uppercase tracking-wider ${light ? "text-white/60" : "text-slate-400"}`}>{sublabel}</span>}</div></div>;
}
export function StatCard({ icon, label, value, hint, color }: { icon: ReactNode; label: string; value: string; hint: string; color: string }) {
  return <div className="app-card flex items-start gap-4 p-5"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: `${color}14`, color }}>{icon}</div><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-2xl font-extrabold leading-tight text-slate-900">{value}</p><p className="mt-1 truncate text-xs text-slate-500">{hint}</p></div></div>;
}
export function SectionTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div>{eyebrow && <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-500">{eyebrow}</p>}<h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>{description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>}</div>{action}</div>;
}
export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className="app-card flex flex-col items-center justify-center px-6 py-12 text-center"><div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-500">{icon}</div><h3 className="text-base font-bold text-slate-900">{title}</h3><p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p></div>;
}
