import { db } from "@/db";
import { chapters, topics, questions, dayPlans, profile, seedState, questionBookmarks } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ALL_CHAPTERS, addDays, buildDayPlans, buildQuestionBank, todayIso } from "@/lib/curriculum";
import { buildPracticeBank } from "@/lib/practice";
import { previousYearQuestions } from "@/lib/previous-years";
import { getLearningNotes } from "@/lib/learning-notes/index";

const SEED_VERSION = "tcs-topic-learning-notes-v4";
let seedPromise: Promise<void> | null = null;

async function ensureTables() {
  const ddlStatements = [
    `CREATE TABLE IF NOT EXISTS "chapters" (
      "id" serial PRIMARY KEY NOT NULL,
      "slug" text NOT NULL UNIQUE,
      "section" text NOT NULL,
      "title" text NOT NULL,
      "summary" text NOT NULL,
      "icon" text NOT NULL,
      "priority" text NOT NULL,
      "exam_weight" integer NOT NULL,
      "estimated_minutes" integer NOT NULL,
      "order_index" integer NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "topics" (
      "id" serial PRIMARY KEY NOT NULL,
      "chapter_id" integer NOT NULL REFERENCES "chapters"("id") ON DELETE CASCADE,
      "title" text NOT NULL,
      "minutes" integer NOT NULL,
      "difficulty" text NOT NULL,
      "key_idea" text NOT NULL,
      "routine" jsonb NOT NULL,
      "notes" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "short_notes" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "tricks" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "order_index" integer NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "questions" (
      "id" serial PRIMARY KEY NOT NULL,
      "chapter_id" integer NOT NULL REFERENCES "chapters"("id") ON DELETE CASCADE,
      "topic_title" text NOT NULL,
      "section" text NOT NULL,
      "prompt" text NOT NULL,
      "options" jsonb NOT NULL,
      "correct_index" integer NOT NULL,
      "explanation" text NOT NULL,
      "difficulty" text NOT NULL,
      "source" text NOT NULL,
      "year" integer,
      "source_name" text,
      "source_url" text,
      "year_status" text DEFAULT 'original' NOT NULL,
      "order_index" integer NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "day_plans" (
      "day_number" integer PRIMARY KEY NOT NULL,
      "phase" text NOT NULL,
      "title" text NOT NULL,
      "focus" text NOT NULL,
      "section" text NOT NULL,
      "chapter_slugs" jsonb NOT NULL,
      "topic_titles" jsonb NOT NULL,
      "tasks" jsonb NOT NULL,
      "target_minutes" integer NOT NULL,
      "test_kind" text NOT NULL,
      "is_milestone" boolean DEFAULT false NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "profile" (
      "id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
      "start_date" date NOT NULL,
      "exam_date" date,
      "daily_goal_minutes" integer DEFAULT 90 NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "daily_progress" (
      "day_number" integer PRIMARY KEY NOT NULL,
      "completed" boolean DEFAULT true NOT NULL,
      "minutes" integer DEFAULT 0 NOT NULL,
      "note" text DEFAULT '' NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "topic_progress" (
      "topic_id" integer PRIMARY KEY NOT NULL,
      "status" text DEFAULT 'not-started' NOT NULL,
      "confidence" integer DEFAULT 0 NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "test_attempts" (
      "id" serial PRIMARY KEY NOT NULL,
      "scope" text NOT NULL,
      "title" text NOT NULL,
      "section" text,
      "chapter_slug" text,
      "score" integer NOT NULL,
      "total" integer NOT NULL,
      "accuracy" real NOT NULL,
      "seconds" integer NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "attempt_answers" (
      "id" serial PRIMARY KEY NOT NULL,
      "attempt_id" integer NOT NULL REFERENCES "test_attempts"("id") ON DELETE CASCADE,
      "question_id" integer NOT NULL,
      "chapter_id" integer NOT NULL,
      "topic_title" text NOT NULL,
      "section" text NOT NULL,
      "selected_index" integer,
      "correct_index" integer NOT NULL,
      "is_correct" boolean NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "question_bookmarks" (
      "question_id" integer PRIMARY KEY REFERENCES "questions"("id") ON DELETE CASCADE,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "seed_state" (
      "id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
      "version" text NOT NULL,
      "seeded_at" timestamp with time zone DEFAULT now() NOT NULL
    )`,
    // Ensure new columns exist on existing tables
    `ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "year" integer`,
    `ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "source_name" text`,
    `ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "source_url" text`,
    `ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "year_status" text DEFAULT 'original' NOT NULL`,
    `ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "notes" jsonb DEFAULT '[]'::jsonb NOT NULL`,
    `ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "short_notes" jsonb DEFAULT '[]'::jsonb NOT NULL`,
    `ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "tricks" jsonb DEFAULT '[]'::jsonb NOT NULL`
  ];

  for (const statement of ddlStatements) {
    await db.execute(sql.raw(statement));
  }
}

