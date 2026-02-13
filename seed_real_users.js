require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Helper to generate strong passwords
function generateStrongPassword() {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    const all = lower + upper + numbers + symbols;

    let password = "";
    // Ensure at least one of each type
    password += lower.charAt(Math.floor(Math.random() * lower.length));
    password += upper.charAt(Math.floor(Math.random() * upper.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));

    // Fill the rest to 12 chars
    for (let i = 0; i < 8; i++) {
        password += all.charAt(Math.floor(Math.random() * all.length));
    }

    // Shuffle
    return password.split('').sort(() => 0.5 - Math.random()).join('');
}

const usersRaw = [
    // Writers
    { name: 'Ummekulsoom', email: 'ummekulsoom@media.com', role: 'member', department: 'writer' },
    { name: 'Makhdoom Dua Hashmi', email: 'makhdoomduahashmi@media.com', role: 'team_lead', department: 'writer' },
    { name: 'Hassan Talib', email: 'hassantalib@media.com', role: 'team_lead', department: 'writer' },
    { name: 'Abu Huraira', email: 'abuhuraira@media.com', role: 'member', department: 'writer' },
    { name: 'Syed Ahmad Bin Saifullah', email: 'syedahmadbinsaifullah@media.com', role: 'member', department: 'writer' },
    { name: 'Bisma Naeem', email: 'bismanaeem@media.com', role: 'member', department: 'writer' },
    { name: 'Um-e-Habiba', email: 'umehabiba@media.com', role: 'member', department: 'writer' },
    { name: 'Mehar-ul-Eman', email: 'meharuleman@media.com', role: 'member', department: 'writer' },
    { name: 'Abeeha', email: 'abeeha@media.com', role: 'member', department: 'writer' },
    { name: 'Nadia Jameel', email: 'nadiajameel@media.com', role: 'member', department: 'writer' },
    // Research
    { name: 'Waleeja Mubasher', email: 'waleejamubasher@media.com', role: 'team_lead', department: 'research' },
    { name: 'Hira Gillani', email: 'hiragillani@media.com', role: 'team_lead', department: 'research' },
    { name: 'Mudassara Hakim', email: 'mudassarahakim@media.com', role: 'member', department: 'research' },
    { name: 'Ayesha Zulfiqar', email: 'ayeshazulfiqar@media.com', role: 'member', department: 'research' },
    { name: 'Manahil Afzal', email: 'manahilafzal@media.com', role: 'member', department: 'research' },
    { name: 'Aqsa Tariq', email: 'aqsatariq@media.com', role: 'member', department: 'research' },
    { name: 'Sher Jan', email: 'sherjan@media.com', role: 'member', department: 'research' },
    // Graphics
    { name: 'Saira Shaheryar', email: 'sairashaheryar@media.com', role: 'member', department: 'graphics' },
    { name: 'Samiya Naz', email: 'samiyanaz@media.com', role: 'member', department: 'graphics' },
    { name: 'Memuna Haq Nawaz', email: 'memunahaqnawaz@media.com', role: 'member', department: 'graphics' },
    { name: 'Sunila Tahir', email: 'sunilatahir@media.com', role: 'member', department: 'graphics' },
    { name: 'Hajra Athar', email: 'hajraathar@media.com', role: 'member', department: 'graphics' },
    { name: 'Mahnoor Ahmed', email: 'mahnoorahmed@media.com', role: 'member', department: 'graphics' },
    { name: 'Seema Qaiser', email: 'seemaqaiser@media.com', role: 'member', department: 'graphics' },
    { name: 'Iqra Tahir', email: 'iqratahir@media.com', role: 'team_lead', department: 'graphics' },
    { name: 'Ahmad Tariq', email: 'ahmadtariq@media.com', role: 'member', department: 'graphics' },
    // Video
    { name: 'Hafsa Rashid', email: 'hafsarashid@media.com', role: 'team_lead', department: 'video' },
    { name: 'Hooria', email: 'hooria@media.com', role: 'team_lead', department: 'video' },
    { name: 'Muhammad Abdul Ahad', email: 'muhammadabdulahad@media.com', role: 'team_lead', department: 'video' },
    { name: 'Hamna Asif', email: 'hamnaasif@media.com', role: 'member', department: 'video' },
    { name: 'Abdul Saboor', email: 'abdulsaboor@media.com', role: 'member', department: 'video' },
    { name: 'Maria Salem', email: 'mariasalem@media.com', role: 'member', department: 'video' },
    { name: 'Summiya', email: 'summiya@media.com', role: 'member', department: 'video' },
    { name: 'Haroon Mansha', email: 'haroonmansha@media.com', role: 'member', department: 'video' },
    // Speaker
    // Muqaddas removed
    { name: 'Speaker Lead (Dummy)', email: 'speakerlead@media.com', role: 'team_lead', department: 'speaker' },

    // Main Team
    { name: 'Khadija Tul Kubrah', email: 'khadijatulkubrah@media.com', role: 'main_team', department: null },
    { name: 'Dua Amjad', email: 'duaamjad@media.com', role: 'main_team', department: null },
    { name: 'Lizam Sadiq', email: 'lizamsadiq@media.com', role: 'main_team', department: null },
    { name: 'Muhammad Hassan Azmat', email: 'muhammadhassanazmat@media.com', role: 'main_team', department: null },
    // Added Main Team
    { name: 'Muqdas Naz', email: 'muqdasnaz@media.com', role: 'main_team', department: null },
];

