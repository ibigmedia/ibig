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

// Configure connection with enhanced resilience and pooling
const sql = neon(process.env.DATABASE_URL);

// Create db instance with better error handling and logging
export const db = drizzle(sql, {
  schema,
  logger: true,
});

// Enhanced connection health check with retries
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
        console.log(`Retrying in ${2 ** i} seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000));
      }
    }
  }

  console.error('All database connection attempts failed');
  return false;
}

export { sql };