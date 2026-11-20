"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Flame,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import type { AppData, TopicStatus } from "@/lib/types";
import { ProgressBar, type DashboardActions, type QuizRequest, type TabKey } from "@/components/shared";
import Overview from "@/components/views/Overview";
import Syllabus from "@/components/views/Syllabus";
import Routine from "@/components/views/Routine";
import Tests from "@/components/views/Tests";
import Performance from "@/components/views/Performance";
import QuestionBank from "@/components/views/QuestionBank";
import LearningNotes from "@/components/LearningNotes";
import QuizRunner, { type QuizSession } from "@/components/QuizRunner";

const navItems: { key: TabKey; label: string; icon: LucideIcon; hint: string }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard, hint: "Today & progress" },
  { key: "bank", label: "Question Bank", icon: LibraryBig, hint: "2021–2025 chapter-wise PYQs" },
  { key: "syllabus", label: "Syllabus", icon: BookOpen, hint: "Chapters & topics" },
  { key: "routine", label: "60-Day Routine", icon: CalendarDays, hint: "Daily study plan" },
  { key: "tests", label: "Tests", icon: ClipboardCheck, hint: "Quizzes & mocks" },
  { key: "performance", label: "Performance", icon: BarChart3, hint: "Scores & analytics" },
];

const tabTitles: Record<TabKey, { title: string; subtitle: string }> = {
  overview: { title: "Preparation overview", subtitle: "Your complete TCS NQT aptitude command center" },
  bank: { title: "Question bank", subtitle: "2021–2025 chapter-wise memory-based TCS questions" },
  syllabus: { title: "Aptitude syllabus", subtitle: "Chapter-wise concepts and topic routines" },
  routine: { title: "60-day routine", subtitle: "Structured daily practice from Day 1 to exam day" },
  tests: { title: "Practice tests", subtitle: "Chapter, sectional, advanced and full mock assessments" },
  performance: { title: "Performance analytics", subtitle: "Accuracy, mastery and weak-area intelligence" },
};

