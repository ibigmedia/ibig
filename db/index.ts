import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Validate database URL format
const dbUrl = new URL(process.env.DATABASE_URL);
if (!dbUrl.host || !dbUrl.pathname.slice(1)) {
  throw new Error("Invalid DATABASE_URL format");
}

// Configure connection with enhanced resilience
const sql = neon(process.env.DATABASE_URL, {
  // Increase default timeout for slower connections
  fetchConnectionTimeout: 10000,
  // Maximum number of consecutive failed queries before giving up
  maxRetries: 5,
});

// Create db instance with better error handling and logging
export const db = drizzle(sql, {
  schema,
  logger: true,
});

// Enhanced connection health check with exponential backoff
export async function checkDatabaseConnection(retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await sql`SELECT 1`;
      if (result) {
        console.log('Database connection successful');
        return true;
      }
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        // Exponential backoff: 1s, 2s, 4s, etc.
        const backoffTime = Math.min(1000 * Math.pow(2, i), 10000);
        console.log(`Retrying in ${backoffTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }

  console.error('All database connection attempts failed');
  return false;
}

export { sql };