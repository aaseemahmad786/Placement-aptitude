"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bookmark, BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight, Download, ExternalLink, Filter, LibraryBig, Play, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import { SECTION_META } from "@/lib/curriculum";
import type { BankQuestionDTO, SectionKey } from "@/lib/types";
import { EmptyState, SectionTitle, type ViewProps } from "@/components/shared";

export default function QuestionBank({ data, actions, initialChapter = "all" }: ViewProps & { initialChapter?: string }) {
  const [year, setYear] = useState<number | "all">("all");
  const [section, setSection] = useState<"all" | SectionKey>("all");
  const [chapter, setChapter] = useState(initialChapter);
  const [query, setQuery] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const years = [...new Set(data.bankQuestions.map(question => question.year))].sort();
  const saved = useMemo(() => new Set(data.bookmarkedQuestionIds), [data.bookmarkedQuestionIds]);
  const filterKey = `${year}-${section}-${chapter}-${query}-${savedOnly}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const filtered = useMemo(() => {
    return data.bankQuestions.filter(question => {
      if (year !== "all" && question.year !== year) return false;
      if (section !== "all" && question.section !== section) return false;
      if (chapter !== "all" && question.chapterSlug !== chapter) return false;
      if (savedOnly && !saved.has(question.id)) return false;
      return `${question.prompt} ${question.chapterTitle} ${question.topicTitle}`.toLowerCase().includes(query.toLowerCase().trim());
    });
  }, [data.bankQuestions, year, section, chapter, query, savedOnly, saved]);
  useEffect(() => { if (!message) return; const timer = window.setTimeout(() => setMessage(""), 3000); return () => window.clearTimeout(timer); }, [message]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 8));
  const visible = filtered.slice((page - 1) * 8, page * 8);

  function toggle(id: number) {
    if (selected.includes(id)) setSelected(selected.filter(value => value !== id));
    else if (selected.length < 50) setSelected([...selected, id]);
    else setMessage("Select up to 50 questions per practice session.");
  }
  function practice(ids: number[], title?: string) {
    if (!ids.length) { setMessage("Select at least one question to practise."); return; }
    actions.startQuiz({ scope: "bank", questionIds: ids.slice(0, 50), title: title ?? `Question Bank Practice · ${Math.min(50, ids.length)} Questions` });
  }
  function exportBank() {
    const blob = new Blob([JSON.stringify({ title: "TCS NQT 2021–2025 memory-based question bank", disclaimer: "Public candidate reports, not official TCS papers. Collection-period years are not independently confirmed.", questions: filtered }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "tcs-nqt-2021-2025-question-bank.json"; link.click(); URL.revokeObjectURL(url);
  }

  function row(question: BankQuestionDTO) {
    const isExpanded = expanded === question.id;
    const show = revealed.includes(question.id);
    return <div key={question.id} className={`rounded-2xl border ${selected.includes(question.id) ? "border-indigo-200 bg-indigo-50/30" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start gap-3 p-4">
        <input type="checkbox" aria-label={`Select question ${question.id}`} checked={selected.includes(question.id)} onChange={() => toggle(question.id)} className="mt-1 h-4 w-4 shrink-0 accent-indigo-600" />
        <button className="min-w-0 flex-1 text-left" onClick={() => setExpanded(isExpanded ? null : question.id)}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-extrabold text-indigo-700">{question.year}</span>
            <span className="rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ background: SECTION_META[question.section].soft, color: SECTION_META[question.section].color }}>{SECTION_META[question.section].short}</span>
            <span className="text-[11px] font-semibold text-slate-500">{question.chapterTitle}</span>
            {question.yearStatus === "collection-period" && <span title="Reported in a 2023–24 collection; exact exam year is not confirmed." className="rounded bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700">Collection-period report</span>}
          </div>
          <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-slate-800">{question.prompt}</p>
          <p className="mt-2 text-[11px] text-indigo-500">{question.topicTitle}</p>
        </button>
        <div className="flex items-center gap-1">
          <button aria-label={saved.has(question.id) ? "Remove bookmark" : "Bookmark question"} onClick={() => actions.toggleBookmark(question.id, !saved.has(question.id))} className={`grid h-8 w-8 place-items-center rounded-lg ${saved.has(question.id) ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:bg-slate-50"}`}><Bookmark size={16} fill={saved.has(question.id) ? "currentColor" : "none"} /></button>
          <button aria-label="Toggle question" onClick={() => setExpanded(isExpanded ? null : question.id)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-50">{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>
        </div>
      </div>
      {isExpanded && <div className="border-t border-slate-100 p-4 animate-fade-in">
        <div className="grid gap-2 sm:grid-cols-2">{question.options.map((option, index) => <div key={index} className={`rounded-lg px-3 py-2 text-xs ${show && question.options[index] === question.correctAnswer ? "bg-emerald-50 font-bold text-emerald-700" : "bg-slate-50 text-slate-600"}`}><span className="mr-2 font-extrabold text-slate-400">{"ABCD"[index]}.</span>{option}</div>)}</div>
        {show && <div className="mt-3 rounded-xl bg-emerald-50 p-3"><p className="text-xs font-extrabold text-emerald-800">Correct answer: {question.correctAnswer}</p><p className="mt-2 text-xs leading-5 text-slate-600">{question.explanation}</p></div>}
        <p className="mt-3 text-[10px] leading-5 text-slate-500"><strong className="text-slate-600">Source: </strong>{question.sourceName}. Candidate-reported; wording standardised for practice. Not an official TCS paper.</p>
        <div className="mt-3 flex flex-wrap gap-2"><button className="btn-ghost !py-2 text-xs" onClick={() => practice([question.id], `${question.year} · ${chapterTitle(question.chapterSlug)}`)}><Play size={13} /> Practise question</button><button className="btn-ghost !py-2 text-xs" onClick={() => setRevealed(show ? revealed.filter(id => id !== question.id) : [...revealed, question.id])}>{show ? "Hide solution" : "Show solution"}</button>{question.sourceUrl && <a className="flex items-center gap-1 self-center text-xs font-bold text-indigo-600" href={question.sourceUrl} target="_blank" rel="noreferrer">View source <ExternalLink size={12} /></a>}</div>
      </div>}
    </div>;
  }

  function chapterTitle(slug: string) { return data.chapters.find(item => item.slug === slug)?.title ?? slug; }

  return <div className="animate-slide-up">
    <SectionTitle eyebrow="Previous-year question bank" title="2021–2025 · Chapter-wise PYQs" description="A curated bank of publicly reported TCS aptitude questions, mapped to your chapter syllabus. Practise by year or chapter, save difficult questions, and reveal worked solutions in study mode." action={<button className="btn-ghost" onClick={exportBank}><Download size={15} /> Export question bank</button>} />
    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"><ShieldCheck size={20} className="mt-0.5 shrink-0 text-amber-600" /><div><p className="text-xs font-extrabold text-amber-800">Public memory-based collection — not official or complete TCS papers</p><p className="mt-1 text-[11px] leading-5 text-amber-800/80">Each item links to its public source. Questions from 2023–24 collections are labelled “Collection-period report”; their exact year/slot is not independently confirmed. Some wording is standardised, with calculation corrections where needed. This is a curated practice bank, not an exhaustive archive.</p></div></div>
    <div className="mb-5 grid gap-3 sm:grid-cols-3"><div className="app-card p-5"><p className="text-xs font-bold text-slate-500">Sourced questions</p><p className="mt-2 text-2xl font-extrabold text-slate-900">{data.bankQuestions.length}</p></div><div className="app-card p-5"><p className="text-xs font-bold text-slate-500">Exam-year groups</p><p className="mt-2 text-2xl font-extrabold text-slate-900">2021–2025</p></div><div className="app-card p-5"><p className="text-xs font-bold text-slate-500">Saved questions</p><p className="mt-2 text-2xl font-extrabold text-indigo-600">{saved.size}</p></div></div>
    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-5">{years.map(value => <button key={value} onClick={() => setYear(year === value ? "all" : value)} className={`app-card p-4 text-left transition ${year === value ? "ring-2 ring-indigo-300" : "hover:border-indigo-200"}`}><div className="flex items-center justify-between"><span className="text-lg font-extrabold text-slate-900">{value}</span><LibraryBig size={17} className="text-indigo-400" /></div><p className="mt-2 text-[11px] font-semibold text-slate-500">{data.bankQuestions.filter(question => question.year === value).length} chapter-tagged questions</p></button>)}</div>
    <div className="app-card mb-4 flex flex-wrap items-center gap-3 p-4"><div className="relative min-w-[220px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="app-input !pl-9" placeholder="Search question, chapter or topic..." value={query} onChange={event => setQuery(event.target.value)} /></div><select className="app-input !w-auto" value={year} onChange={event => setYear(event.target.value === "all" ? "all" : Number(event.target.value))}><option value="all">All years</option>{years.map(value => <option key={value} value={value}>{value}</option>)}</select><select className="app-input !w-auto" value={section} onChange={event => setSection(event.target.value as "all" | SectionKey)}><option value="all">All sections</option><option value="numerical">Numerical</option><option value="verbal">Verbal</option><option value="reasoning">Reasoning</option></select><select className="app-input !w-auto max-w-[240px]" value={chapter} onChange={event => setChapter(event.target.value)}><option value="all">All chapters</option>{data.chapters.map(item => <option key={item.id} value={item.slug}>{item.title}</option>)}</select><button className={`btn-ghost ${savedOnly ? "!bg-indigo-50 !text-indigo-700" : ""}`} onClick={() => setSavedOnly(!savedOnly)}><Bookmark size={14} /> Saved</button></div>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold text-slate-500">{filtered.length} questions · page {page} of {pageCount}</p><button className="text-xs font-bold text-indigo-600" onClick={() => practice(filtered.map(question => question.id), `${year === "all" ? "2021–2025" : year} Chapter-wise PYQ Practice`)}>Practise all {filtered.length} filtered questions <ArrowRight size={13} className="ml-1 inline" /></button></div>
    <div className="space-y-3">{visible.map(row)}</div>
    {!filtered.length && <EmptyState icon={<Search size={24} />} title="No matching questions" description="Try another year, chapter or search term, or turn off the Saved filter." />}
    {filtered.length > 8 && <div className="mt-5 flex items-center justify-between"><button className="btn-ghost" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft size={15} /> Previous</button><span className="text-xs font-bold text-slate-500">Page {page} of {pageCount}</span><button className="btn-ghost" disabled={page === pageCount} onClick={() => setPage(page + 1)}>Next <ChevronRight size={15} /></button></div>}
    {selected.length > 0 && <div className="sticky bottom-4 z-20 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#111b35] px-5 py-4 text-white shadow-2xl"><span className="flex items-center gap-2 text-sm font-bold"><Check size={16} /> {selected.length} questions selected</span><div className="flex gap-2"><button className="text-xs font-bold text-white/60" onClick={() => setSelected([])}>Clear selection</button><button className="btn-primary" onClick={() => practice(selected)}><Play size={14} /> Practise selected</button></div></div>}
    {message && <p className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">{message}</p>}
  </div>;
}
