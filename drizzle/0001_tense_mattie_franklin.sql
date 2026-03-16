CREATE TYPE "public"."finding_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."finding_status" AS ENUM('draft', 'open', 'in_progress', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TABLE "findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text DEFAULT '',
	"status" "finding_status" DEFAULT 'draft' NOT NULL,
	"priority" "finding_priority" DEFAULT 'medium' NOT NULL,
	"tags" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "findings_project_idx" ON "findings" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "findings_status_idx" ON "findings" USING btree ("status");