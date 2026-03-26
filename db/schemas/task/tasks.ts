import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { company } from "../company/company";
import { teams } from "../team/team";
import { users } from "../user/user";

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Human-readable identifier, company-scoped e.g. "HIVE-104"
    taskNumber: text("task_number").notNull(),

    title: text("title").notNull(),
    description: text("description"),

    companyId: uuid("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),

    // Nullable — company-wide tasks have no team
    teamId: uuid("team_id").references(() => teams.id, {
      onDelete: "set null",
    }),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),

    // Primary accountable person (single owner)
    ownerId: uuid("owner_id").references(() => users.id, {
      onDelete: "set null",
    }),

    // Controlled values: LOW | MEDIUM | HIGH | URGENT
    priority: text("priority").notNull().default("MEDIUM"),

    // Controlled values: BACKLOG | TODO | IN_PROGRESS | IN_REVIEW | BLOCKED | DONE | CANCELLED
    status: text("status").notNull().default("TODO"),

    // Controlled values: TASK | BUG | FEATURE | IMPROVEMENT
    type: text("type").notNull().default("TASK"),

    startDate: timestamp("start_date"),
    dueDate: timestamp("due_date"),

    completedAt: timestamp("completed_at"),
    completedBy: uuid("completed_by").references(() => users.id, {
      onDelete: "set null",
    }),

    archivedAt: timestamp("archived_at"),
    archivedBy: uuid("archived_by").references(() => users.id, {
      onDelete: "set null",
    }),

    // Only founders/managers/team leads should set this
    isPrivate: boolean("is_private").notNull().default(false),

    estimatedHours: integer("estimated_hours"),
    actualHours: integer("actual_hours"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    // Core list queries
    companyStatusIdx: index("tasks_company_status_idx").on(
      table.companyId,
      table.status,
    ),
    companyTeamIdx: index("tasks_company_team_idx").on(
      table.companyId,
      table.teamId,
    ),
    companyDueDateIdx: index("tasks_company_due_date_idx").on(
      table.companyId,
      table.dueDate,
    ),
    companyUpdatedAtIdx: index("tasks_company_updated_at_idx").on(
      table.companyId,
      table.updatedAt,
    ),

    // Fast lookup for "My Tasks" via ownerId
    ownerIdx: index("tasks_owner_idx").on(table.ownerId),

    // Used when filtering by creator
    createdByIdx: index("tasks_created_by_idx").on(table.createdBy),
  }),
);
