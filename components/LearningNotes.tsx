"use client";

import { useEffect, useState } from "react";
import { BookOpen, Check, CheckCircle2, Clock3, Download, FileText, Lightbulb, ListChecks, Play, Sparkles, X, Zap } from "lucide-react";
import { SECTION_META } from "@/lib/curriculum";
import type { ChapterDTO, TopicDTO } from "@/lib/types";
import { type DashboardActions } from "@/components/shared";

export default function LearningNotes({ topic, chapter, actions, onClose }: { topic: TopicDTO; chapter: ChapterDTO; actions: DashboardActions; onClose: () => void }) {
  const [tab, setTab] = useState<"notes" | "short" | "tricks" | "routine">("notes");
  useEffect(() => { setTab("notes"); }, [topic.id]);
  const meta = SECTION_META[chapter.section];
  const tabs = [
    { key: "notes" as const, label: "Detailed notes", icon: FileText },
    { key: "short" as const, label: "Short notes", icon: Zap },
    { key: "tricks" as const, label: "Tricks", icon: Lightbulb },
    { key: "routine" as const, label: "Routine", icon: ListChecks },
  ];

  function download() {
    const text = `# ${topic.title}\n${chapter.title}\n\n## Detailed notes\n${topic.notes.map(note => `- ${note}`).join("\n")}\n\n## Short notes\n${topic.shortNotes.map(note => `- ${note}`).join("\n")}\n\n## Tricks\n${topic.tricks.map(note => `- ${note}`).join("\n")}\n\n## Topic routine\n${topic.routine.map((step,index) => `${index+1}. ${step}`).join("\n")}`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
    const link = document.createElement("a"); link.href = url; link.download = `${chapter.slug}-${topic.title.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-notes.md`; link.click(); URL.revokeObjectURL(url);
  }

  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:p-6 animate-fade-in" onClick={onClose}>
    <section role="dialog" aria-modal="true" aria-label={`Learning notes for ${topic.title}`} className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl" onClick={event => event.stopPropagation()}>
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
        <div className="flex gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: meta.soft, color: meta.color }}><BookOpen size={21} /></span><div><p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: meta.color }}>{meta.label} · Chapter {chapter.orderIndex}</p><h2 className="mt-1 text-lg font-extrabold text-slate-900">{topic.title}</h2><p className="mt-1 text-xs text-slate-500">{chapter.title}</p></div></div>
        <button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500" onClick={onClose} aria-label="Close learning notes"><X size={17} /></button>
      </header>
      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-5 py-3 sm:px-6">
        {tabs.map(item => { const Icon = item.icon; return <button key={item.key} onClick={() => setTab(item.key)} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${tab === item.key ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}><Icon size={14} />{item.label}</button>; })}
        <span className="ml-auto items-center gap-1 text-xs font-semibold text-slate-400"><Clock3 size={13} className="mr-1 inline" />{topic.minutes} min</span>
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-50/70 p-5 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 rounded-xl p-4" style={{ background: meta.soft }}><p className="text-xs font-bold" style={{ color: meta.color }}>{topic.keyIdea}</p></div>
          {tab === "tricks" ? <div className="space-y-3">{topic.tricks.map((trick,index) => <div key={index} className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-600"><Lightbulb size={19} /></span><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Shortcut {index+1}</p><p className="mt-1 text-sm font-semibold leading-6 text-slate-700">{trick}</p></div></div>)}</div>
        : tab === "routine" ? <div className="space-y-3">{topic.routine.map((step,index) => <div key={index} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-xs font-extrabold text-indigo-600">{index+1}</span><p className="pt-1 text-sm leading-6 text-slate-600">{step}</p></div>)}</div>
        : <div className="space-y-3">{(tab === "short" ? topic.shortNotes : topic.notes).map((note,index) => <div key={index} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-indigo-50 text-[10px] font-extrabold text-indigo-600">{String(index+1).padStart(2,"0")}</span><p className="pt-1 text-sm leading-6 text-slate-700">{note}</p></div>)}</div>}
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50 p-4"><Sparkles size={17} className="mt-0.5 shrink-0 text-indigo-500" /><p className="text-xs leading-5 text-slate-600">Learn the rule, solve examples, then attempt a timed topic test. Review every mistake and recall the shortcut without notes.</p></div>
        </div>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4 sm:px-6">
        <div className="flex gap-2"><button className="btn-primary" onClick={() => actions.startQuiz({ scope: "topic", topicId: topic.id, topicTitle: topic.title })}><Play size={14} /> Practise topic</button><button className="btn-ghost" onClick={download}><Download size={14} /> Notes</button></div>
        <div className="flex gap-1.5">{[{status:"not-started" as const,label:"Not started"},{status:"learning" as const,label:"Learning"},{status:"confident" as const,label:"Confident"}].map(item => <button key={item.status} className="btn-ghost !px-3 !py-2 text-xs" onClick={() => actions.setTopicStatus(topic.id,item.status)}>{item.label}</button>)}</div>
      </footer>
    </section>
  </div>;
}
