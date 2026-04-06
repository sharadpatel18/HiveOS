import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { tasks } from "./tasks";
import { users } from "../user/user";

export const taskAssignments = pgTable(
  "task_assignments",
  {
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    assignedById: uuid("assigned_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.taskId, t.userId] })],
);
