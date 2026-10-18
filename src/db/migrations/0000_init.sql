CREATE TYPE "public"."opportunity_status" AS ENUM('published', 'withdrawn', 'removed');--> statement-breakpoint
CREATE TYPE "public"."opportunity_type" AS ENUM('CRV', 'CRA', 'OCUPACION', 'NPL', 'COINVERSION');--> statement-breakpoint
CREATE TYPE "public"."report_reason" AS ENUM('fraud', 'misleading', 'inappropriate', 'duplicate', 'other');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('open', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."return_kind" AS ENUM('fixed', 'range');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'banned');--> statement-breakpoint
CREATE TABLE "autonomous_communities" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "autonomous_communities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "municipalities" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"province_code" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provinces" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"community_code" text NOT NULL,
	CONSTRAINT "provinces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "admin_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"reporter_id" uuid NOT NULL,
	"reason" "report_reason" NOT NULL,
	"details" text,
	"status" "report_status" DEFAULT 'open' NOT NULL,
	"resolved_by_id" uuid,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"promoter_id" uuid NOT NULL,
	"type" "opportunity_type" NOT NULL,
	"status" "opportunity_status" DEFAULT 'published' NOT NULL,
	"title" text NOT NULL,
	"description" jsonb NOT NULL,
	"description_text" text DEFAULT '' NOT NULL,
	"amount_to_raise" integer NOT NULL,
	"min_ticket" integer,
	"term_months" smallint NOT NULL,
	"closes_at" timestamp with time zone,
	"return_kind" "return_kind" NOT NULL,
	"return_nominal_min" numeric(6, 2) NOT NULL,
	"return_nominal_max" numeric(6, 2) NOT NULL,
	"return_annual_min" numeric(6, 2) NOT NULL,
	"return_annual_max" numeric(6, 2) NOT NULL,
	"municipality_code" text NOT NULL,
	"province_code" text NOT NULL,
	"community_code" text NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"removed_reason" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opportunities_slug_unique" UNIQUE("slug"),
	CONSTRAINT "opportunities_amount_positive" CHECK ("opportunities"."amount_to_raise" > 0),
	CONSTRAINT "opportunities_min_ticket_valid" CHECK ("opportunities"."min_ticket" IS NULL OR ("opportunities"."min_ticket" > 0 AND "opportunities"."min_ticket" <= "opportunities"."amount_to_raise")),
	CONSTRAINT "opportunities_term_positive" CHECK ("opportunities"."term_months" > 0),
	CONSTRAINT "opportunities_return_ranges" CHECK ("opportunities"."return_nominal_min" <= "opportunities"."return_nominal_max" AND "opportunities"."return_annual_min" <= "opportunities"."return_annual_max")
);
--> statement-breakpoint
CREATE TABLE "opportunity_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"file_name" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"content_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"position" smallint DEFAULT 0 NOT NULL,
	"width" integer,
	"height" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_interests" (
	"opportunity_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opportunity_interests_opportunity_id_user_id_pk" PRIMARY KEY("opportunity_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"banned_reason" text,
	"banned_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerkUserId_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
ALTER TABLE "municipalities" ADD CONSTRAINT "municipalities_province_code_provinces_code_fk" FOREIGN KEY ("province_code") REFERENCES "public"."provinces"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provinces" ADD CONSTRAINT "provinces_community_code_autonomous_communities_code_fk" FOREIGN KEY ("community_code") REFERENCES "public"."autonomous_communities"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_resolved_by_id_users_id_fk" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_promoter_id_users_id_fk" FOREIGN KEY ("promoter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_municipality_code_municipalities_code_fk" FOREIGN KEY ("municipality_code") REFERENCES "public"."municipalities"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_province_code_provinces_code_fk" FOREIGN KEY ("province_code") REFERENCES "public"."provinces"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_community_code_autonomous_communities_code_fk" FOREIGN KEY ("community_code") REFERENCES "public"."autonomous_communities"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_documents" ADD CONSTRAINT "opportunity_documents_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_images" ADD CONSTRAINT "opportunity_images_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_interests" ADD CONSTRAINT "opportunity_interests_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_interests" ADD CONSTRAINT "opportunity_interests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "municipalities_province_code_index" ON "municipalities" USING btree ("province_code");--> statement-breakpoint
CREATE UNIQUE INDEX "municipalities_province_code_slug_index" ON "municipalities" USING btree ("province_code","slug");--> statement-breakpoint
CREATE INDEX "provinces_community_code_index" ON "provinces" USING btree ("community_code");--> statement-breakpoint
CREATE INDEX "admin_audit_log_created_at_index" ON "admin_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reports_opportunity_id_reporter_id_index" ON "reports" USING btree ("opportunity_id","reporter_id");--> statement-breakpoint
CREATE INDEX "reports_status_created_at_index" ON "reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "opportunities_listing_idx" ON "opportunities" USING btree ("status","is_featured" DESC NULLS LAST,"published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "opportunities_promoter_id_index" ON "opportunities" USING btree ("promoter_id");--> statement-breakpoint
CREATE INDEX "opportunities_municipality_code_index" ON "opportunities" USING btree ("municipality_code");--> statement-breakpoint
CREATE INDEX "opportunities_province_code_index" ON "opportunities" USING btree ("province_code");--> statement-breakpoint
CREATE INDEX "opportunities_community_code_index" ON "opportunities" USING btree ("community_code");--> statement-breakpoint
CREATE INDEX "opportunities_type_index" ON "opportunities" USING btree ("type");--> statement-breakpoint
CREATE INDEX "opportunity_documents_opportunity_id_index" ON "opportunity_documents" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "opportunity_images_opportunity_id_position_index" ON "opportunity_images" USING btree ("opportunity_id","position");--> statement-breakpoint
CREATE INDEX "opportunity_interests_user_id_index" ON "opportunity_interests" USING btree ("user_id");