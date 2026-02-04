import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema.js';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sql = neon(connectionString);
const db = drizzle(sql, { schema });

async function testDatabase() {
    console.log('🧪 Testing Database Operations\n');
    console.log('='.repeat(50));

    try {
        // ==========================================
        // TEST 1: Push Data (INSERT)
        // ==========================================
        console.log('\n📝 TEST 1: Inserting test data...');

        const testUser = {
            email: `test-${Date.now()}@example.com`,
            name: 'Test User',
            password: 'hashed_password_123',
        };

        const [newUser] = await db.insert(schema.users)
            .values(testUser)
            .returning();

        console.log('✅ User created:');
        console.log(`   ID: ${newUser.id}`);
        console.log(`   Email: ${newUser.email}`);
        console.log(`   Name: ${newUser.name}`);

        const testVideo = {
            title: `Test Video - ${new Date().toLocaleString()}`,
            description: 'This is a test video to verify database operations',
            status: 'pending',
            category: 'test',
            views: 0,
            likes: 0,
            duration: 120,
            userId: newUser.id,
            isPublished: false,
        };

        const [newVideo] = await db.insert(schema.videos)
            .values(testVideo)
            .returning();

        console.log('\n✅ Video created:');
        console.log(`   ID: ${newVideo.id}`);
        console.log(`   Title: ${newVideo.title}`);
        console.log(`   Status: ${newVideo.status}`);
        console.log(`   User ID: ${newVideo.userId}`);

        // ==========================================
        // TEST 2: Fetch Data (SELECT)
        // ==========================================
        console.log('\n📖 TEST 2: Fetching data...');

        // Fetch the user we just created
        const fetchedUser = await db.select()
            .from(schema.users)
            .where(eq(schema.users.id, newUser.id));

        console.log('\n✅ User fetched from database:');
        console.log(`   ID: ${fetchedUser[0].id}`);
        console.log(`   Email: ${fetchedUser[0].email}`);
        console.log(`   Name: ${fetchedUser[0].name}`);
        console.log(`   Created: ${fetchedUser[0].createdAt}`);

        // Fetch the video we just created
        const fetchedVideo = await db.select()
            .from(schema.videos)
            .where(eq(schema.videos.id, newVideo.id));

        console.log('\n✅ Video fetched from database:');
        console.log(`   ID: ${fetchedVideo[0].id}`);
        console.log(`   Title: ${fetchedVideo[0].title}`);
        console.log(`   Description: ${fetchedVideo[0].description}`);
        console.log(`   Status: ${fetchedVideo[0].status}`);
        console.log(`   Created: ${fetchedVideo[0].createdAt}`);

        // ==========================================
        // TEST 3: Update Data
        // ==========================================
        console.log('\n🔄 TEST 3: Updating data...');

        const [updatedVideo] = await db.update(schema.videos)
            .set({
                status: 'completed',
                views: 100,
                likes: 15,
                updatedAt: new Date(),
            })
            .where(eq(schema.videos.id, newVideo.id))
            .returning();

        console.log('✅ Video updated:');
        console.log(`   ID: ${updatedVideo.id}`);
        console.log(`   Status: ${updatedVideo.status} (was: ${newVideo.status})`);
        console.log(`   Views: ${updatedVideo.views} (was: ${newVideo.views})`);
        console.log(`   Likes: ${updatedVideo.likes} (was: ${newVideo.likes})`);

        // ==========================================
        // TEST 4: Fetch All Videos
        // ==========================================
        console.log('\n📚 TEST 4: Fetching all videos...');

        const allVideos = await db.select().from(schema.videos);
        console.log(`✅ Total videos in database: ${allVideos.length}`);
        console.log('\nVideo list:');
        allVideos.forEach((video, index) => {
            console.log(`   ${index + 1}. ${video.title} (${video.status})`);
        });

        // ==========================================
        // TEST 5: Fetch Videos by Status
        // ==========================================
        console.log('\n🔍 TEST 5: Filtering videos by status...');

        const pendingVideos = await db.select()
            .from(schema.videos)
            .where(eq(schema.videos.status, 'pending'));

        const completedVideos = await db.select()
            .from(schema.videos)
            .where(eq(schema.videos.status, 'completed'));

        console.log(`✅ Pending videos: ${pendingVideos.length}`);
        console.log(`✅ Completed videos: ${completedVideos.length}`);

        // ==========================================
        // TEST 6: Clean Up (Delete test data)
        // ==========================================
        console.log('\n🧹 TEST 6: Cleaning up test data...');

        await db.delete(schema.videos)
            .where(eq(schema.videos.id, newVideo.id));
        console.log(`✅ Deleted test video (ID: ${newVideo.id})`);

        await db.delete(schema.users)
            .where(eq(schema.users.id, newUser.id));
        console.log(`✅ Deleted test user (ID: ${newUser.id})`);

        // ==========================================
        // Summary
        // ==========================================
        console.log('\n' + '='.repeat(50));
        console.log('✅ ALL TESTS PASSED!');
        console.log('\nDatabase Operations Verified:');
        console.log('  ✅ INSERT - Data can be pushed to database');
        console.log('  ✅ SELECT - Data can be fetched from database');
        console.log('  ✅ UPDATE - Data can be modified');
        console.log('  ✅ DELETE - Data can be removed');
        console.log('  ✅ FILTER - Data can be queried with conditions');
        console.log('\n🎉 Your database is working perfectly!\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        process.exit(1);
    }
}

testDatabase();
