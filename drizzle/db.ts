import { drizzle } from "drizzle-orm/libsql";
import { Intellisense } from "@/utils/Intellisense";
import { notesTable, usersTable } from "./schemas";

const dbPath = process.env.DB_FILE_NAME;
if (!dbPath) {
  throw new Error("DB_FILE_NAME is not set");
}

const db = drizzle({
  connection: {
    url: dbPath,
  },
  logger: true,
  schema: { notes: notesTable, users: usersTable },
});

export default db;
