import { db, schema } from './src/db/index.js';
import bcrypt from 'bcryptjs';

const users = [
    // Writers
    { name: 'Ummekulsoom', email: 'ummekulsoom@media.com', role: 'member', department: 'writer', passOption: 'ummekulsoom123' },
    { name: 'Makhdoom Dua Hashmi', email: 'makhdoomduahashmi@media.com', role: 'team_lead', department: 'writer', passOption: 'dua123' },
    { name: 'Hassan Talib', email: 'hassantalib@media.com', role: 'team_lead', department: 'writer', passOption: 'talib123' },
    { name: 'Abu Huraira', email: 'abuhuraira@media.com', role: 'member', department: 'writer', passOption: 'abu123' },
    { name: 'Syed Ahmad Bin Saifullah', email: 'syedahmadbinsaifullah@media.com', role: 'member', department: 'writer', passOption: 'syed123' },
    { name: 'Bisma Naeem', email: 'bismanaeem@media.com', role: 'member', department: 'writer', passOption: 'bisma123' },
    { name: 'Um-e-Habiba', email: 'umehabiba@media.com', role: 'member', department: 'writer', passOption: 'habiba123' },
    { name: 'Mehar-ul-Eman', email: 'meharuleman@media.com', role: 'member', department: 'writer', passOption: 'mehar123' },
    { name: 'Abeeha', email: 'abeeha@media.com', role: 'member', department: 'writer', passOption: 'abeeha123' },
    { name: 'Nadia Jameel', email: 'nadiajameel@media.com', role: 'member', department: 'writer', passOption: 'nadia123' },
    // Research
    { name: 'Waleeja Mubasher', email: 'waleejamubasher@media.com', role: 'team_lead', department: 'research', passOption: 'waleeja123' },
    { name: 'Hira Gillani', email: 'hiragillani@media.com', role: 'team_lead', department: 'research', passOption: 'hira123' },
    { name: 'Mudassara Hakim', email: 'mudassarahakim@media.com', role: 'member', department: 'research', passOption: 'mudassara123' },
    { name: 'Ayesha Zulfiqar', email: 'ayeshazulfiqar@media.com', role: 'member', department: 'research', passOption: 'ayesha123' },
    { name: 'Manahil Afzal', email: 'manahilafzal@media.com', role: 'member', department: 'research', passOption: 'manahil123' },
    { name: 'Aqsa Tariq', email: 'aqsatariq@media.com', role: 'member', department: 'research', passOption: 'aqsa123' },
    { name: 'Sher Jan', email: 'sherjan@media.com', role: 'member', department: 'research', passOption: 'sher123' },
    // Graphics
    { name: 'Saira Shaheryar', email: 'sairashaheryar@media.com', role: 'member', department: 'graphics', passOption: 'saira123' },
    { name: 'Samiya Naz', email: 'samiyanaz@media.com', role: 'member', department: 'graphics', passOption: 'samiya123' },
    { name: 'Memuna Haq Nawaz', email: 'memunahaqnawaz@media.com', role: 'member', department: 'graphics', passOption: 'memuna123' },
    { name: 'Sunila Tahir', email: 'sunilatahir@media.com', role: 'member', department: 'graphics', passOption: 'sunila123' },
    { name: 'Hajra Athar', email: 'hajraathar@media.com', role: 'member', department: 'graphics', passOption: 'hajra123' },
    { name: 'Mahnoor Ahmed', email: 'mahnoorahmed@media.com', role: 'member', department: 'graphics', passOption: 'mahnoor123' },
    { name: 'Seema Qaiser', email: 'seemaqaiser@media.com', role: 'member', department: 'graphics', passOption: 'seema123' },
    { name: 'Iqra Tahir', email: 'iqratahir@media.com', role: 'team_lead', department: 'graphics', passOption: 'iqra123' },
    { name: 'Ahmad Tariq', email: 'ahmadtariq@media.com', role: 'member', department: 'graphics', passOption: 'ahmad123' },
    // Video
    { name: 'Hafsa Rashid', email: 'hafsarashid@media.com', role: 'team_lead', department: 'video', passOption: 'hafsa123' },
    { name: 'Hooria', email: 'hooria@media.com', role: 'team_lead', department: 'video', passOption: 'hooria123' },
    { name: 'Muhammad Abdul Ahad', email: 'muhammadabdulahad@media.com', role: 'team_lead', department: 'video', passOption: 'ahad123' },
    { name: 'Hamna Asif', email: 'hamnaasif@media.com', role: 'member', department: 'video', passOption: 'hamna123' },
    { name: 'Abdul Saboor', email: 'abdulsaboor@media.com', role: 'member', department: 'video', passOption: 'saboor123' },
    { name: 'Maria Salem', email: 'mariasalem@media.com', role: 'member', department: 'video', passOption: 'maria123' },
    { name: 'Summiya', email: 'summiya@media.com', role: 'member', department: 'video', passOption: 'summiya123' },
    { name: 'Haroon Mansha', email: 'haroonmansha@media.com', role: 'member', department: 'video', passOption: 'haroon123' },
    // Speaker
    { name: 'Muqaddas', email: 'muqaddas@media.com', role: 'team_lead', department: 'speaker', passOption: 'muqaddas123' },
    // Main Team
    { name: 'Khadija Tul Kubrah', email: 'khadijatulkubrah@media.com', role: 'main_team', department: null, passOption: 'khadija123' },
    { name: 'Dua Amjad', email: 'duaamjad@media.com', role: 'main_team', department: null, passOption: 'duaamjad123' },
    { name: 'Lizam Sadiq', email: 'lizamsadiq@media.com', role: 'main_team', department: null, passOption: 'lizam123' },
    { name: 'Muhammad Hassan Azmat', email: 'muhammadhassanazmat@media.com', role: 'main_team', department: null, passOption: 'hassan123' },
];

async function seedRealUsers() {
    try {
        console.log('🚨 STARTING DATABASE RESET AND SEEDING...');

        // 1. Clean Database
        console.log('🧹 Clearing existing data...');
        // Order matters for foreign key constraints

        await db.delete(schema.videoHistory);
        await db.delete(schema.videoAssets);
        await db.delete(schema.messages);
        await db.delete(schema.reminders);
        await db.delete(schema.videos);
        await db.delete(schema.users);

        console.log('✨ Database cleared.');

        // 2. Insert Users
        console.log(`🌱 Seeding ${users.length} real users...`);

        for (const user of users) {
            const password = user.passOption;
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
            console.log(`   > Created: ${user.name} (${user.role})`);
        }

        console.log('✅ SEEDING COMPLETE!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

seedRealUsers();
