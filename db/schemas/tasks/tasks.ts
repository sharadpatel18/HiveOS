import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { teams } from "../team/team";
import { company } from "../company/company";

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("MEDIUM"),
  dueDate: timestamp("due_date").notNull(),
  status: text("done").notNull().default("NOT_STARTED"),
  companyId: uuid("company_id")
    .notNull()
    .references(() => company.id, { onDelete: "cascade" }),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
