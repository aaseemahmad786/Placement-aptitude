CREATE TABLE IF NOT EXISTS "chapters" (
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
);

CREATE TABLE IF NOT EXISTS "topics" (
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
);

CREATE TABLE IF NOT EXISTS "questions" (
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
);

CREATE TABLE IF NOT EXISTS "day_plans" (
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
);

CREATE TABLE IF NOT EXISTS "profile" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"start_date" date NOT NULL,
	"exam_date" date,
	"daily_goal_minutes" integer DEFAULT 90 NOT NULL
);

CREATE TABLE IF NOT EXISTS "daily_progress" (
	"day_number" integer PRIMARY KEY NOT NULL,
	"completed" boolean DEFAULT true NOT NULL,
	"minutes" integer DEFAULT 0 NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "topic_progress" (
	"topic_id" integer PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'not-started' NOT NULL,
	"confidence" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "test_attempts" (
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
);

CREATE TABLE IF NOT EXISTS "attempt_answers" (
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
);

CREATE TABLE IF NOT EXISTS "question_bookmarks" (
	"question_id" integer PRIMARY KEY REFERENCES "questions"("id") ON DELETE CASCADE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "seed_state" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"version" text NOT NULL,
	"seeded_at" timestamp with time zone DEFAULT now() NOT NULL
);
