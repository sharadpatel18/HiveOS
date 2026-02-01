import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  index,
  text,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("full_name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    role: text("role").notNull().default("user"),
    isActive: boolean("is_active").default(true),
    isEmailVarified: boolean("email_verified_at").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
  }),
);
