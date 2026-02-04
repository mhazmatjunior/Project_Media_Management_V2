import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { sql as sqlOperator } from 'drizzle-orm';
import * as schema from '../src/db/schema.js';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    console.error('❌ DATABASE_URL or POSTGRES_URL not found in .env.local');
    process.exit(1);
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

async function initDatabase() {
    try {
        console.log('🚀 Starting database initialization...\n');

        // Test connection
        console.log('📡 Testing database connection...');
        const result = await db.execute(sqlOperator`SELECT NOW()`);
        console.log('✅ Database connected successfully!\n');

        // Create tables using Drizzle Kit (you'll run: npm run db:push)
        console.log('📋 To create tables, run: npm run db:push');
        console.log('   This will sync your schema with the database.\n');

        console.log('✅ Database setup complete!');
        console.log('\nNext steps:');
        console.log('1. Run: npm run db:push (to create tables)');
        console.log('2. Run: node scripts/seed-db.js (to add sample data)');
        console.log('3. Start using the database in your app!\n');

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

initDatabase();
