
const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);

async function checkUsers() {
    try {
        const users = await sql`SELECT id, name, email, role FROM users`;
        console.log('Users in database:');
        console.log(JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error checking users:', error);
    }
}

checkUsers();
