const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);

async function seed() {
    console.log('🚀 Seeding urgent deadline...');

    // Create a deadline 4 hours from now
    const now = new Date();
    const urgentTime = new Date(now.getTime() + 4 * 60 * 60 * 1000);

    try {
        const result = await sql`
            INSERT INTO deadlines (title, datetime, audience_type, description, created_by)
            VALUES (
                'URGENT: Video Review Deadline', 
                ${urgentTime.toISOString()}, 
                'all', 
                'This is a test deadline that should trigger the blinking icon in the header.', 
                1
            )
            RETURNING *;
        `;
        console.log('✅ Urgent deadline created:', result[0]);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
