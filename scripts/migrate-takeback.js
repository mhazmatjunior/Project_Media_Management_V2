import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sql = neon(connectionString);

async function migrate() {
    console.log('🚀 Running manual migration...');
    try {
        // Add columns if they don't exist
        await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS forwarded_at timestamp;`;
        await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS previous_department text;`;
        await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS takeback_requested boolean DEFAULT false;`;

        console.log('✅ Columns added successfully.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
