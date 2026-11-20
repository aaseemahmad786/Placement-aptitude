import { db } from "@/db";
import { chapters, questions, testAttempts, attemptAnswers } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";
import { getAppData } from "@/lib/app-data";
import { SECTION_META } from "@/lib/curriculum";
import type {
  PublicQuestion,
  QuizResult,
  SectionKey,
  TestScope,
} from "@/lib/types";

type QuestionRow = typeof questions.$inferSelect;
type ChapterRow = typeof chapters.$inferSelect;

export type QuizStart = {
  title: string;
  scope: TestScope;
  section: string | null;
  chapterSlug: string | null;
  questions: PublicQuestion[];
};

export type QuizSubmission = {
  scope: string;
  title: string;
  section: string | null;
  chapterSlug: string | null;
  seconds: number;
  answers: { questionId: number; selectedIndex: number | null }[];
};

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function choose(pool: QuestionRow[], count: number) {
  const authored = shuffle(pool.filter((question) => question.source === "authored"));
  const concept = shuffle(pool.filter((question) => question.source === "concept"));
  return shuffle([...authored, ...concept].slice(0, Math.max(1, Math.min(count, pool.length))));
}

function toPublic(question: QuestionRow, chapter: ChapterRow): PublicQuestion {
  return {
    id: question.id,
    prompt: question.prompt,
    options: question.options,
    section: question.section,
    chapterSlug: chapter.slug,
    chapterTitle: chapter.title,
    topicTitle: question.topicTitle,
    difficulty: question.difficulty,
    year: question.year ?? undefined,
    sourceName: question.sourceName ?? undefined,
    sourceUrl: question.sourceUrl ?? undefined,
    yearStatus: question.yearStatus ?? undefined,
  };
}

export async function createQuiz(input: {
  scope?: string;
  chapterSlug?: string;
  section?: string;
  questionIds?: number[];
  topicId?: number;
  topicTitle?: string;
  title?: string;
}): Promise<QuizStart> {
  await ensureSeeded();

  const validScopes: TestScope[] = ["chapter", "practice", "bank", "topic", "section", "full", "advanced", "weak"];
  const scope = validScopes.includes(input.scope as TestScope)
    ? (input.scope as TestScope)
    : "chapter";

  const [questionRows, chapterRows] = await Promise.all([
    db.select().from(questions),
    db.select().from(chapters),
  ]);
  const chapterById = new Map(chapterRows.map((chapter) => [chapter.id, chapter]));
  const chapterBySlug = new Map(chapterRows.map((chapter) => [chapter.slug, chapter]));

  let selected: QuestionRow[] = [];
  let title = "Aptitude Practice Test";
  let section: string | null = null;
  let chapterSlug: string | null = null;

  if (scope === "topic") {
    const topicId = Number(input.topicId);
    const pool = questionRows.filter(question => question.topicTitle === String(input.topicTitle ?? "") && question.chapterId === topicId);
    selected = choose(pool, 10);
    if (!selected.length) throw new Error("No questions are available for this topic");
    title = `${selected[0].topicTitle} · Topic Test`;
    section = selected[0].section;
    chapterSlug = chapterById.get(selected[0].chapterId)?.slug ?? null;
  } else if (scope === "bank") {
    const ids = [...new Set((input.questionIds ?? []).map(Number))].filter(id => Number.isSafeInteger(id) && id > 0).slice(0, 50);
    if (!ids.length) throw new Error("Select at least one question from the question bank");
    const rows = ids.map(id => questionRows.find(question => question.id === id)).filter((question): question is QuestionRow => Boolean(question));
    if (!rows.length) throw new Error("Selected questions could not be found");
    selected = rows;
    section = new Set(selected.map(question => question.section)).size > 1 ? "mixed" : selected[0].section;
    title = input.title ? String(input.title).slice(0, 120) : `Question Bank Practice · ${selected.length} Questions`;
  } else if (scope === "practice") {
    const chapter = chapterBySlug.get(input.chapterSlug ?? "") ?? chapterRows[0];
    chapterSlug = chapter.slug;
    section = chapter.section;
    const pool = questionRows.filter(question => question.chapterId === chapter.id && question.source === "practice");
    if (pool.length < 50) throw new Error("This chapter's 50-question practice bank is not ready");
    selected = shuffle(pool).slice(0, 50);
    title = `${chapter.title} · 50-Question Practice`;
  } else if (scope === "chapter") {
    const chapter = chapterBySlug.get(input.chapterSlug ?? "") ?? chapterRows[0];
    chapterSlug = chapter.slug;
    section = chapter.section;
    title = `${chapter.title} · Chapter Test`;
    selected = choose(questionRows.filter((question) => question.chapterId === chapter.id), 8);
  } else if (scope === "section") {
    const sectionKey = (["numerical", "verbal", "reasoning"] as string[]).includes(input.section ?? "")
      ? (input.section as SectionKey)
      : "numerical";
    section = sectionKey;
    title = `${SECTION_META[sectionKey].label} · Section Test`;
    selected = choose(questionRows.filter((question) => question.section === sectionKey), 15);
  } else if (scope === "full") {
    section = "mixed";
    title = "Foundation Full Mock · 30 Questions";
    selected = (["numerical", "verbal", "reasoning"] as SectionKey[]).flatMap((key) =>
      choose(questionRows.filter((question) => question.section === key), 10),
    );
  } else if (scope === "advanced") {
    section = "mixed";
    title = "Advanced Aptitude Sprint · 15 Questions";
    const advancedChapterIds = new Set(chapterRows.filter((chapter) => chapter.examWeight >= 8).map((chapter) => chapter.id));
    const pool = questionRows.filter((question) => advancedChapterIds.has(question.chapterId));
    selected = choose(pool, 15);
  } else {
    section = "mixed";
    title = "Weak-Area Repair Drill · 10 Questions";
    const data = await getAppData();
    const weakSlugs = [...new Set(data.metrics.weakAreas.map((area) => area.chapterSlug))].slice(0, 8);
    const weakChapterIds = new Set(
      weakSlugs.map((slug) => chapterBySlug.get(slug)?.id).filter((id): id is number => Boolean(id)),
    );
    let pool = questionRows.filter((question) => weakChapterIds.has(question.chapterId));
    if (pool.length < 10) pool = questionRows;
    selected = choose(pool, 10);
  }

  return {
    title,
    scope,
    section,
    chapterSlug,
    questions: selected.map((question) => toPublic(question, chapterById.get(question.chapterId)!)),
  };
}

