SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgsodium";
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

COMMENT ON SCHEMA "public" IS 'standard public schema';

-- Functions
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, company, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;

-- Tables
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "company" "text" NOT NULL,
    "role" "text" NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."toolbox_meetings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "job_title" "text" NOT NULL,
    "job_description" "text" NOT NULL,
    "company" "text" NOT NULL,
    "site_address" "text" NOT NULL,
    "supervisor_name" "text" NOT NULL,
    "supervisor_phone" "text" NOT NULL,
    "emergency_site_number" "text" NOT NULL,
    "weather_conditions" "text" NOT NULL,
    "temperature" numeric NOT NULL,
    "road_conditions" "text",
    "date" "text" NOT NULL,
    "time" "text" NOT NULL,
    "hazards" "jsonb" DEFAULT '{"ppe": false, "driving": false, "heat_cold": false, "other_trades": false, "pinch_points": false, "heavy_lifting": false, "confined_space": false, "electrical_work": false, "open_excavation": false, "hand_power_tools": false, "mobile_equipment": false, "slips_trips_falls": false, "working_at_heights": false}'::"jsonb" NOT NULL,
    "additional_comments" "text",
    "ai_safety_summary" "text",
    "has_safety_plan" boolean DEFAULT false,
    "safety_standards" TEXT,
    "safety_standards_sources" JSONB,
    "safety_standards_metadata" JSONB
);

CREATE TABLE IF NOT EXISTS "public"."safety_plans" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "meeting_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

-- Primary Keys
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."toolbox_meetings"
    ADD CONSTRAINT "toolbox_meetings_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."safety_plans"
    ADD CONSTRAINT "safety_plans_pkey" PRIMARY KEY ("id");

-- Indexes
CREATE INDEX "idx_safety_plans_meeting_id" ON "public"."safety_plans" USING "btree" ("meeting_id");

-- Triggers
CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE OR REPLACE TRIGGER "update_toolbox_meetings_updated_at" BEFORE UPDATE ON "public"."toolbox_meetings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Foreign Keys
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."toolbox_meetings"
    ADD CONSTRAINT "toolbox_meetings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."safety_plans"
    ADD CONSTRAINT "safety_plans_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "public"."toolbox_meetings"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."safety_plans"
    ADD CONSTRAINT "safety_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- Row Level Security
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."toolbox_meetings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."safety_plans" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));
CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));

CREATE POLICY "Users can view their own meetings" ON "public"."toolbox_meetings" FOR SELECT USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can create their own meetings" ON "public"."toolbox_meetings" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can update their own meetings" ON "public"."toolbox_meetings" FOR UPDATE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can delete their own meetings" ON "public"."toolbox_meetings" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "select_safety_plans" ON "public"."safety_plans" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));
CREATE POLICY "insert_safety_plans" ON "public"."safety_plans" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));
CREATE POLICY "delete_safety_plans" ON "public"."safety_plans" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"())); 