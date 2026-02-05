import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../src/db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sql = neon(connectionString);
const db = drizzle(sql, { schema });

async function seedUsers() {
    try {
        console.log('🌱 Seeding users...\n');

        const hashedPassword = await bcrypt.hash('password123', 10);

        const usersToCreate = [
            // Main Team
            { email: 'main1@media.com', name: 'Main Team User 1', role: 'main_team', departments: '[]' },
            { email: 'main2@media.com', name: 'Main Team User 2', role: 'main_team', departments: '[]' },
            { email: 'main3@media.com', name: 'Main Team User 3', role: 'main_team', departments: '[]' },

            // Team Leads
            { email: 'lead.research@media.com', name: 'Research Lead', role: 'team_lead', departments: '["Research"]' },
            { email: 'lead.writer@media.com', name: 'Writer Lead', role: 'team_lead', departments: '["Writer"]' },
            { email: 'lead.speaker@media.com', name: 'Speaker Lead', role: 'team_lead', departments: '["Speaker"]' },
            { email: 'lead.graphics@media.com', name: 'Graphics Lead', role: 'team_lead', departments: '["Graphics"]' },

            // Members
            { email: 'member.research@media.com', name: 'Research Member', role: 'member', departments: '["Research"]' },
            { email: 'member.writer@media.com', name: 'Writer Member', role: 'member', departments: '["Writer"]' },
            { email: 'member.multi@media.com', name: 'Multi Dept Member', role: 'member', departments: '["Research", "Writer"]' },

            // New Members (Batch 2)
            { email: 'member.speaker@media.com', name: 'Speaker Member', role: 'member', departments: '["Speaker"]' },
            { email: 'member.graphics@media.com', name: 'Graphics Member', role: 'member', departments: '["Graphics"]' },
            { email: 'member.research2@media.com', name: 'Research Member 2', role: 'member', departments: '["Research"]' },
            { email: 'member.writer2@media.com', name: 'Writer Member 2', role: 'member', departments: '["Writer"]' },
        ];

        console.log(`👤 Creating ${usersToCreate.length} users...`);

        for (const user of usersToCreate) {
            // Check if user exists
            const existingUser = await db.query.users.findFirst({
                where: (users, { eq }) => eq(users.email, user.email),
            });

            if (!existingUser) {
                await db.insert(schema.users).values({
                    ...user,
                    password: hashedPassword,
                });
                console.log(`✅ Created: ${user.email} (${user.role})`);
            } else {
                console.log(`⚠️ Skipped (exists): ${user.email}`);
            }
        }

        // Update existing admin if needed
        const adminEmail = 'admin@example.com'; // Assuming this is the existing admin
        const admin = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, adminEmail),
        });

        if (admin) {
            await db.update(schema.users)
                .set({ role: 'main_team' })
                .where(eq(schema.users.email, adminEmail)); // Error prone if not imported eq properly, using db.update pattern standard
            console.log(`🔄 Updated Admin role to main_team`);
        }


        console.log('\n🎉 Users seeded successfully!\n');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedUsers();
