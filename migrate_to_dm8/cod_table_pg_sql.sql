/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : PostgreSQL
 Source Server Version : 160000 (160000)
 Source Host           : localhost:15432
 Source Catalog        : cod
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 160000 (160000)
 File Encoding         : 65001

 Date: 17/12/2023 12:24:42
*/


-- ----------------------------
-- Sequence structure for call_record_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."call_record_id_seq";
CREATE SEQUENCE "public"."call_record_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "public"."call_record_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for cod_record_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."cod_record_id_seq";
CREATE SEQUENCE "public"."cod_record_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "public"."cod_record_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for customers_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customers_id_seq";
CREATE SEQUENCE "public"."customers_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "public"."customers_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for teams_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."teams_id_seq";
CREATE SEQUENCE "public"."teams_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "public"."teams_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for users_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."users_id_seq";
CREATE SEQUENCE "public"."users_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "public"."users_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Table structure for TeamCustomer
-- ----------------------------
DROP TABLE IF EXISTS "public"."TeamCustomer";
CREATE TABLE "public"."TeamCustomer" (
  "team_id" int4 NOT NULL DEFAULT 0,
  "customer_id" int4 NOT NULL DEFAULT 0,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL,
  "TeamId" int4 NOT NULL,
  "CustomerId" int4 NOT NULL
)
;
ALTER TABLE "public"."TeamCustomer" OWNER TO "postgres";

-- ----------------------------
-- Table structure for call_record
-- ----------------------------
DROP TABLE IF EXISTS "public"."call_record";
CREATE TABLE "public"."call_record" (
  "id" int4 NOT NULL DEFAULT nextval('call_record_id_seq'::regclass),
  "callee" json,
  "callTime" timestamptz(6),
  "answerTime" timestamptz(6),
  "callStatus" int4,
  "status" int4 NOT NULL,
  "ttsFileId" text COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL,
  "CodRecordId" int4
)
;
ALTER TABLE "public"."call_record" OWNER TO "postgres";

-- ----------------------------
-- Table structure for cod_record
-- ----------------------------
DROP TABLE IF EXISTS "public"."cod_record";
CREATE TABLE "public"."cod_record" (
  "id" int4 NOT NULL DEFAULT nextval('cod_record_id_seq'::regclass),
  "pendingTime" int4,
  "retryTimes" int4,
  "textTemplate" text COLLATE "pg_catalog"."default",
  "codStatus" int4,
  "status" int4 NOT NULL,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "public"."cod_record" OWNER TO "postgres";

-- ----------------------------
-- Table structure for customers
-- ----------------------------
DROP TABLE IF EXISTS "public"."customers";
CREATE TABLE "public"."customers" (
  "id" int4 NOT NULL DEFAULT nextval('customers_id_seq'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "phone" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "org" varchar(255) COLLATE "pg_catalog"."default",
  "job" varchar(255) COLLATE "pg_catalog"."default",
  "status" int4 NOT NULL,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "public"."customers" OWNER TO "postgres";

-- ----------------------------
-- Table structure for teams
-- ----------------------------
DROP TABLE IF EXISTS "public"."teams";
CREATE TABLE "public"."teams" (
  "id" int4 NOT NULL DEFAULT nextval('teams_id_seq'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "location" varchar(255) COLLATE "pg_catalog"."default",
  "description" varchar(255) COLLATE "pg_catalog"."default",
  "status" int4 NOT NULL,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "public"."teams" OWNER TO "postgres";

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "public"."users";
CREATE TABLE "public"."users" (
  "id" int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  "username" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "password" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "role" varchar(255) COLLATE "pg_catalog"."default",
  "status" int4 NOT NULL,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "public"."users" OWNER TO "postgres";

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."call_record_id_seq"
OWNED BY "public"."call_record"."id";
SELECT setval('"public"."call_record_id_seq"', 19, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."cod_record_id_seq"
OWNED BY "public"."cod_record"."id";
SELECT setval('"public"."cod_record_id_seq"', 19, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."customers_id_seq"
OWNED BY "public"."customers"."id";
SELECT setval('"public"."customers_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."teams_id_seq"
OWNED BY "public"."teams"."id";
SELECT setval('"public"."teams_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."users_id_seq"
OWNED BY "public"."users"."id";
SELECT setval('"public"."users_id_seq"', 1, true);

-- ----------------------------
-- Primary Key structure for table TeamCustomer
-- ----------------------------
ALTER TABLE "public"."TeamCustomer" ADD CONSTRAINT "TeamCustomer_pkey" PRIMARY KEY ("TeamId", "CustomerId");

-- ----------------------------
-- Primary Key structure for table call_record
-- ----------------------------
ALTER TABLE "public"."call_record" ADD CONSTRAINT "call_record_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table cod_record
-- ----------------------------
ALTER TABLE "public"."cod_record" ADD CONSTRAINT "cod_record_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table customers
-- ----------------------------
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table teams
-- ----------------------------
ALTER TABLE "public"."teams" ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table TeamCustomer
-- ----------------------------
ALTER TABLE "public"."TeamCustomer" ADD CONSTRAINT "TeamCustomer_CustomerId_fkey" FOREIGN KEY ("CustomerId") REFERENCES "public"."customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."TeamCustomer" ADD CONSTRAINT "TeamCustomer_TeamId_fkey" FOREIGN KEY ("TeamId") REFERENCES "public"."teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table call_record
-- ----------------------------
ALTER TABLE "public"."call_record" ADD CONSTRAINT "call_record_CodRecordId_fkey" FOREIGN KEY ("CodRecordId") REFERENCES "public"."cod_record" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
