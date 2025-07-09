import { relations } from "drizzle-orm";
import {
  foreignKey,
  int,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import crypto from "node:crypto";

export const notesTable = sqliteTable("notes", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  content: text()
    .notNull()
    .$default(() => ""),
  createdAt: text().$default(() => new Date().toISOString()),
  priority: text().notNull().default("low").$type<"low" | "medium" | "high">(),
  userId: text()
    .references(() => usersTable.id)
    .notNull(),
});

export const usersTable = sqliteTable("users", {
  id: text()
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  email: text().notNull().unique(),
  createdAt: text().$default(() => new Date().toISOString()),
  password: text().notNull(),
});

export const UserTableRelations = relations(usersTable, ({ many, one }) => {
  return {
    notes: many(notesTable),
  };
});

export const NotesTableRelations = relations(notesTable, ({ one }) => {
  return {
    user: one(usersTable, {
      fields: [notesTable.userId],
      references: [usersTable.id],
    }),
  };
});
