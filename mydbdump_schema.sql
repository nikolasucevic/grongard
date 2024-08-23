
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

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."update_job_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_job_status"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_user_rating"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE users
    SET rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM feedback
        WHERE to_id = NEW.to_id
    )
    WHERE id = NEW.to_id;
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_user_rating"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" "uuid",
    "sender_id" "uuid",
    "recipient_id" "uuid",
    "content" "text" NOT NULL,
    "sent_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "read_at" timestamp with time zone
);

ALTER TABLE "public"."chat_messages" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."disputes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" "uuid",
    "initiator_id" "uuid",
    "respondent_id" "uuid",
    "reason" "text" NOT NULL,
    "description" "text",
    "status" "text" NOT NULL,
    "created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "resolution" "text",
    "evidence" "text"[]
);

ALTER TABLE "public"."disputes" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."feedback" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" "uuid",
    "from_id" "uuid",
    "to_id" "uuid",
    "rating" integer NOT NULL,
    "comment" "text",
    "created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "response" "text"
);

ALTER TABLE "public"."feedback" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid",
    "provider_id" "uuid",
    "description" "text" NOT NULL,
    "status" "text" NOT NULL,
    "price" numeric NOT NULL,
    "created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "deadline" timestamp with time zone,
    "complexity" "text",
    "estimated_hours" integer,
    "location" "text",
    "tags" "text"[]
);

ALTER TABLE "public"."jobs" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "type" "text" NOT NULL,
    "message" "text" NOT NULL,
    "related_id" "uuid",
    "created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "read_at" timestamp with time zone
);

ALTER TABLE "public"."notifications" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" "uuid",
    "amount" numeric NOT NULL,
    "status" "text" NOT NULL,
    "method" "text" NOT NULL,
    "transaction_id" "text",
    "initiated_date" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "completed_date" timestamp with time zone,
    "from_id" "uuid",
    "to_id" "uuid"
);

ALTER TABLE "public"."payments" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text",
    "user_type" "text" NOT NULL,
    "rating" numeric(3,2) DEFAULT 0,
    "balance" numeric(10,2) DEFAULT 0,
    "created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "last_active" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "preferences" "jsonb" DEFAULT '{"language": "sv", "notifications": true}'::"jsonb",
    "specialties" "text"[] DEFAULT '{}'::"text"[],
    CONSTRAINT "users_user_type_check" CHECK (("user_type" = ANY (ARRAY['customer'::"text", 'provider'::"text", 'admin'::"text"])))
);

ALTER TABLE "public"."users" OWNER TO "postgres";

ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id");

ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_initiator_id_fkey" FOREIGN KEY ("initiator_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id");

ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_respondent_id_fkey" FOREIGN KEY ("respondent_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id");

ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id");

ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "auth"."users"("id");

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."update_job_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_job_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_job_status"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_user_rating"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_rating"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_rating"() TO "service_role";

GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";

GRANT ALL ON TABLE "public"."disputes" TO "anon";
GRANT ALL ON TABLE "public"."disputes" TO "authenticated";
GRANT ALL ON TABLE "public"."disputes" TO "service_role";

GRANT ALL ON TABLE "public"."feedback" TO "anon";
GRANT ALL ON TABLE "public"."feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback" TO "service_role";

GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";

GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";

GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
