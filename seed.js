const { db, schema } = require('./src/db/index.js');
const bcrypt = require('bcryptjs');
const { eq } = require('drizzle-orm');

async function seedAdmin() {
    try {
        console.log('🌱 Seeding admin user...');

        // Check if admin already exists
        const existingAdmin = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, 'admin@example.com'))
            .limit(1);

        if (existingAdmin.length > 0) {
            console.log('✅ Admin user already exists');
            process.exit(0);
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Insert admin user
        await db.insert(schema.users).values({
            email: 'admin@example.com',
            password: hashedPassword,
            name: 'Admin',
        });

        console.log('✅ Admin user created successfully');
        console.log('   Email: admin@example.com');
        console.log('   Password: password123');

    } catch (error) {
        console.error('❌ Error seeding admin user:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

seedAdmin();
