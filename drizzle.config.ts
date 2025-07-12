import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({
  path: ".env.local",
});

const sqliteDb = process.env.DB_FILE_NAME;
const tursoDb = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_CLOUDNOTES_TOKEN;
// if (!sqliteDb) throw new Error("env var not found DB_FILE_NAME");

const getLocalSchema = (fileUrl: string): Config => {
  return {
    schema: "./drizzle/schemas.ts",
    out: "./drizzle/migrations",
    dbCredentials: {
      url: fileUrl,
    },
    dialect: "sqlite",
    verbose: true,
    strict: true,
  };
};

const getTursoSchema = (dbUrl: string, authToken: string): Config => {
  return {
    schema: "./drizzle/schemas.ts",
    out: "./drizzle/migrations",
    dbCredentials: {
      url: dbUrl,
      authToken,
    },
    dialect: "turso",
    verbose: true,
    strict: true,
  };
};

let config: Config;

if (tursoDb && tursoAuthToken) {
  config = getTursoSchema(tursoDb, tursoAuthToken);
} else if (sqliteDb) {
  config = getLocalSchema(sqliteDb);
} else {
  throw new Error("env var not found DB_FILE_NAME or TURSO_DATABASE_URL");
}

export default config;
