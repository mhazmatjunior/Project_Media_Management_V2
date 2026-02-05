
import { config } from 'dotenv';
config({ path: '.env.local' });
config();

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './src/db/schema.js';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    console.error('No connection string found');
    process.exit(1);
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

async function listUsers() {
    try {
        const allUsers = await db.select().from(schema.users);
        console.log('--- Users List ---');
        console.log(JSON.stringify(allUsers.map(u => ({
            id: u.id,
            email: u.email,
            role: u.role,
            departments: u.departments
        })), null, 2));
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        process.exit();
    }
}

listUsers();
