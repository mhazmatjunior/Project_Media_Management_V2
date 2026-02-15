import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sql = neon(connectionString);

async function migrate() {
    console.log('🚀 Running deadline migration...');
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS deadlines (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                datetime TIMESTAMP NOT NULL,
                audience_type TEXT NOT NULL,
                target_users TEXT,
                description TEXT,
                status TEXT DEFAULT 'active',
                created_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT NOW() NOT NULL
            );
        `;

        console.log('✅ Deadlines table created successfully.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
