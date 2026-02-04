import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Get database URL from environment variables
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL or POSTGRES_URL must be set in .env.local');
}

// Create the Neon HTTP client
const sql = neon(connectionString);

// Create Drizzle instance with schema
export const db = drizzle(sql, { schema });

// Export schema for easy access
export { schema };
