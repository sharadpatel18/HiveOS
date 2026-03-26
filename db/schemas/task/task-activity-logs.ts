import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { tasks } from "./tasks";
import { users } from "../user/user";

export const taskActivityLogs = pgTable(
  "task_activity_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),

    // The user who performed the action
    actorId: uuid("actor_id")
      .notNull()
      .references(() => users.id),

    /*
     * Controlled action values:
     * TASK_CREATED | TASK_UPDATED | TASK_ASSIGNED | TASK_UNASSIGNED
     * STATUS_CHANGED | COMMENT_ADDED | COMMENT_EDITED
     * DUE_DATE_CHANGED | TASK_COMPLETED | TASK_ARCHIVED | TASK_REOPENED
     */
    action: text("action").notNull(),

    // Which field changed, e.g. "status", "priority", "dueDate"
    fieldName: text("field_name"),

    // Serialized previous value (store as string for simplicity)
    oldValue: text("old_value"),

    // Serialized next value
    newValue: text("new_value"),

    // Any extra context — JSON string, e.g. assignee name, reopen reason
    metadata: text("metadata"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    // Primary use — load activity timeline for a task
    taskCreatedAtIdx: index("task_activity_logs_task_created_at_idx").on(
      table.taskId,
      table.createdAt,
    ),

    // Useful for audit queries — "all actions by this user"
    actorIdx: index("task_activity_logs_actor_idx").on(table.actorId),

    // Filter activity by action type across a task
    actionIdx: index("task_activity_logs_action_idx").on(table.action),
  }),
);
