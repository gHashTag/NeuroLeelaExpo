CREATE TABLE "chat_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_number" integer NOT NULL,
	"user_message" text NOT NULL,
	"ai_response" text NOT NULL,
	"report_id" integer,
	"message_type" text DEFAULT 'report' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" text PRIMARY KEY NOT NULL,
	"plan" integer DEFAULT 1 NOT NULL,
	"previous_plan" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"message" text,
	"avatar" text,
	"full_name" text,
	"intention" text,
	"is_start" boolean DEFAULT false,
	"is_finished" boolean DEFAULT false,
	"consecutive_sixes" integer DEFAULT 0,
	"position_before_three_sixes" integer DEFAULT 0,
	"needs_report" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_number" integer NOT NULL,
	"content" text NOT NULL,
	"likes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
