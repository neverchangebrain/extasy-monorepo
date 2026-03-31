import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const staffBranchCode = pgEnum("staff_branch_code", [
  "close",
  "eventer",
  "moderation",
  "support",
]);

export const staffRole = pgEnum("staff_role", [
  "owner",
  "dev",
  "staff_admin",
  "admin",
  "magister",
  "curator",
  "staff_member",
]);

export const staffDisciplineType = pgEnum("staff_discipline_type", [
  "warning",
  "reprimand",
]);

export const continuity = pgTable("continuity", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const personal = pgTable("personal", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().unique(),
  displayName: varchar("display_name"),
  isGlobalBlacklisted: boolean("is_global_blacklisted")
    .default(false)
    .notNull(),
  globalBlacklistReason: text("global_blacklist_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const staffBranches = pgTable(
  "staff_branches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: staffBranchCode("code").notNull(),
    name: varchar("name", { length: 64 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("staff_branches_code_unique").on(table.code),
    uniqueIndex("staff_branches_name_unique").on(table.name),
  ],
);

export const staffAssignments = pgTable(
  "staff_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id").notNull(),
    branchId: uuid("branch_id").references(() => staffBranches.id, {
      onDelete: "cascade",
    }),
    role: staffRole("role").notNull(),
    assignedByUserId: varchar("assigned_by_user_id").notNull(),
    reason: text("reason"),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    closedAt: timestamp("closed_at"),
  },
  (table) => [
    index("staff_assignments_user_id_idx").on(table.userId),
    index("staff_assignments_branch_id_idx").on(table.branchId),
    index("staff_assignments_role_idx").on(table.role),
    index("staff_assignments_active_idx").on(table.active),

    uniqueIndex("staff_assignments_one_admin_per_branch_unique")
      .on(table.branchId)
      .where(sql`${table.role} = 'admin' and ${table.active} = true`),

    uniqueIndex("staff_assignments_one_active_role_per_branch_user_unique")
      .on(table.userId, table.branchId)
      .where(sql`${table.active} = true`),

    uniqueIndex("staff_assignments_one_management_role_per_user_unique")
      .on(table.userId)
      .where(
        sql`${table.role} in ('admin', 'magister', 'curator') and ${table.active} = true`,
      ),

    uniqueIndex("staff_assignments_one_global_role_per_user_unique")
      .on(table.userId)
      .where(
        sql`${table.role} in ('owner', 'dev', 'staff_admin') and ${table.active} = true`,
      ),

    check(
      "staff_assignments_role_branch_consistency_chk",
      sql`(
        ${table.role} in ('owner', 'dev', 'staff_admin')
        and ${table.branchId} is null
      ) or (
        ${table.role} in ('admin', 'magister', 'curator', 'staff_member')
        and ${table.branchId} is not null
      )`,
    ),
  ],
);

export const staffGlobalBlacklists = pgTable(
  "staff_global_blacklists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id").notNull(),
    reason: text("reason").notNull(),
    issuedByUserId: varchar("issued_by_user_id").notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
    revokedAt: timestamp("revoked_at"),
  },
  (table) => [
    index("staff_global_blacklists_user_id_idx").on(table.userId),
    uniqueIndex("staff_global_blacklists_one_active_per_user_unique")
      .on(table.userId)
      .where(sql`${table.active} = true`),
  ],
);

export const staffBranchBlacklists = pgTable(
  "staff_branch_blacklists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id").notNull(),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => staffBranches.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    issuedByUserId: varchar("issued_by_user_id").notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
    revokedAt: timestamp("revoked_at"),
  },
  (table) => [
    index("staff_branch_blacklists_user_id_idx").on(table.userId),
    index("staff_branch_blacklists_branch_id_idx").on(table.branchId),
    uniqueIndex("staff_branch_blacklists_one_active_per_user_branch_unique")
      .on(table.userId, table.branchId)
      .where(sql`${table.active} = true`),
  ],
);

export const staffDisciplinaryActions = pgTable(
  "staff_disciplinary_actions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id").notNull(),
    branchId: uuid("branch_id").references(() => staffBranches.id, {
      onDelete: "cascade",
    }),
    type: staffDisciplineType("type").notNull(),
    points: integer("points").default(1).notNull(),
    reason: text("reason").notNull(),
    issuedByUserId: varchar("issued_by_user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("staff_disciplinary_actions_user_id_idx").on(table.userId),
    index("staff_disciplinary_actions_branch_id_idx").on(table.branchId),
    index("staff_disciplinary_actions_type_idx").on(table.type),
  ],
);
