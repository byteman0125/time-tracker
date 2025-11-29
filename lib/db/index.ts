import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

function getDatabase() {
  if (_db) {
    return _db;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is required. Please set it in your environment variables."
    );
  }

  // Disable prefetch as it is not supported for "Transaction" pool mode
  _client = postgres(connectionString, { prepare: false });
  _db = drizzle(_client, { schema });
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return getDatabase()[prop as keyof ReturnType<typeof drizzle>];
  },
});

