import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure connection with enhanced resilience
const sql = neon(process.env.DATABASE_URL, {
  connectionTimeout: 10000, // 10 seconds
  maxRetries: 5,
  retryInterval: 1000, // 1 second between retries
  fetchConnectionTimeout: 10000
});

// Create db instance with better error handling
export const db = drizzle(sql, {
  schema,
  logger: true,
});

// Add connection health check
export async function checkDatabaseConnection() {
  try {
    const result = await sql`SELECT 1`;
    return result != null;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}