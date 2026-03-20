CREATE TABLE "interactions" (
	"id" bigint PRIMARY KEY NOT NULL,
	"command" varchar(256) NOT NULL,
	"input" jsonb,
	"created_at" timestamp DEFAULT now(),
	"user_id" varchar(256) NOT NULL
);
