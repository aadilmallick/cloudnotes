import Database from "better-sqlite3";
import { Intellisense } from "./Intellisense";

/**
 * Example usage:
 *
 *     const stmt = this.db.prepare("SELECT age FROM cats WHERE name = ?");
 *     const cat = stmt.get("Joey");
 *
 *
 *
 *
 *
 *
 */

export class BetterSQLite {
  private db!: Database.Database;
  private static instance: BetterSQLite | null = null;

  constructor(
    dbPath: string,
    options: {
      enableLogging?: boolean;
      enableSingleton?: boolean;
    } = {}
  ) {
    if (options.enableSingleton) {
      if (BetterSQLite.instance) {
        return BetterSQLite.instance;
      }
      BetterSQLite.instance = this;
    }

    this.db = new Database(dbPath, {
      verbose: (...args: any[]) => {
        if (!options.enableLogging) {
          return;
        }
        console.log("[Database log]", ...args);
      },
    });
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
  }

  close() {
    this.db.close();
  }

  runQuery(query: string, params: any[] | Record<string, any>) {
    return this.db.prepare(query).run(params);
  }

  exec(query: string) {
    return this.db.exec(query);
  }

  prepare<T extends any[] | Record<string, any>>(query: string) {
    return new SQLiteStatement<T>(query, this.db);
  }
}

class SQLiteStatement<T extends any[] | Record<string, any>> {
  private stmt: Database.Statement;

  constructor(private query: string, db: Database.Database) {
    this.stmt = db.prepare(query);
  }

  get(params?: T): T {
    if (!params) {
      return this.stmt.get() as T;
    }
    this.validateParams(params);
    return this.stmt.get(params) as T;
  }

  run(params?: T) {
    if (!params) {
      return this.stmt.run();
    }
    this.validateParams(params);
    return this.stmt.run(params);
  }

  all(params?: T): T[] {
    if (!params) {
      return this.stmt.all() as T[];
    }
    this.validateParams(params);
    return this.stmt.all(params) as T[];
  }

  private validateParams(params: any[] | Record<string, any>): void {
    if (Array.isArray(params)) {
      if (!this.query.includes("?")) {
        throw new Error("You must use ? to bind parameters in array");
      }
      const questionCount = (this.query.match(/\?/g) || []).length;
      if (questionCount !== params.length) {
        throw new Error(
          "You must provide the same number of parameters as ? in the query"
        );
      }
    }
    if (typeof params === "object") {
      if (
        !this.query.includes("@") &&
        !this.query.includes("$") &&
        !this.query.includes(":")
      ) {
        throw new Error(
          "You must use @ or $ or : to bind parameters in object"
        );
      }
    }
  }
}

export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  priority: "low" | "medium" | "high";
}

export interface NoteSQLRow {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  priority: "low" | "medium" | "high";
}

export class NotesModel {
  private db: BetterSQLite;
  private statements: ReturnType<typeof this.getStatements>;

  private getStatements = () => {
    const statements = {
      addNote: this.db.prepare<Omit<NoteSQLRow, "id">>(
        Intellisense.sql`INSERT INTO notes 
        (title, content, createdAt, priority) VALUES 
        ($title, $content, $createdAt, $priority)`
      ),
      getNotes: this.db.prepare(Intellisense.sql`SELECT * FROM notes`),
      deleteNote: this.db.prepare<{ id: number }>(
        Intellisense.sql`DELETE FROM notes WHERE id = $id`
      ),
    } as const;
    return statements;
  };

  constructor() {
    this.db = new BetterSQLite("notes.db", {
      enableLogging: true,
      enableSingleton: true,
    });
    this.createNotesTable();
    this.statements = this.getStatements();
  }

  createNotesTable() {
    this.db.exec(
      Intellisense.sql`CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        priority TEXT DEFAULT "low"
      )`
    );
  }

  createNote(note: Pick<Note, "title" | "content" | "priority">) {
    this.statements.addNote.run({
      ...note,
      createdAt: new Date().toISOString(),
    });
  }

  getNotes() {
    const notes = this.statements.getNotes.all() as NoteSQLRow[];
    return notes.map((note) => ({
      ...note,
      createdAt: new Date(note.createdAt),
    })) satisfies Note[];
  }

  deleteNote(id: number) {
    this.statements.deleteNote.run({ id: Number(id.toFixed(0)) });
  }
}

export const notesModel = new NotesModel();
