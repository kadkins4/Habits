import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const habits = sqliteTable("habits", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  xp: integer("xp").notNull().default(10),
  active: integer("active").notNull().default(1),
  sort_order: integer("sort_order").notNull(),
  created_at: text("created_at").notNull(),
});

export const completions = sqliteTable(
  "completions",
  {
    id: text("id").primaryKey(),
    habit_id: text("habit_id").notNull(),
    date: text("date").notNull(),
  },
  (table) => [
    uniqueIndex("completions_habit_date_idx").on(table.habit_id, table.date),
  ]
);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
