import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure with pooling for better performance
const sql = neon(process.env.DATABASE_URL, { 
  poolSize: 10,
  idleTimeout: 30000,
  maxRetries: 5
});

export const db = drizzle(sql, { 
  schema,
  // Add logger for debugging database queries
  logger: true
});