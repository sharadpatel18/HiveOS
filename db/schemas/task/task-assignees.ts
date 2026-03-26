import {
  pgTable,
  uuid,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { tasks } from "./tasks";
import { users } from "../user/user";

export const taskAssignees = pgTable(
  "task_assignees",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    assignedBy: uuid("assigned_by")
      .notNull()
      .references(() => users.id),

    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    // Prevent duplicate assignee rows for the same task
    uniqueTaskUser: uniqueIndex("uniq_task_assignee").on(
      table.taskId,
      table.userId,
    ),

    // Fast "My Tasks" query — find all tasks assigned to a user
    userIdx: index("task_assignees_user_idx").on(table.userId),

    // Fast lookup of all assignees for a task
    taskIdx: index("task_assignees_task_idx").on(table.taskId),
  }),
);
