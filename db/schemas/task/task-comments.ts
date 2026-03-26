import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { tasks } from "./tasks";
import { users } from "../user/user";

export const taskComments = pgTable(
  "task_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    body: text("body").notNull(),

    // Set when the comment body is edited after initial post
    editedAt: timestamp("edited_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    // Fetch all comments for a task ordered by time
    taskCreatedAtIdx: index("task_comments_task_created_at_idx").on(
      table.taskId,
      table.createdAt,
    ),

    // Useful when loading comments by a specific user or moderating
    userIdx: index("task_comments_user_idx").on(table.userId),
  }),
);
