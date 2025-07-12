import { drizzle } from "drizzle-orm/libsql";
import { Intellisense } from "@/utils/Intellisense";
import { notesTable, usersTable } from "./schemas";

const tursoDb = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_CLOUDNOTES_TOKEN;

// if (!dbPath) {
//   throw new Error("DB_FILE_NAME is not set");
// }

function getDB() {
  if (tursoDb && tursoAuthToken) {
    const db = drizzle({
      connection: {
        url: tursoDb,
        authToken: tursoAuthToken,
      },
      logger: true,
      schema: { notes: notesTable, users: usersTable },
    });
    return db;
  }
  const dbPath = process.env.DB_FILE_NAME;

  if (dbPath) {
    return drizzle({
      connection: {
        url: dbPath,
      },
      logger: true,
      schema: { notes: notesTable, users: usersTable },
    });
  } else {
    throw new Error("DB_FILE_NAME is not set");
  }
}

const db = getDB();
export default db;
