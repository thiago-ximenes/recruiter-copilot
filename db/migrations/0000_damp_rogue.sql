CREATE TABLE "gaps" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"reason" text,
	"role_context" text,
	"lang" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text,
	"company" text,
	"role" text,
	"contact" text,
	"jd_text" text,
	"lang" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_versions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"prompt_id" bigint NOT NULL,
	"version" integer NOT NULL,
	"content" text NOT NULL,
	"change_note" text,
	"author" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prompt_version_unique" UNIQUE("prompt_id","version")
);
--> statement-breakpoint
CREATE TABLE "prompts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"active_version_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "prompts_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "prompt_versions" ADD CONSTRAINT "prompt_versions_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE no action ON UPDATE no action;