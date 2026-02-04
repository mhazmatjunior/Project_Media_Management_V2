import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../src/db/schema.js';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sql = neon(connectionString);
const db = drizzle(sql, { schema });

async function seedDatabase() {
    try {
        console.log('🌱 Seeding database...\n');

        // Insert sample users
        console.log('👤 Creating sample users...');
        const [user1] = await db.insert(schema.users).values([
            {
                email: 'admin@example.com',
                name: 'Admin User',
                password: 'hashed_password_here', // In production, hash this!
            },
        ]).returning();

        console.log('✅ Created user:', user1.email);

        // Insert sample videos with app-compatible statuses
        console.log('\n🎥 Creating sample videos...');
        const sampleVideos = await db.insert(schema.videos).values([
            // Ended videos (completed in DB)
            {
                title: 'Q3 Marketing Video',
                description: 'Marketing campaign for Q3',
                status: 'completed',
                category: 'marketing',
                views: 1250,
                likes: 89,
                duration: 360,
                userId: user1.id,
                isPublished: true,
            },
            {
                title: 'Product Launch Teaser',
                description: 'Teaser for new product launch',
                status: 'completed',
                category: 'promo',
                views: 2100,
                likes: 156,
                duration: 180,
                userId: user1.id,
                isPublished: true,
            },
            {
                title: 'Tutorial Series Ep.1',
                description: 'First episode of tutorial series',
                status: 'completed',
                category: 'tutorial',
                views: 3400,
                likes: 234,
                duration: 540,
                userId: user1.id,
                isPublished: true,
            },

            // Running videos (in_progress in DB)
            {
                title: 'Holiday Promo 2024',
                description: 'Holiday promotional video',
                status: 'in_progress',
                category: 'promo',
                views: 450,
                likes: 32,
                duration: 300,
                userId: user1.id,
                isPublished: false,
            },
            {
                title: 'CEO Interview Edit',
                description: 'CEO interview editing in progress',
                status: 'in_progress',
                category: 'interview',
                views: 120,
                likes: 15,
                duration: 720,
                userId: user1.id,
                isPublished: false,
            },
            {
                title: 'Website Background Loop',
                description: 'Background video for website',
                status: 'in_progress',
                category: 'general',
                views: 80,
                likes: 8,
                duration: 60,
                userId: user1.id,
                isPublished: false,
            },
            {
                title: 'Social Media Shorts',
                description: 'Short videos for social media',
                status: 'in_progress',
                category: 'social',
                views: 650,
                likes: 45,
                duration: 30,
                userId: user1.id,
                isPublished: false,
            },

            // Pending videos
            {
                title: 'Concept Art Review',
                description: 'Waiting for feedback on concept art',
                status: 'pending',
                category: 'review',
                views: 0,
                likes: 0,
                userId: user1.id,
                isPublished: false,
            },
            {
                title: 'Script Approval',
                description: 'Pending CEO review',
                status: 'pending',
                category: 'general',
                views: 0,
                likes: 0,
                userId: user1.id,
                isPublished: false,
            },
        ]).returning();

        console.log(`✅ Created ${sampleVideos.length} videos`);

        // Insert sample projects
        console.log('\n📁 Creating sample projects...');
        const sampleProjects = await db.insert(schema.projects).values([
            {
                name: 'Q1 Content Campaign',
                description: 'First quarter video content',
                status: 'active',
                userId: user1.id,
            },
            {
                name: 'Tutorial Series',
                description: 'Educational video series',
                status: 'active',
                userId: user1.id,
            },
        ]).returning();

        console.log(`✅ Created ${sampleProjects.length} projects`);

        console.log('\n🎉 Database seeded successfully!\n');
        console.log('Summary:');
        console.log(`- ${1} user created`);
        console.log(`- ${sampleVideos.length} videos created`);
        console.log(`- ${sampleProjects.length} projects created\n`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedDatabase();