export default function PrepDashboard({ initialData }: { initialData: AppData }) {
  const [data, setData] = useState<AppData>(initialData);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [bankChapter, setBankChapter] = useState("all");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "error" | "success" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function refresh() {
    const response = await fetch("/api/app-data", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not refresh planner data");
    setData((await response.json()) as AppData);
  }

  async function postJson(url: string, body: unknown) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Request failed");
  }

  function goTo(tab: TabKey) {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function startQuiz(request: QuizRequest) {
    setQuizLoading(true);
    try {
      const response = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const payload = (await response.json()) as Omit<QuizSession, "id"> & { error?: string };
      if (!response.ok || !payload.questions?.length) throw new Error(payload.error || "No questions were available");
      setQuizSession({ ...payload, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "Could not start test", tone: "error" });
    } finally {
      setQuizLoading(false);
    }
  }

  const actions: DashboardActions = useMemo(
    () => ({
      goTo,
      startQuiz,
      openTopicNotes: (topicId: number) => setSelectedTopicId(topicId),
      openBankChapter: (slug: string) => { setBankChapter(slug); goTo("bank"); },
      toggleBookmark: async (questionId: number, saved: boolean) => {
        setData(previous => ({ ...previous, bookmarkedQuestionIds: saved ? [...new Set([...previous.bookmarkedQuestionIds, questionId])] : previous.bookmarkedQuestionIds.filter(id => id !== questionId) }));
        try { await postJson("/api/bookmarks", { questionId, saved }); }
        catch { setToast({ message: "Could not save bookmark", tone: "error" }); }
      },
      setTopicStatus: async (topicId: number, status: TopicStatus) => {
        const confidence = status === "confident" ? 2 : status === "learning" ? 1 : 0;
        setData((previous) => ({
          ...previous,
          topicProgress: [
            ...previous.topicProgress.filter((entry) => entry.topicId !== topicId),
            { topicId, status, confidence, updatedAt: new Date().toISOString() },
          ],
        }));
        try {
          await postJson("/api/topic", { topicId, status });
          await refresh();
        } catch {
          setToast({ message: "Could not save topic confidence", tone: "error" });
        }
      },
      saveDay: async (dayNumber: number, completed: boolean, minutes: number, note: string) => {
        setData((previous) => ({
          ...previous,
          dailyProgress: [
            ...previous.dailyProgress.filter((entry) => entry.dayNumber !== dayNumber),
            { dayNumber, completed, minutes, note, updatedAt: new Date().toISOString() },
          ],
        }));
        try {
          await postJson("/api/day", { dayNumber, completed, minutes, note });
          await refresh();
        } catch {
          setToast({ message: "Could not save day progress", tone: "error" });
        }
      },
      saveProfile: async (values) => {
        setData((previous) => ({ ...previous, profile: values }));
        try {
          await postJson("/api/profile", values);
          await refresh();
          setToast({ message: "60-day plan settings saved", tone: "success" });
        } catch {
          setToast({ message: "Could not save plan settings", tone: "error" });
        }
      },
    }),
    [],
  );

  const viewProps = { data, actions };
  const title = tabTitles[activeTab];

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-[258px] shrink-0 flex-col bg-[#111b35] px-4 py-6 text-white lg:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 shadow-lg shadow-indigo-900/40"><GraduationCap size={23} /></div>
          <div>
            <p className="text-base font-extrabold leading-tight tracking-tight">NQT Compass</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-300">Aptitude planner</p>
          </div>
        </div>

        <div className="mt-8 px-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/35">Workspace</div>
        <nav className="mt-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => goTo(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${active ? "bg-white/12 text-white shadow-sm" : "text-white/60 hover:bg-white/6 hover:text-white"}`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${active ? "bg-indigo-500 text-white" : "bg-white/8 text-white/70"}`}><Icon size={18} /></span>
                <span className="min-w-0"><span className="block text-sm font-bold">{item.label}</span><span className="mt-0.5 block truncate text-[10px] text-white/40">{item.hint}</span></span>
                {active && <span className="ml-auto h-7 w-1 rounded-full bg-indigo-400" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/6 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/50">Your readiness</span>
            <Sparkles size={15} className="text-indigo-300" />
          </div>
          <p className="mt-2 text-3xl font-extrabold">{data.metrics.readiness}%</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-teal-300 transition-all" style={{ width: `${data.metrics.readiness}%` }} /></div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-white/55">
            <span className="flex items-center gap-1.5"><Flame size={13} className="text-orange-300" /> {data.metrics.streak} day streak</span>
            <span>Day {data.metrics.currentDay}/60</span>
          </div>
        </div>
        <p className="mt-4 px-2 text-center text-[10px] leading-4 text-white/30">35 chapters · {data.topics.length} topics · 60-day sprint</p>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-7">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white"><GraduationCap size={19} /></div>
              <span className="text-sm font-extrabold">NQT Compass</span>
            </div>
            <div className="hidden min-w-0 lg:block">
              <h1 className="truncate text-lg font-extrabold text-slate-900">{title.title}</h1>
              <p className="mt-0.5 truncate text-xs text-slate-500">{title.subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-extrabold text-indigo-700 sm:flex"><Target size={14} /> Day {data.metrics.currentDay} of 60</span>
              <span className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-2 text-xs font-extrabold text-orange-700"><Flame size={14} /> {data.metrics.streak} day streak</span>
              <span className="hidden rounded-lg bg-slate-100 px-3 py-2 text-xs font-extrabold text-slate-600 md:block">{data.metrics.daysCompleted}/60 done</span>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-extrabold text-white">YOU</span>
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto border-t border-slate-100 px-3 py-2 lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.key} onClick={() => goTo(item.key)} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${activeTab === item.key ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                  <Icon size={14} /> {item.label}
                </button>
              );
            })}
          </div>
        </header>

        <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-7 sm:py-8">
          {activeTab === "overview" && <Overview {...viewProps} />}
          {activeTab === "bank" && <QuestionBank key={bankChapter} initialChapter={bankChapter} {...viewProps} />}
          {activeTab === "syllabus" && <Syllabus {...viewProps} />}
          {activeTab === "routine" && <Routine {...viewProps} />}
          {activeTab === "tests" && <Tests {...viewProps} />}
          {activeTab === "performance" && <Performance {...viewProps} />}

          <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-[11px] text-slate-400">
            <span>NQT Compass · TCS NQT Foundation + Advanced aptitude preparation</span>
            <span>{data.chapters.length} chapters · {data.topics.length} topic routines · 60-day plan</span>
          </footer>
        </main>
      </div>

      {selectedTopicId && <LearningNotes topic={data.topics.find(topic => topic.id === selectedTopicId)!} chapter={data.chapters.find(chapter => chapter.id === data.topics.find(topic => topic.id === selectedTopicId)!.chapterId)!} actions={actions} onClose={() => setSelectedTopicId(null)} />}

      {quizLoading && (
        <div className="fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#111b35] px-4 py-3 text-sm font-bold text-white shadow-2xl">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Preparing your test...
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[95] max-w-sm rounded-xl px-4 py-3 text-sm font-bold text-white shadow-2xl animate-slide-up ${toast.tone === "error" ? "bg-rose-600" : "bg-emerald-600"}`}>
          {toast.message}
        </div>
      )}

      {quizSession && (
        <QuizRunner
          key={quizSession.id}
          session={quizSession}
          onClose={() => setQuizSession(null)}
          onCompleted={() => {
            void refresh().catch(() => setToast({ message: "Test saved, but analytics could not refresh", tone: "error" }));
          }}
        />
      )}
    </div>
  );
}
