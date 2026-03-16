import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { teams } from "./team";
import { users } from "../user/user";

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  role: text("role").notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
