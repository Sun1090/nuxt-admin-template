-- Nuxt Admin Template - 初始迁移
-- 创建所有系统表

CREATE TYPE "status" AS ENUM('active', 'inactive', 'suspended');

CREATE TABLE IF NOT EXISTS "Role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"remark" varchar,
	"is_superadmin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "User" (
	"id" serial PRIMARY KEY,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"name" text,
	"email" text,
	"phone" text,
	"avatar" text,
	"role_id" uuid REFERENCES "Role"("id"),
	"last_login" timestamp,
	"lastLoginIp" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"passwordChangedAt" timestamp,
	"forcePasswordChange" boolean DEFAULT true NOT NULL,
	"status" "status" DEFAULT 'active' NOT NULL,
	"statusChangedAt" timestamp DEFAULT now(),
	"statusChangedBy" integer
);

CREATE TABLE IF NOT EXISTS "Permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"remark" varchar,
	"category" varchar(20),
	"resource" varchar(50),
	"action" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "Role_Permissions" (
	"role_id" uuid NOT NULL REFERENCES "Role"("id"),
	"permission_id" uuid NOT NULL REFERENCES "Permissions"("id"),
	CONSTRAINT "Role_Permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);

CREATE TABLE IF NOT EXISTS "SystemSettings" (
	"id" serial PRIMARY KEY,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"enablePlayTimeSelection" boolean DEFAULT false NOT NULL,
	"siteTitle" text,
	"siteLogoUrl" text
);

CREATE TABLE IF NOT EXISTS "Notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"userId" integer NOT NULL REFERENCES "User"("id")
);

CREATE TABLE IF NOT EXISTS "NotificationSettings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" integer NOT NULL REFERENCES "User"("id") UNIQUE,
	"enabled" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"remark" text,
	"key_hash" varchar(255) NOT NULL UNIQUE,
	"key_prefix" varchar(10) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	"created_by_user_id" integer NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS "api_key_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" uuid NOT NULL,
	"permission" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "api_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" uuid,
	"endpoint" varchar(500) NOT NULL,
	"method" varchar(10) NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"status_code" integer NOT NULL,
	"response_time_ms" integer NOT NULL,
	"request_body" text,
	"response_body" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"error_message" text
);

CREATE TABLE IF NOT EXISTS "user_status_logs" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL REFERENCES "User"("id"),
	"old_status" "status",
	"new_status" "status" NOT NULL,
	"reason" text,
	"operator_id" integer REFERENCES "User"("id"),
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "EmailTemplate" (
	"id" serial PRIMARY KEY,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"key" varchar NOT NULL,
	"name" varchar(200) NOT NULL,
	"subject" varchar(300) NOT NULL,
	"html" text NOT NULL,
	"updatedByUserId" integer
);

-- 创建索引
CREATE INDEX IF NOT EXISTS "User_role_id_idx" ON "User"("role_id");
CREATE INDEX IF NOT EXISTS "User_username_idx" ON "User"("username");
CREATE INDEX IF NOT EXISTS "Role_Permissions_role_id_idx" ON "Role_Permissions"("role_id");
CREATE INDEX IF NOT EXISTS "Role_Permissions_permission_id_idx" ON "Role_Permissions"("permission_id");
CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "api_logs_api_key_id_idx" ON "api_logs"("api_key_id");
CREATE INDEX IF NOT EXISTS "api_logs_created_at_idx" ON "api_logs"("created_at");
CREATE INDEX IF NOT EXISTS "user_status_logs_user_id_idx" ON "user_status_logs"("user_id");
