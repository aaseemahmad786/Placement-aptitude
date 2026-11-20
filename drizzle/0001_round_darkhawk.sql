CREATE TABLE "question_bookmarks" (
	"question_id" integer PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "year" integer;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "source_name" text;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "source_url" text;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "year_status" text DEFAULT 'original' NOT NULL;--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "notes" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "short_notes" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "tricks" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "question_bookmarks" ADD CONSTRAINT "question_bookmarks_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;