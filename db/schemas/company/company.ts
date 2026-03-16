import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { users } from "../user/user";

export const company = pgTable(
  "company",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description").notNull(),
    size: text("size").notNull(),
    founder: text("founder").notNull(),
    website: text("website"),
    industry: text("industry"),
    isActive: boolean("is_active").default(true),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("company_slug_idx").on(table.slug),
  }),
);
