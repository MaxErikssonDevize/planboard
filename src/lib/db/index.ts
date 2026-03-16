import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgres://planboard:planboard@localhost:5432/planboard";

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
