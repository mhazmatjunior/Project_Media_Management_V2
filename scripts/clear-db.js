import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import * as schema from '../src/db/schema.js';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sqlClient = neon(connectionString);
const db = drizzle(sqlClient, { schema });

async function clearDatabase() {
    console.log('🧹 Clearing all data from database...\n');

    try {
        // Count records before deletion
        const usersBefore = await db.select().from(schema.users);
        const videosBefore = await db.select().from(schema.videos);
        const projectsBefore = await db.select().from(schema.projects);

        console.log('Current data:');
        console.log(`  Users: ${usersBefore.length}`);
        console.log(`  Videos: ${videosBefore.length}`);
        console.log(`  Projects: ${projectsBefore.length}\n`);

        // Delete all data (order matters due to foreign keys)
        console.log('Deleting data...');

        await db.delete(schema.videos);
        console.log('✅ Deleted all videos');

        await db.delete(schema.projects);
        console.log('✅ Deleted all projects');

        await db.delete(schema.users);
        console.log('✅ Deleted all users');

        // Verify deletion
        const usersAfter = await db.select().from(schema.users);
        const videosAfter = await db.select().from(schema.videos);
        const projectsAfter = await db.select().from(schema.projects);

        console.log('\n✅ Database cleared successfully!');
        console.log('\nCurrent data:');
        console.log(`  Users: ${usersAfter.length}`);
        console.log(`  Videos: ${videosAfter.length}`);
        console.log(`  Projects: ${projectsAfter.length}\n`);

        console.log('💡 To add sample data again, run: npm run db:seed\n');

    } catch (error) {
        console.error('❌ Failed to clear database:', error);
        process.exit(1);
    }
}

clearDatabase();
