import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./user";
import { company } from "./company";

export const companyMembers = pgTable(
  "company_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserCompany: uniqueIndex("uniq_user_company").on(
      table.userId,
      table.companyId,
    ),

    companyIdx: index("company_members_company_idx").on(table.companyId),
    userIdx: index("company_members_user_idx").on(table.userId),
  }),
);