async function runSeed() {
  await ensureTables();

  await db.transaction(async (tx: any) => {
    await tx.execute(sql`select pg_advisory_xact_lock(918273645)`);
    const [existing] = await tx.select().from(seedState).where(eq(seedState.id, 1)).limit(1);
    if (existing?.version === SEED_VERSION) return;
    let idBySlug: Map<string, number>;

    if (existing) {
      const rows = await tx.select({ id: chapters.id, slug: chapters.slug }).from(chapters);
      idBySlug = new Map(rows.map((row: any) => [row.slug, row.id]));

      const [hasPrevYear] = await tx.select({ id: questions.id }).from(questions).where(eq(questions.source, "previous-year")).limit(1);
      if (!hasPrevYear) {
        await tx.insert(questions).values(previousYearQuestions.map((question, index) => ({
          chapterId: idBySlug.get(question.chapterSlug)!, topicTitle: question.topicTitle,
          section: question.section, prompt: question.prompt, options: question.options,
          correctIndex: question.correctIndex, explanation: question.explanation,
          difficulty: "Medium" as const, source: "previous-year", year: question.year,
          sourceName: question.sourceName, sourceUrl: question.sourceUrl,
          yearStatus: question.yearStatus, orderIndex: 5000 + index,
        })));
        await tx.insert(questions).values(buildPracticeBank(ALL_CHAPTERS).map((question, index) => ({
          chapterId: idBySlug.get(question.chapterSlug)!, topicTitle: question.topicTitle,
          section: question.section, prompt: question.prompt, options: question.options,
          correctIndex: question.correct, explanation: question.explanation,
          difficulty: question.difficulty as "Easy" | "Medium" | "Hard", source: question.source, orderIndex: 1000 + index,
        })));
      }
    } else {
      const inserted = await tx.insert(chapters).values(ALL_CHAPTERS.map((chapter, index) => ({
        slug: chapter.slug, section: chapter.section, title: chapter.title,
        summary: chapter.summary, icon: chapter.icon, priority: chapter.priority,
        examWeight: chapter.examWeight, estimatedMinutes: chapter.estimatedMinutes, orderIndex: index + 1,
      }))).returning({ id: chapters.id, slug: chapters.slug });
      idBySlug = new Map(inserted.map((row: any) => [row.slug, row.id]));
      await tx.insert(topics).values(ALL_CHAPTERS.flatMap(chapter => chapter.topics.map((topic, index) => ({
        chapterId: idBySlug.get(chapter.slug)!, title: topic.title, minutes: topic.minutes,
        difficulty: topic.difficulty, keyIdea: topic.keyIdea, routine: topic.routine, orderIndex: index + 1,
      }))));
      await tx.insert(questions).values(buildQuestionBank().map((question, index) => ({
        chapterId: idBySlug.get(question.chapterSlug)!, topicTitle: question.topicTitle,
        section: question.section, prompt: question.prompt, options: question.options,
        correctIndex: question.correct, explanation: question.explanation,
        difficulty: question.difficulty as "Easy" | "Medium" | "Hard", source: question.source, orderIndex: index + 1,
      })));
      await tx.insert(questions).values(previousYearQuestions.map((question, index) => ({
        chapterId: idBySlug.get(question.chapterSlug)!, topicTitle: question.topicTitle,
        section: question.section, prompt: question.prompt, options: question.options,
        correctIndex: question.correctIndex, explanation: question.explanation,
        difficulty: "Medium" as const, source: "previous-year", year: question.year,
        sourceName: question.sourceName, sourceUrl: question.sourceUrl,
        yearStatus: question.yearStatus, orderIndex: 5000 + index,
      })));
      await tx.insert(questions).values(buildPracticeBank(ALL_CHAPTERS).map((question, index) => ({
        chapterId: idBySlug.get(question.chapterSlug)!, topicTitle: question.topicTitle,
        section: question.section, prompt: question.prompt, options: question.options,
        correctIndex: question.correct, explanation: question.explanation,
        difficulty: question.difficulty as "Easy" | "Medium" | "Hard", source: question.source, orderIndex: 1000 + index,
      })));
      await tx.insert(profile).values({ id: 1, startDate: todayIso(), examDate: addDays(todayIso(), 59), dailyGoalMinutes: 90 });
      await tx.insert(dayPlans).values(buildDayPlans().map(plan => ({
        dayNumber: plan.dayNumber, phase: plan.phase, title: plan.title, focus: plan.focus,
        section: plan.section, chapterSlugs: plan.chapterSlugs, topicTitles: plan.topicTitles,
        tasks: plan.tasks, targetMinutes: plan.targetMinutes, testKind: plan.testKind, isMilestone: plan.isMilestone,
      })));
    }

    const topicRows = await tx.select({ id: topics.id, chapterId: topics.chapterId, title: topics.title }).from(topics);
    const notesByKey = new Map(ALL_CHAPTERS.flatMap(chapter => chapter.topics.map(topic => {
      const note = getLearningNotes(chapter.slug, topic.title, topic.keyIdea);
      return [`${idBySlug.get(chapter.slug)}:${topic.title}`, note] as const;
    })));
    for (const topic of topicRows) {
      const note = notesByKey.get(`${topic.chapterId}:${topic.title}`);
      if (note) await tx.update(topics).set({ notes: note.notes, shortNotes: note.shortNotes, tricks: note.tricks }).where(eq(topics.id, topic.id));
    }

    await tx.insert(seedState).values({ id: 1, version: SEED_VERSION })
      .onConflictDoUpdate({ target: seedState.id, set: { version: SEED_VERSION, seededAt: new Date() } });
  });
}

export async function ensureSeeded() {
  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build"
  ) {
    return;
  }
  if (!seedPromise) seedPromise = runSeed().catch(error => { seedPromise = null; throw error; });
  await seedPromise;
}
