import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { company } from "../company/company";

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // URL-safe identifier  e.g. "acme-corp"
  description: text("description"),
  teamleadId: uuid("team_lead_id").notNull(), // FK → users.id (add after users table)
  companyId: uuid("company_id")
    .references(() => company.id)
    .notNull(),
  personalTeam: boolean("personal_team").notNull().default(false), // 1-person workspace
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