async function seedRealUsers() {
    try {
        console.log('🚨 STARTING DATABASE RESET AND SEEDING (SECURE)...');

        // Dynamically import ESM modules
        const { drizzle } = await import('drizzle-orm/neon-http');
        const { neon } = await import('@neondatabase/serverless');
        const schema = await import('./src/db/schema.js');

        const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL or POSTGRES_URL must be set in .env.local');
        }

        const sql = neon(connectionString);
        const db = drizzle(sql, { schema });

        // 1. Clean Database
        console.log('🧹 Clearing existing data...');

        await db.delete(schema.videoHistory);
        await db.delete(schema.videoAssets);
        await db.delete(schema.messages);
        await db.delete(schema.reminders);
        await db.delete(schema.videos);
        await db.delete(schema.users);

        console.log('✨ Database cleared.');

        // 2. Insert Users
        console.log(`🌱 Seeding ${usersRaw.length} real users with SECURE passwords...`);

        const credentials = [];

        for (const user of usersRaw) {
            const password = generateStrongPassword();
            const hashedPassword = await bcrypt.hash(password, 10);

            let departments = null;
            if (user.role === 'main_team') {
                departments = JSON.stringify(['research', 'writer', 'speaker', 'video', 'graphics', 'main']);
            } else if (user.department) {
                departments = JSON.stringify([user.department]);
            }

            await db.insert(schema.users).values({
                name: user.name,
                email: user.email,
                password: hashedPassword,
                role: user.role,
                departments: departments,
                status: 'active'
            });
            credentials.push({ ...user, password });
            console.log(`   > Created: ${user.name}`);
        }

        console.log('✅ SEEDING COMPLETE!');

        // Generate Markdown content
        const sortedCreds = credentials.sort((a, b) => {
            if (a.department === b.department) return a.role.localeCompare(b.role);
            return (a.department || 'z').localeCompare(b.department || 'z');
        });

        let markdownContent = `# User Credentials (Secure)\n\n`;
        markdownContent += `Here are the updated secure login credentials for all users. The database has been reset.\n\n`;
        markdownContent += `| Name | Role | Department | Email | Password |\n`;
        markdownContent += `| :--- | :--- | :--- | :--- | :--- |\n`;

        sortedCreds.forEach(c => {
            markdownContent += `| ${c.name} | ${c.role} | ${c.department || 'All'} | \`${c.email}\` | \`${c.password}\` |\n`;
        });

        // Write to file
        const outputPath = path.resolve('C:/Users/M.Hassan Azmat/.gemini/antigravity/brain/c6c5701a-3c2d-47a7-8186-225d64522057/secure_user_logins.md');
        fs.writeFileSync(outputPath, markdownContent);
        console.log(`📄 Credentials written to: ${outputPath}`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

seedRealUsers();
