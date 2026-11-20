CREATE TABLE "attempt_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"attempt_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"chapter_id" integer NOT NULL,
	"topic_title" text NOT NULL,
	"section" text NOT NULL,
	"selected_index" integer,
	"correct_index" integer NOT NULL,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"section" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"icon" text NOT NULL,
	"priority" text NOT NULL,
	"exam_weight" integer NOT NULL,
	"estimated_minutes" integer NOT NULL,
	"order_index" integer NOT NULL,
	CONSTRAINT "chapters_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "daily_progress" (
	"day_number" integer PRIMARY KEY NOT NULL,
	"completed" boolean DEFAULT true NOT NULL,
	"minutes" integer DEFAULT 0 NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "day_plans" (
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
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"start_date" date NOT NULL,
	"exam_date" date,
	"daily_goal_minutes" integer DEFAULT 90 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"chapter_id" integer NOT NULL,
	"topic_title" text NOT NULL,
	"section" text NOT NULL,
	"prompt" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_index" integer NOT NULL,
	"explanation" text NOT NULL,
	"difficulty" text NOT NULL,
	"source" text NOT NULL,
	"order_index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seed_state" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"version" text NOT NULL,
	"seeded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_attempts" (
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
--> statement-breakpoint
CREATE TABLE "topic_progress" (
	"topic_id" integer PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'not-started' NOT NULL,
	"confidence" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"chapter_id" integer NOT NULL,
	"title" text NOT NULL,
	"minutes" integer NOT NULL,
	"difficulty" text NOT NULL,
	"key_idea" text NOT NULL,
	"routine" jsonb NOT NULL,
	"order_index" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attempt_id_test_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."test_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;