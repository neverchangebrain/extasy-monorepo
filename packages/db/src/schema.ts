import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const continuity = pgTable("continuity", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const careers = pgTable("careers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  description: varchar("description").notNull(),
  roleId: varchar("role_id").notNull(),
  question1: varchar("question1").notNull(),
  question2: varchar("question2").notNull(),
  available: boolean("available").default(true).notNull(),
});
