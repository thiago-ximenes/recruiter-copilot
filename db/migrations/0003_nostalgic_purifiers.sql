ALTER TABLE "gaps" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "deleted_at" timestamp with time zone;