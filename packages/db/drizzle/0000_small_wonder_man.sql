CREATE TABLE "continuity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"data" jsonb,
	"created_at" timestamp DEFAULT now()
);
