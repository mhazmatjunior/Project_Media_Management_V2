import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

/** @type { import("drizzle-kit").Config } */
export default {
    schema: './src/db/schema.js',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    },
};
