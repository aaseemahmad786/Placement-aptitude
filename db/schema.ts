import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  date,
  real,
} from "drizzle-orm/pg-core";
import type {
  DayTask,
  Difficulty,
  Priority,
  SectionKey,
  TopicStatus,
} from "@/lib/types";

export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  section: text("section").$type<SectionKey>().notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  icon: text("icon").notNull(),
  priority: text("priority").$type<Priority>().notNull(),
  examWeight: integer("exam_weight").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull(),
  orderIndex: integer("order_index").notNull(),
});

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  minutes: integer("minutes").notNull(),
  difficulty: text("difficulty").$type<Difficulty>().notNull(),
  keyIdea: text("key_idea").notNull(),
  routine: jsonb("routine").$type<string[]>().notNull(),
  notes: jsonb("notes").$type<string[]>().notNull().default([]),
  shortNotes: jsonb("short_notes").$type<string[]>().notNull().default([]),
  tricks: jsonb("tricks").$type<string[]>().notNull().default([]),
  orderIndex: integer("order_index").notNull(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
  topicTitle: text("topic_title").notNull(),
  section: text("section").$type<SectionKey>().notNull(),
  prompt: text("prompt").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctIndex: integer("correct_index").notNull(),
  explanation: text("explanation").notNull(),
  difficulty: text("difficulty").$type<Difficulty>().notNull(),
  source: text("source").notNull(),
  year: integer("year"),
  sourceName: text("source_name"),
  sourceUrl: text("source_url"),
  yearStatus: text("year_status").notNull().default("original"),
  orderIndex: integer("order_index").notNull(),
});

export const dayPlans = pgTable("day_plans", {
  dayNumber: integer("day_number").primaryKey(),
  phase: text("phase").notNull(),
  title: text("title").notNull(),
  focus: text("focus").notNull(),
  section: text("section").notNull(),
  chapterSlugs: jsonb("chapter_slugs").$type<string[]>().notNull(),
  topicTitles: jsonb("topic_titles").$type<string[]>().notNull(),
  tasks: jsonb("tasks").$type<DayTask[]>().notNull(),
  targetMinutes: integer("target_minutes").notNull(),
  testKind: text("test_kind").notNull(),
  isMilestone: boolean("is_milestone").notNull().default(false),
});

export const profile = pgTable("profile", {
  id: integer("id").primaryKey().default(1),
  startDate: date("start_date").notNull(),
  examDate: date("exam_date"),
  dailyGoalMinutes: integer("daily_goal_minutes").notNull().default(90),
});

export const dailyProgress = pgTable("daily_progress", {
  dayNumber: integer("day_number").primaryKey(),
  completed: boolean("completed").notNull().default(true),
  minutes: integer("minutes").notNull().default(0),
  note: text("note").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const topicProgress = pgTable("topic_progress", {
  topicId: integer("topic_id").primaryKey(),
  status: text("status").$type<TopicStatus>().notNull().default("not-started"),
  confidence: integer("confidence").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const testAttempts = pgTable("test_attempts", {
  id: serial("id").primaryKey(),
  scope: text("scope").notNull(),
  title: text("title").notNull(),
  section: text("section"),
  chapterSlug: text("chapter_slug"),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  accuracy: real("accuracy").notNull(),
  seconds: integer("seconds").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const attemptAnswers = pgTable("attempt_answers", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id").notNull().references(() => testAttempts.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull(),
  chapterId: integer("chapter_id").notNull(),
  topicTitle: text("topic_title").notNull(),
  section: text("section").$type<SectionKey>().notNull(),
  selectedIndex: integer("selected_index"),
  correctIndex: integer("correct_index").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const questionBookmarks = pgTable("question_bookmarks", {
  questionId: integer("question_id").primaryKey().references(() => questions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const seedState = pgTable("seed_state", {
  id: integer("id").primaryKey().default(1),
  version: text("version").notNull(),
  seededAt: timestamp("seeded_at", { withTimezone: true }).notNull().defaultNow(),
});
