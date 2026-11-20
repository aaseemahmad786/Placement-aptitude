"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Filter,
  Lightbulb,
  ListChecks,
  NotebookPen,
  Zap,
  Play,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { SECTION_META } from "@/lib/curriculum";
import type { ChapterDTO, SectionKey, TopicDTO, TopicStatus } from "@/lib/types";
import {
  EmptyState,
  PriorityBadge,
  ProgressBar,
  SectionPill,
  SectionTitle,
  chapterMastery,
  topicStatus,
  type ViewProps,
} from "@/components/shared";

const statuses: { value: TopicStatus; label: string; color: string }[] = [
  { value: "not-started", label: "Not started", color: "#94a0b8" },
  { value: "learning", label: "Learning", color: "#e8833a" },
  { value: "confident", label: "Confident", color: "#0f9c8a" },
];

function TopicRow({
  topic,
  data,
  actions,
  index,
}: {
  topic: TopicDTO;
  data: ViewProps["data"];
  actions: ViewProps["actions"];
  index: number;
}) {
  const status = topicStatus(data, topic.id);
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-xs font-extrabold text-indigo-600 ring-1 ring-indigo-100">{index + 1}</span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-extrabold text-slate-800">{topic.title}</h4>
              <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">{topic.difficulty}</span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500"><Clock3 size={12} /> {topic.minutes} min</span>
            </div>
            <p className="mt-2 flex gap-2 text-xs leading-5 text-slate-600"><Lightbulb size={14} className="mt-0.5 shrink-0 text-amber-500" /> {topic.keyIdea}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-1.5">
          {statuses.map((item) => (
            <button
              key={item.value}
              onClick={() => actions.setTopicStatus(topic.id, item.value)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${status === item.value ? "text-white shadow-sm" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100"}`}
              style={status === item.value ? { background: item.color } : undefined}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2"><button className="btn-ghost !py-1.5 !text-[11px]" onClick={() => actions.openTopicNotes(topic.id)}><NotebookPen size={13} /> Notes, short notes & tricks</button><button className="text-[11px] font-bold text-indigo-600 hover:underline" onClick={() => actions.startQuiz({ scope: "topic", topicId: topic.id, topicTitle: topic.title })}>Practise this topic →</button></div>
      <div className="mt-4 grid gap-2 border-t border-slate-200/80 pt-3 sm:grid-cols-2 xl:grid-cols-4">
        {topic.routine.map((step, stepIndex) => (
          <div key={step} className="flex gap-2 rounded-lg bg-white px-3 py-2.5 ring-1 ring-slate-100">
            <span className="text-[10px] font-extrabold text-indigo-500">0{stepIndex + 1}</span>
            <p className="text-[11px] leading-4 text-slate-600">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChapterCard({
  chapter,
  topics,
  expanded,
  onToggle,
  data,
  actions,
}: {
  chapter: ChapterDTO;
  topics: TopicDTO[];
  expanded: boolean;
  onToggle: () => void;
  data: ViewProps["data"];
  actions: ViewProps["actions"];
}) {
  const mastery = chapterMastery(data, chapter.id);
  const meta = SECTION_META[chapter.section];
  return (
    <div className={`app-card overflow-hidden transition ${expanded ? "ring-2 ring-indigo-100" : ""}`}>
      <button onClick={onToggle} className="flex w-full items-start gap-4 p-5 text-left">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl" style={{ background: meta.soft }}>{chapter.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SectionPill section={chapter.section} compact />
            <PriorityBadge priority={chapter.priority} />
            <span className="text-[11px] font-bold text-slate-400">Chapter {chapter.orderIndex}</span>
          </div>
          <h3 className="mt-2 text-base font-extrabold text-slate-900">{chapter.title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{chapter.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600"><ListChecks size={13} /> {chapter.practiceQuestionCount} practice questions</span><span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500"><Target size={13} /> {chapter.examWeight}% exam weight</span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500"><Clock3 size={13} /> {chapter.estimatedMinutes} min suggested</span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500"><ListChecks size={13} /> {topics.length} subtopics</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar value={mastery} color={meta.color} height={6} />
            <span className="shrink-0 text-[11px] font-extrabold text-slate-600">{mastery}%</span>
          </div>
        </div>
        <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-500">
          {expanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-white px-5 pb-5 pt-4 animate-fade-in">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: meta.soft }}>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider" style={{ color: meta.color }}>Chapter topic routine</p>
              <p className="mt-1 text-xs text-slate-600">Learn → worked examples → timed drill → error log. Mark each subtopic as you gain confidence.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary" onClick={() => actions.startQuiz({ scope: "chapter", chapterSlug: chapter.slug })}><Play size={15} fill="currentColor" /> Take chapter test</button>
              <button className="btn-ghost" onClick={() => actions.startQuiz({ scope: "practice", chapterSlug: chapter.slug })}><ListChecks size={15} /> Practice {chapter.practiceQuestionCount} questions</button>
              <button className="btn-ghost" onClick={() => actions.openBankChapter(chapter.slug)}><BookOpen size={15} /> Previous-year questions ({data.bankQuestions.filter(question => question.chapterSlug === chapter.slug).length})</button>
            </div>
          </div>
          <div className="space-y-3">
            {topics.map((topic, index) => (
              <TopicRow key={topic.id} topic={topic} index={index} data={data} actions={actions} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Syllabus({ data, actions }: ViewProps) {
  const [sectionFilter, setSectionFilter] = useState<"all" | SectionKey>("all");
  const [quickRevision, setQuickRevision] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(data.chapters[0]?.slug ?? null);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return data.chapters.filter((chapter) => {
      if (sectionFilter !== "all" && chapter.section !== sectionFilter) return false;
      if (priorityFilter !== "all" && chapter.priority !== priorityFilter) return false;
      if (!search) return true;
      const topicText = data.topics.filter((topic) => topic.chapterId === chapter.id).map((topic) => topic.title).join(" ");
      return `${chapter.title} ${chapter.summary} ${topicText}`.toLowerCase().includes(search);
    });
  }, [data.chapters, data.topics, query, sectionFilter, priorityFilter]);

  const sectionCards = (["numerical", "verbal", "reasoning"] as SectionKey[]).map((section) => {
    const meta = SECTION_META[section];
    const list = data.chapters.filter((chapter) => chapter.section === section);
    const topicCount = data.topics.filter((topic) => list.some((chapter) => chapter.id === topic.chapterId)).length;
    return { section, meta, chapters: list.length, topicCount };
  });

  return (
    <div className="animate-slide-up">
      <SectionTitle
        eyebrow="Complete aptitude syllabus"
        title="Chapter-wise topic map"
        description="Every chapter includes its exam weight, all subtopics, a repeatable four-step routine, confidence tracking and a dedicated test. Based on the TCS NQT Foundation and Advanced Aptitude topic areas."
        action={<div className="flex flex-wrap gap-2"><button className="btn-ghost" onClick={() => setQuickRevision(!quickRevision)}><Zap size={15} />{quickRevision ? "Detailed syllabus" : "Quick revision"}</button><div className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">{data.chapters.length} chapters · {data.topics.length} topics</div></div>}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {sectionCards.map(({ section, meta, chapters, topicCount }) => (
          <button
            key={section}
            onClick={() => setSectionFilter(sectionFilter === section ? "all" : section)}
            className={`app-card flex items-center gap-4 p-4 text-left transition ${sectionFilter === section ? "ring-2 ring-indigo-200" : "hover:-translate-y-0.5"}`}
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl text-lg font-extrabold" style={{ background: meta.soft, color: meta.color }}>{meta.icon}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-800">{meta.label}</p>
              <p className="mt-1 text-[11px] text-slate-500">{chapters} chapters · {topicCount} topics</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-slate-400" />
          </button>
        ))}
      </div>

      <div className="app-card mb-5 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="app-input !pl-9" placeholder="Search chapters, topics or concepts..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "numerical", "verbal", "reasoning"] as const).map((value) => (
            <button key={value} onClick={() => setSectionFilter(value)} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${sectionFilter === value ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {value === "all" ? "All sections" : SECTION_META[value].short}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select className="app-input !w-auto !py-2" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
            <option value="all">All priorities</option>
            <option value="Very High">Very High</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
          </select>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">Showing {filtered.length} chapters</p>
        <button className="text-xs font-bold text-indigo-600 hover:underline" onClick={() => setExpanded(expanded ? null : filtered[0]?.slug ?? null)}>
          {expanded ? "Collapse current chapter" : "Expand first chapter"}
        </button>
      </div>

      {quickRevision && filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2">{filtered.flatMap(chapter => data.topics.filter(topic => topic.chapterId === chapter.id).map(topic => <div key={topic.id} className="app-card p-5"><p className="text-[10px] font-bold text-slate-400">{chapter.title}</p><h3 className="mt-1 text-sm font-extrabold text-slate-900">{topic.title}</h3><ul className="mt-3 space-y-2">{topic.shortNotes.map((note,index) => <li key={index} className="flex gap-2 text-xs leading-5 text-slate-600"><CheckCircle2 size={13} className="mt-1 shrink-0 text-teal-600" />{note}</li>)}</ul><div className="mt-3 rounded-xl bg-amber-50 p-3"><p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Tricks</p>{topic.tricks.map((trick,index) => <p key={index} className="mt-1 text-[11px] leading-5 text-amber-800">{trick}</p>)}</div><button className="mt-3 text-xs font-bold text-indigo-600" onClick={() => actions.openTopicNotes(topic.id)}>Open detailed notes →</button></div>))}</div>
       ) : filtered.length ? (
        <><div className="mb-4 flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4"><NotebookPen size={18} className="mt-0.5 shrink-0 text-indigo-600" /><p className="text-xs leading-5 text-slate-600">Every subtopic includes detailed notes, short notes and tricks. Use Quick revision for a chapter-wise recall sheet.</p></div>
      <div className="space-y-3">
          {filtered.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              topics={data.topics.filter((topic) => topic.chapterId === chapter.id)}
              expanded={expanded === chapter.slug}
              onToggle={() => setExpanded(expanded === chapter.slug ? null : chapter.slug)}
              data={data}
              actions={actions}
            />
          ))}
        </div></>
      ) : (
        <EmptyState icon={<BookOpen size={24} />} title="No matching chapters" description="Try a different search term or clear the section and priority filters." />
      )}

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
        <Sparkles size={19} className="mt-0.5 shrink-0 text-indigo-600" />
        <p className="text-xs leading-5 text-slate-600">
          <strong className="text-slate-800">Coverage note:</strong> the Foundation paper tests Numerical, Verbal and Reasoning Ability; the Advanced paper revisits these at higher difficulty. This planner covers all aptitude areas and intentionally leaves coding practice outside the 60-day aptitude routine.
        </p>
      </div>
    </div>
  );
}
