CREATE TYPE "public"."staff_branch_code" AS ENUM('close', 'eventer', 'moderation', 'support');--> statement-breakpoint
CREATE TYPE "public"."staff_discipline_type" AS ENUM('warning', 'reprimand');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('owner', 'dev', 'staff_admin', 'admin', 'magister', 'curator', 'staff_member');--> statement-breakpoint
CREATE TABLE "careers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar NOT NULL,
	"role_id" varchar NOT NULL,
	"question1" varchar NOT NULL,
	"question2" varchar NOT NULL,
	"available" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"display_name" varchar,
	"is_global_blacklisted" boolean DEFAULT false NOT NULL,
	"global_blacklist_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "personal_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "staff_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"branch_id" uuid,
	"role" "staff_role" NOT NULL,
	"assigned_by_user_id" varchar NOT NULL,
	"reason" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp,
	CONSTRAINT "staff_assignments_role_branch_consistency_chk" CHECK ((
        "staff_assignments"."role" in ('owner', 'dev', 'staff_admin')
        and "staff_assignments"."branch_id" is null
      ) or (
        "staff_assignments"."role" in ('admin', 'magister', 'curator', 'staff_member')
        and "staff_assignments"."branch_id" is not null
      ))
);
--> statement-breakpoint
CREATE TABLE "staff_branch_blacklists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"branch_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"issued_by_user_id" varchar NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"revoked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "staff_branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" "staff_branch_code" NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_disciplinary_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"branch_id" uuid,
	"type" "staff_discipline_type" NOT NULL,
	"points" integer DEFAULT 1 NOT NULL,
	"reason" text NOT NULL,
	"issued_by_user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_global_blacklists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"reason" text NOT NULL,
	"issued_by_user_id" varchar NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"revoked_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "continuity" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "staff_assignments" ADD CONSTRAINT "staff_assignments_branch_id_staff_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."staff_branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_branch_blacklists" ADD CONSTRAINT "staff_branch_blacklists_branch_id_staff_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."staff_branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_disciplinary_actions" ADD CONSTRAINT "staff_disciplinary_actions_branch_id_staff_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."staff_branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "staff_assignments_user_id_idx" ON "staff_assignments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "staff_assignments_branch_id_idx" ON "staff_assignments" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "staff_assignments_role_idx" ON "staff_assignments" USING btree ("role");--> statement-breakpoint
CREATE INDEX "staff_assignments_active_idx" ON "staff_assignments" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_assignments_one_admin_per_branch_unique" ON "staff_assignments" USING btree ("branch_id") WHERE "staff_assignments"."role" = 'admin' and "staff_assignments"."active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "staff_assignments_one_active_role_per_branch_user_unique" ON "staff_assignments" USING btree ("user_id","branch_id") WHERE "staff_assignments"."active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "staff_assignments_one_management_role_per_user_unique" ON "staff_assignments" USING btree ("user_id") WHERE "staff_assignments"."role" in ('admin', 'magister', 'curator') and "staff_assignments"."active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "staff_assignments_one_global_role_per_user_unique" ON "staff_assignments" USING btree ("user_id") WHERE "staff_assignments"."role" in ('owner', 'dev', 'staff_admin') and "staff_assignments"."active" = true;--> statement-breakpoint
CREATE INDEX "staff_branch_blacklists_user_id_idx" ON "staff_branch_blacklists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "staff_branch_blacklists_branch_id_idx" ON "staff_branch_blacklists" USING btree ("branch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_branch_blacklists_one_active_per_user_branch_unique" ON "staff_branch_blacklists" USING btree ("user_id","branch_id") WHERE "staff_branch_blacklists"."active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "staff_branches_code_unique" ON "staff_branches" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_branches_name_unique" ON "staff_branches" USING btree ("name");--> statement-breakpoint
CREATE INDEX "staff_disciplinary_actions_user_id_idx" ON "staff_disciplinary_actions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "staff_disciplinary_actions_branch_id_idx" ON "staff_disciplinary_actions" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "staff_disciplinary_actions_type_idx" ON "staff_disciplinary_actions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "staff_global_blacklists_user_id_idx" ON "staff_global_blacklists" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_global_blacklists_one_active_per_user_unique" ON "staff_global_blacklists" USING btree ("user_id") WHERE "staff_global_blacklists"."active" = true;