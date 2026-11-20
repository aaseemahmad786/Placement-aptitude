"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  ListChecks,
  Sparkles,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { SECTION_META } from "@/lib/curriculum";
import type { PublicQuestion, QuizResult, QuizResultItem, SectionKey, TestScope } from "@/lib/types";
import { ProgressBar, ProgressRing, formatTime } from "@/components/shared";

export type QuizSession = {
  id: string;
  title: string;
  scope: TestScope;
  section: string | null;
  chapterSlug: string | null;
  questions: PublicQuestion[];
};

export default function QuizRunner({
  session,
  onClose,
  onCompleted,
}: {
  session: QuizSession;
  onClose: () => void;
  onCompleted: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (result) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [result]);

  const question = session.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const letters = ["A", "B", "C", "D"];

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: session.scope,
          title: session.title,
          section: session.section,
          chapterSlug: session.chapterSlug,
          seconds: elapsed,
          answers: session.questions.map((item) => ({
            questionId: item.id,
            selectedIndex: answers[item.id] ?? null,
          })),
        }),
      });
      const payload = (await response.json()) as QuizResult & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Grading failed");
      setResult(payload);
      onCompleted();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit the test");
    } finally {
      setSubmitting(false);
    }
  }

  function ResultRow({ item, index }: { item: QuizResultItem; index: number }) {
    const source = session.questions.find((entry) => entry.id === item.questionId);
    const selected = item.selectedIndex === null ? "Not answered" : source?.options[item.selectedIndex] ?? "—";
    return (
      <div className={`rounded-2xl border p-4 ${item.isCorrect ? "border-emerald-100 bg-emerald-50/40" : "border-rose-100 bg-rose-50/40"}`}>
        <div className="flex items-start gap-3">
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${item.isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
            {item.isCorrect ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Q{index + 1} · {item.topicTitle}</span>
              <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500">{SECTION_META[item.section as SectionKey]?.short ?? item.section}</span>
            </div>
            <p className="mt-2 text-sm font-bold leading-5 text-slate-800">{item.prompt}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-white px-3 py-2 text-[11px]"><span className="font-extrabold text-slate-400">Your answer: </span><span className={item.isCorrect ? "font-bold text-emerald-700" : "font-bold text-rose-700"}>{selected}</span></div>
              <div className="rounded-lg bg-white px-3 py-2 text-[11px]"><span className="font-extrabold text-slate-400">Correct: </span><span className="font-bold text-emerald-700">{item.correctAnswer}</span></div>
            </div>
            <p className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-[11px] leading-5 text-slate-600"><strong className="text-slate-800">Why: </strong>{item.explanation}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:p-5 animate-fade-in">
      <div className="flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[92vh] sm:rounded-3xl">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><ListChecks size={20} /></span>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-500">{result ? "Test complete" : session.scope === "practice" ? "Chapter practice · 50 questions" : "TCS NQT practice test"}</p>
              <h2 className="truncate text-sm font-extrabold text-slate-900 sm:text-base">{session.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!result && (
              <>
                <span className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-extrabold text-slate-700"><Clock3 size={15} /> {formatTime(elapsed)}</span>
                <span className="hidden rounded-lg bg-indigo-50 px-3 py-2 text-xs font-extrabold text-indigo-700 sm:block">{answeredCount}/{session.questions.length} answered</span>
              </>
            )}
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Close test"><X size={18} /></button>
          </div>
        </header>

        {result ? (
          <div className="flex-1 overflow-y-auto bg-slate-50/70 px-5 py-6 sm:px-7">
            <div className="mx-auto max-w-4xl space-y-5">
              <section className="app-card grid gap-6 p-6 sm:grid-cols-[170px_1fr]">
                <div className="flex justify-center"><ProgressRing value={result.accuracy} size={150} stroke={12} color={result.accuracy >= 70 ? "#0f9c8a" : "#e8833a"} label={`${result.accuracy}%`} sublabel="Accuracy" /></div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2"><Trophy size={18} className="text-amber-500" /><span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">Result saved to performance</span></div>
                  <h3 className="mt-3 text-2xl font-extrabold text-slate-900">{result.score} out of {result.total} correct</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Completed in {formatTime(result.seconds)}. Review every explanation below, then repeat the chapter from your weak-area queue.</p>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-emerald-50 p-3"><p className="text-[10px] font-extrabold uppercase text-emerald-600">Correct</p><p className="mt-1 text-lg font-extrabold text-emerald-800">{result.score}</p></div>
                    <div className="rounded-xl bg-rose-50 p-3"><p className="text-[10px] font-extrabold uppercase text-rose-600">Review</p><p className="mt-1 text-lg font-extrabold text-rose-800">{result.total - result.score}</p></div>
                    <div className="rounded-xl bg-indigo-50 p-3"><p className="text-[10px] font-extrabold uppercase text-indigo-600">Time</p><p className="mt-1 text-lg font-extrabold text-indigo-800">{formatTime(result.seconds)}</p></div>
                  </div>
                </div>
              </section>

              <section className="app-card p-5">
                <h3 className="text-sm font-extrabold text-slate-900">Section breakdown</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {result.sectionBreakdown.map((row) => {
                    const percent = Math.round((row.correct / row.total) * 100);
                    const meta = SECTION_META[row.section as SectionKey];
                    return (
                      <div key={row.section} className="rounded-xl border border-slate-100 p-3">
                        <div className="flex items-center justify-between text-xs"><span className="font-bold text-slate-700">{meta?.short ?? row.section}</span><span className="font-extrabold" style={{ color: meta?.color ?? "#5b5bd6" }}>{row.correct}/{row.total}</span></div>
                        <div className="mt-2"><ProgressBar value={percent} color={meta?.color ?? "#5b5bd6"} height={6} /></div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2"><Sparkles size={17} className="text-indigo-500" /><h3 className="text-sm font-extrabold text-slate-900">Answer review & explanations</h3></div>
                <div className="space-y-3">{result.results.map((item, index) => <ResultRow key={item.questionId} item={item} index={index} />)}</div>
              </section>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-slate-100 px-5 py-3 sm:px-7"><ProgressBar value={(answeredCount / Math.max(1, session.questions.length)) * 100} height={6} /></div>
            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
              <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
                <div className="mx-auto max-w-3xl">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-extrabold text-indigo-700">Question {currentIndex + 1} of {session.questions.length}</span>
                    {question && <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{question.topicTitle}</span>}
                    {question && <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{question.difficulty}</span>}
                  </div>
                  <h3 className="text-lg font-bold leading-8 text-slate-900 sm:text-xl">{question?.prompt}</h3>
                  <div className="mt-6 space-y-3">
                    {question?.options.map((option, optionIndex) => {
                      const selected = answers[question.id] === optionIndex;
                      return (
                        <button
                          key={optionIndex}
                          onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: optionIndex }))}
                          className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${selected ? "border-indigo-400 bg-indigo-50 shadow-[0_6px_18px_rgba(91,91,214,0.12)]" : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"}`}
                        >
                          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>{letters[optionIndex]}</span>
                          <span className="flex-1 pt-1 text-sm leading-6 text-slate-700">{option}</span>
                          {selected && <Check size={18} className="mt-2 shrink-0 text-indigo-600" />}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-5 text-[11px] text-slate-400">Choose the best answer. Unanswered questions count as incorrect so your accuracy reflects exam conditions.</p>
                </div>
              </div>

              <aside className="hidden w-[230px] shrink-0 overflow-y-auto border-l border-slate-100 bg-slate-50/60 p-5 lg:block">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Question palette</p>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {session.questions.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`grid h-9 place-items-center rounded-lg text-xs font-extrabold transition ${currentIndex === index ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : answers[item.id] !== undefined ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-[11px] font-semibold text-slate-500">
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-emerald-100" /> Answered</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-white ring-1 ring-slate-200" /> Not answered</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-indigo-600" /> Current</div>
                </div>
                <div className="mt-6 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Tip</p>
                  <p className="mt-2 text-[11px] leading-4 text-slate-500">If a question takes over 90 seconds, pick your best option, move on, and analyse it in the result review.</p>
                </div>
              </aside>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-7">
              <button className="btn-ghost" disabled={currentIndex === 0} onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}><ArrowLeft size={15} /> Previous</button>
              {session.scope === "practice" ? <button className="btn-ghost" onClick={submit} disabled={submitting}>{submitting ? "Grading..." : "Finish practice"}</button> : <span className="hidden text-xs font-semibold text-slate-500 sm:block">{session.questions.length - answeredCount} unanswered</span>}
              {currentIndex < session.questions.length - 1 ? (
                <button className="btn-primary" onClick={() => setCurrentIndex((value) => Math.min(session.questions.length - 1, value + 1))}>Next question <ArrowRight size={15} /></button>
              ) : (
                <button className="btn-primary" onClick={submit} disabled={submitting}>{submitting ? "Grading..." : "Submit test"} <Check size={15} /></button>
              )}
            </footer>
          </>
        )}

        {(error || result) && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-3 sm:px-7">
            {error ? <p className="text-xs font-bold text-rose-600">{error}</p> : <p className="text-xs font-semibold text-slate-500">Your dashboard, weak areas and topic accuracy have been updated.</p>}
            <button className="btn-primary" onClick={onClose}>Back to dashboard <ArrowRight size={15} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
