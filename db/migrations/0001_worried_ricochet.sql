CREATE TABLE "kb_document_versions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"document_id" bigint NOT NULL,
	"version" integer NOT NULL,
	"content" text NOT NULL,
	"change_note" text,
	"refined_from_source_id" bigint,
	"author" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kb_document_version_unique" UNIQUE("document_id","version")
);
--> statement-breakpoint
CREATE TABLE "kb_documents" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"title" text NOT NULL,
	"active_version_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "kb_documents_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "kb_source_types" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	CONSTRAINT "kb_source_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "kb_sources" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"type_id" bigint NOT NULL,
	"filename" text,
	"raw_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "kb_document_versions" ADD CONSTRAINT "kb_document_versions_document_id_kb_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."kb_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kb_document_versions" ADD CONSTRAINT "kb_document_versions_refined_from_source_id_kb_sources_id_fk" FOREIGN KEY ("refined_from_source_id") REFERENCES "public"."kb_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kb_sources" ADD CONSTRAINT "kb_sources_type_id_kb_source_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."kb_source_types"("id") ON DELETE no action ON UPDATE no action;