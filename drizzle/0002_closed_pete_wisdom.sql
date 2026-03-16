CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(80) NOT NULL,
	"emoji" varchar(10) DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "findings" ADD COLUMN "assignee_id" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_slug_idx" ON "profiles" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_assignee_id_profiles_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;