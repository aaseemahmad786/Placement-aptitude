"use client";

import { useState, type ReactNode } from "react";
import {
  BookOpen,
  Brain,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Gauge,
  ListChecks,
  LibraryBig,
  Play,
  Search,
  ArrowRight,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { SECTION_META } from "@/lib/curriculum";
import type { SectionKey, TestScope } from "@/lib/types";
import {
  EmptyState,
  PriorityBadge,
  SectionPill,
  SectionTitle,
  fullDate,
  formatTime,
  type ViewProps,
} from "@/components/shared";

function TestCard({
  icon,
  eyebrow,
  title,
  description,
  questions,
  minutes,
  accent,
  action,
  children,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  questions: string;
  minutes: string;
  accent: string;
  action: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="app-card flex flex-col p-5">
      <div className="flex items-start justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: `${accent}14`, color: accent }}>{icon}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{eyebrow}</span>
      </div>
      <h3 className="mt-4 text-base font-extrabold text-slate-900">{title}</h3>
      <p className="mt-1.5 min-h-[40px] text-xs leading-5 text-slate-500">{description}</p>
      <div className="mt-4 flex gap-4 border-y border-slate-100 py-3 text-[11px] font-bold text-slate-600">
        <span className="flex items-center gap-1.5"><ListChecks size={14} /> {questions}</span>
        <span className="flex items-center gap-1.5"><Clock3 size={14} /> {minutes}</span>
      </div>
      {children && <div className="mt-4">{children}</div>}
      <div className="mt-auto pt-4">{action}</div>
    </div>
  );
}

export default function Tests({ data, actions }: ViewProps) {
  const [chapterSlug, setChapterSlug] = useState(data.chapters[0]?.slug ?? "");
  const [chapterSearch, setChapterSearch] = useState("");
  const selectedChapter = data.chapters.find((chapter) => chapter.slug === chapterSlug);
  const filteredChapters = data.chapters.filter((chapter) => chapter.title.toLowerCase().includes(chapterSearch.toLowerCase()));

  const start = (scope: TestScope, section?: SectionKey, slug?: string) =>
    actions.startQuiz({ scope, section, chapterSlug: slug });

  return (
    <div className="animate-slide-up">
      <SectionTitle
        eyebrow="Test center"
        title="Chapter-wise and exam-style tests"
        description="Questions are graded on the server and every answer updates your accuracy, section stats, topic-level weak areas and readiness score. Explanations appear only after submission."
        action={<div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 ring-1 ring-slate-200"><Trophy size={17} className="text-amber-500" /><span className="text-sm font-extrabold text-slate-800">{data.metrics.testsTaken} tests taken</span></div>}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-5"><div className="flex items-center gap-3"><LibraryBig size={22} className="text-indigo-600" /><div><h2 className="text-sm font-extrabold text-indigo-900">Previous-year question bank · 2021–2025</h2><p className="mt-1 text-xs text-slate-600">{data.bankQuestions.length} sourced questions, chapter filters, bookmarks and solutions.</p></div></div><button className="btn-primary" onClick={() => actions.openBankChapter("all")}>Open question bank <ArrowRight size={14} /></button></div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TestCard
          icon={<BookOpen size={21} />}
          eyebrow="8 + 50"
          title="Chapter Test"
          description="Focus on one chapter with an 8-question test and a dedicated 50-question practice bank."
          questions="8 questions"
          minutes="10–12 min"
          accent="#5b5bd6"
          action={<div className="space-y-2"><button className="btn-primary w-full" onClick={() => start("chapter", undefined, chapterSlug)} disabled={!chapterSlug}><Play size={15} fill="currentColor" /> Start chapter test</button><button className="btn-ghost w-full" onClick={() => start("practice", undefined, chapterSlug)} disabled={!chapterSlug}><ListChecks size={15} /> Practice 50 questions</button></div>}
        >
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="app-input !pl-9 !py-2 text-xs" placeholder="Filter chapter list..." value={chapterSearch} onChange={(event) => setChapterSearch(event.target.value)} />
          </div>
          <select className="app-input mt-2 text-xs" value={chapterSlug} onChange={(event) => setChapterSlug(event.target.value)}>
            {filteredChapters.map((chapter) => (
              <option key={chapter.id} value={chapter.slug}>{SECTION_META[chapter.section].short} · {chapter.title}</option>
            ))}
          </select>
          {selectedChapter && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <SectionPill section={selectedChapter.section} compact />
              <PriorityBadge priority={selectedChapter.priority} />
              <span className="text-[11px] font-semibold text-slate-500">{selectedChapter.examWeight}% weight</span>
            </div>
          )}
        </TestCard>

        <TestCard
          icon={<Target size={21} />}
          eyebrow="Sectional"
          title="Section Test"
          description="A 15-question mixed paper drawn from every chapter in one NQT foundation section."
          questions="15 questions"
          minutes="20–25 min"
          accent="#0f9c8a"
          action={
            <div className="grid grid-cols-3 gap-2">
              {(["numerical", "verbal", "reasoning"] as SectionKey[]).map((section) => (
                <button key={section} className="btn-ghost !px-2 !py-2 !text-[11px]" onClick={() => start("section", section)}>
                  {SECTION_META[section].short}
                </button>
              ))}
            </div>
          }
        >
          <div className="space-y-2">
            {(["numerical", "verbal", "reasoning"] as SectionKey[]).map((section) => {
              const chapters = data.chapters.filter((chapter) => chapter.section === section);
              return (
                <div key={section} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-[11px]">
                  <span className="font-bold text-slate-700">{SECTION_META[section].label}</span>
                  <span className="text-slate-500">{chapters.length} chapters</span>
                </div>
              );
            })}
          </div>
        </TestCard>

        <TestCard
          icon={<ClipboardCheck size={21} />}
          eyebrow="Simulation"
          title="Foundation Full Mock"
          description="A balanced 30-question paper with 10 questions from each foundation section."
          questions="30 questions"
          minutes="35–40 min"
          accent="#e8833a"
          action={<button className="btn-primary w-full" onClick={() => start("full")}><Play size={15} fill="currentColor" /> Start full mock</button>}
        >
          <div className="rounded-xl bg-orange-50 p-3 text-[11px] leading-5 text-orange-800">
            Mirrors the 75-minute exam rhythm: numerical speed, verbal precision and reasoning accuracy in one sitting.
          </div>
        </TestCard>

        <TestCard
          icon={<Brain size={21} />}
          eyebrow="Advanced"
          title="Advanced Aptitude Sprint"
          description="Harder mixed quantitative and reasoning questions from high-weight chapters."
          questions="15 questions"
          minutes="25 min"
          accent="#7757d9"
          action={<button className="btn-primary w-full" onClick={() => start("advanced")}><Play size={15} fill="currentColor" /> Start advanced sprint</button>}
        >
          <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2.5 text-[11px] font-semibold text-violet-700">
            <Zap size={14} /> Targets the Advanced Quant + Reasoning paper
          </div>
        </TestCard>

        <TestCard
          icon={<Gauge size={21} />}
          eyebrow="Personalised"
          title="Weak-Area Repair Drill"
          description="Automatically selects chapters linked to your lowest accuracy and lowest topic confidence."
          questions="10 questions"
          minutes="12–15 min"
          accent="#e14f72"
          action={<button className="btn-primary w-full" onClick={() => start("weak")}><Play size={15} fill="currentColor" /> Repair weak areas</button>}
        >
          <div className="space-y-1.5">
            {data.metrics.weakAreas.slice(0, 3).map((area) => (
              <div key={area.topicId} className="flex items-center justify-between gap-2 rounded-lg bg-rose-50 px-3 py-2 text-[11px]">
                <span className="truncate font-bold text-rose-800">{area.title}</span>
                <span className="shrink-0 font-extrabold text-rose-600">{area.attempted ? `${area.accuracy}%` : "New"}</span>
              </div>
            ))}
          </div>
        </TestCard>

        <div className="app-card flex flex-col p-5">
          <div className="flex items-start justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Sparkles size={21} /></span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Strategy</span>
          </div>
          <h3 className="mt-4 text-base font-extrabold text-slate-900">Recommended weekly test rhythm</h3>
          <div className="mt-4 space-y-2.5">
            {[
              ["Mon–Sat", "One chapter test immediately after the day's study block"],
              ["Day 7", "Section test + weekly error-log review"],
              ["Days 36–52", "Advanced sprint every alternate day"],
              ["Days 53–58", "Full mock + same-day deep analysis"],
            ].map(([label, detail]) => (
              <div key={label} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                <span className="shrink-0 text-[11px] font-extrabold text-indigo-600">{label}</span>
                <span className="text-[11px] leading-4 text-slate-600">{detail}</span>
              </div>
            ))}
          </div>
          <button className="mt-auto flex items-center gap-1 pt-5 text-xs font-bold text-indigo-600 hover:underline" onClick={() => actions.goTo("performance")}>See performance analytics <ChevronRight size={14} /></button>
        </div>
      </div>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="app-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Recent attempts</h2>
            <span className="text-xs font-semibold text-slate-500">Latest 8 tests</span>
          </div>
          {data.attempts.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                  <tr><th className="pb-2 font-extrabold">Test</th><th className="pb-2 font-extrabold">Score</th><th className="pb-2 font-extrabold">Accuracy</th><th className="pb-2 font-extrabold">Time</th><th className="pb-2 font-extrabold">Date</th></tr>
                </thead>
                <tbody>
                  {data.attempts.slice(0, 8).map((attempt) => (
                    <tr key={attempt.id} className="border-b border-slate-50 text-xs last:border-0">
                      <td className="max-w-[240px] truncate py-3 font-bold text-slate-700">{attempt.title}</td>
                      <td className="py-3 font-extrabold text-indigo-600">{attempt.score}/{attempt.total}</td>
                      <td className="py-3 font-bold text-slate-700">{Math.round(attempt.accuracy)}%</td>
                      <td className="py-3 text-slate-500">{formatTime(attempt.seconds)}</td>
                      <td className="py-3 text-slate-500">{fullDate(attempt.createdAt.slice(0, 10))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={<ClipboardCheck size={24} />} title="Your test history starts here" description="Take any test above. Scores and explanations are saved automatically." />
          )}
        </div>

        <div className="app-card p-6">
          <h2 className="text-base font-extrabold text-slate-900">How performance is tracked</h2>
          <p className="mt-1 text-xs text-slate-500">One submission updates every view in this planner.</p>
          <div className="mt-5 space-y-3">
            {[
              ["Accuracy by section", "Each answer is tagged with its NQT section.", "#5b5bd6"],
              ["Accuracy by topic", "Missed concepts surface in weak-area repair.", "#0f9c8a"],
              ["Readiness score", "Plan progress 35%, accuracy 30%, mastery 25%, mocks 10%.", "#e8833a"],
              ["Explanations", "Review the correct answer and method after every test.", "#e14f72"],
            ].map(([title, detail, color], index) => (
              <div key={title} className="flex gap-3 rounded-xl border border-slate-100 p-3.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-extrabold text-white" style={{ background: color as string }}>{index + 1}</span>
                <div><p className="text-xs font-extrabold text-slate-800">{title}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{detail}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
