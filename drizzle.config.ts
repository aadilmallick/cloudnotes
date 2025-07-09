import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({
  path: ".env.local",
});

const sqliteDb = process.env.DB_FILE_NAME;
if (!sqliteDb) throw new Error("env var not found DB_FILE_NAME");

export default {
  schema: "./drizzle/schemas.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: sqliteDb,
  },
  //   dialect: 'turso',
  //   dbCredentials: {
  //     url: process.env.TURSO_CONNECTION_URL!,
  //     authToken: process.env.TURSO_AUTH_TOKEN!,
  //   },
  dialect: "sqlite",
  //   dbCredentials: {
  //     url: process.env.DB_FILE_NAME,
  //      token: "",
  //      accountId: "none",

  //   },
  verbose: true,
  strict: true,
} satisfies Config;
