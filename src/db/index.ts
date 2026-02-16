import { mkdirSync } from "fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/db/schema";

mkdirSync("./data", { recursive: true });

const sqlite = new Database("./data/habits.db");
export const db = drizzle(sqlite, { schema });
