
DROP SEQUENCE IF EXISTS "call_record_id_seq";
CREATE SEQUENCE "call_record_id_seq" 
INCREMENT BY 1
START WITH 1;

-- ----------------------------
-- Sequence structure for cod_record_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "cod_record_id_seq";
CREATE SEQUENCE "cod_record_id_seq" 
INCREMENT BY 1
START WITH 1;

-- ----------------------------
-- Sequence structure for customers_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "customers_id_seq";
CREATE SEQUENCE "customers_id_seq" 
INCREMENT BY 1
START WITH 1;

-- ----------------------------
-- Sequence structure for teams_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "teams_id_seq";
CREATE SEQUENCE "teams_id_seq" 
INCREMENT BY 1
START WITH 1;

-- ----------------------------
-- Sequence structure for users_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "users_id_seq";
CREATE SEQUENCE "users_id_seq" 
INCREMENT BY 1
START WITH 1;


-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "users";
CREATE TABLE "users" (
  "id" int NOT NULL DEFAULT "users_id_seq".NEXTVAL,
  "username" varchar(255)  NOT NULL,
  "password" varchar(255)  NOT NULL,
  "role" varchar(255),
  "status" int NOT NULL,
  "createdAt" TIMESTAMP(6) NOT NULL,
  "updatedAt" TIMESTAMP(6) NOT NULL
);

-- ----------------------------
-- Table structure for customers
-- ----------------------------
DROP TABLE IF EXISTS "customers";
CREATE TABLE "customers" (
  "id" int NOT NULL DEFAULT "customers_id_seq".NEXTVAL,
  "name" varchar(255) NOT NULL,
  "phone" varchar(255) NOT NULL,
  "org" varchar(255),
  "job" varchar(255),
  "status" int NOT NULL,
  "createdAt" TIMESTAMP(6) NOT NULL,
  "updatedAt" TIMESTAMP(6) NOT NULL
);

-- ----------------------------
-- Table structure for teams
-- ----------------------------
DROP TABLE IF EXISTS "teams";
CREATE TABLE "teams" (
  "id" int NOT NULL DEFAULT "teams_id_seq".nextval,
  "name" varchar(255) NOT NULL,
  "location" varchar(255),
  "description" varchar(255),
  "status" int NOT NULL,
  "createdAt" timestamp(6) NOT NULL,
  "updatedAt" timestamp(6) NOT NULL
);

-- ----------------------------
-- Table structure for TeamCustomer
-- ----------------------------
DROP TABLE IF EXISTS "TeamCustomer";
CREATE TABLE "TeamCustomer" (
  "team_id" int NOT NULL DEFAULT 0,
  "customer_id" int NOT NULL DEFAULT 0,
  "createdAt" timestamp(6) NOT NULL,
  "updatedAt" timestamp(6) NOT NULL
);

-- ----------------------------
-- Table structure for call_record
-- ----------------------------
DROP TABLE IF EXISTS "call_record";
CREATE TABLE "call_record" (
  "id" int NOT NULL DEFAULT "call_record_id_seq".nextval,
  "callee" text,
  "callTime" timestamp(6),
  "answerTime" timestamp(6),
  "callStatus" int,
  "status" int NOT NULL,
  "ttsFileId" text,
  "createdAt" timestamp(6) NOT NULL,
  "updatedAt" timestamp(6) NOT NULL,
  "CodRecordId" int
);

-- ----------------------------
-- Table structure for cod_record
-- ----------------------------
DROP TABLE IF EXISTS "cod_record";
CREATE TABLE "cod_record" (
  "id" int NOT NULL DEFAULT "cod_record_id_seq".nextval,
  "pendingTime" int,
  "retryTimes" int,
  "textTemplate" text,
  "codStatus" int,
  "status" int NOT NULL,
  "createdAt" timestamp(6) NOT NULL,
  "updatedAt" timestamp(6) NOT NULL
);

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table customers
-- ----------------------------
ALTER TABLE "customers" ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");
-- ----------------------------
-- Primary Key structure for table teams
-- ----------------------------
ALTER TABLE "teams" ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table TeamCustomer
-- ----------------------------
ALTER TABLE "TeamCustomer" ADD CONSTRAINT "TeamCustomer_pkey" PRIMARY KEY ("team_id", "customer_id");

-- ----------------------------
-- Primary Key structure for table cod_record
-- ----------------------------
ALTER TABLE "cod_record" ADD CONSTRAINT "cod_record_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table call_record
-- ----------------------------
ALTER TABLE "call_record" ADD CONSTRAINT "call_record_pkey" PRIMARY KEY ("id");








ALTER TABLE "TeamCustomer" ADD CONSTRAINT "TeamCustomer_CustomerId_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamCustomer" ADD CONSTRAINT "TeamCustomer_TeamId_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table call_record
-- ----------------------------
ALTER TABLE "call_record" ADD CONSTRAINT "call_record_CodRecordId_fkey" FOREIGN KEY ("CodRecordId") REFERENCES "cod_record" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