export async function submitQuiz(input: QuizSubmission): Promise<QuizResult> {
  await ensureSeeded();

  const ids = [...new Set(input.answers.map((answer) => Number(answer.questionId)).filter(Number.isFinite))];
  if (!ids.length) throw new Error("No answers were submitted");

  const questionRows = await db.select().from(questions).where(inArray(questions.id, ids));
  const questionById = new Map(questionRows.map((question) => [question.id, question]));
  const answerMap = new Map(
    input.answers.map((answer) => [Number(answer.questionId), answer.selectedIndex]),
  );

  const graded = ids
    .map((id) => questionById.get(id))
    .filter((question): question is QuestionRow => Boolean(question))
    .map((question) => {
      const raw = answerMap.get(question.id);
      const selectedIndex = typeof raw === "number" && raw >= 0 && raw < question.options.length ? raw : null;
      const isCorrect = selectedIndex === question.correctIndex;
      return {
        questionId: question.id,
        selectedIndex,
        correctIndex: question.correctIndex,
        isCorrect,
        explanation: question.explanation,
        prompt: question.prompt,
        correctAnswer: question.options[question.correctIndex],
        topicTitle: question.topicTitle,
        section: question.section,
        chapterId: question.chapterId,
        question,
      };
    });

  if (!graded.length) throw new Error("Submitted questions could not be found");

  const score = graded.filter((item) => item.isCorrect).length;
  const total = graded.length;
  const accuracy = Math.round((score / total) * 100);
  const seconds = Math.max(1, Math.min(7200, Math.round(Number(input.seconds) || 60)));
  const title = String(input.title ?? "Aptitude Practice Test").slice(0, 120);
  const section = input.section ? String(input.section).slice(0, 30) : null;
  const chapterSlug = input.chapterSlug ? String(input.chapterSlug).slice(0, 100) : null;
  const scope = String(input.scope ?? "chapter").slice(0, 30);

  await db.transaction(async (tx) => {
    const [attempt] = await tx
      .insert(testAttempts)
      .values({ scope, title, section, chapterSlug, score, total, accuracy, seconds })
      .returning({ id: testAttempts.id });

    await tx.insert(attemptAnswers).values(
      graded.map((item) => ({
        attemptId: attempt.id,
        questionId: item.question.id,
        chapterId: item.chapterId,
        topicTitle: item.topicTitle,
        section: item.section,
        selectedIndex: item.selectedIndex,
        correctIndex: item.correctIndex,
        isCorrect: item.isCorrect,
      })),
    );
  });

  const breakdownMap = new Map<string, { section: string; correct: number; total: number }>();
  for (const item of graded) {
    const current = breakdownMap.get(item.section) ?? { section: item.section, correct: 0, total: 0 };
    current.total += 1;
    if (item.isCorrect) current.correct += 1;
    breakdownMap.set(item.section, current);
  }

  return {
    attemptId: 0,
    score,
    total,
    accuracy,
    seconds,
    title,
    results: graded.map(({ question, chapterId, ...item }) => item),
    sectionBreakdown: [...breakdownMap.values()],
  };
}
