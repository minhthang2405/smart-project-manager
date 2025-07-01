// Check for test emails in database
import sequelize from './config/db.js';

const checkTestEmails = async () => {
    try {
        console.log('🔍 Checking for test emails in database...');
        
        await sequelize.authenticate();
        console.log('✅ Database connected');
        
        // Check Users table
        const [users] = await sequelize.query(`
            SELECT email, name FROM Users 
            WHERE email LIKE '%test%' OR email LIKE '%@test.com%'
        `);
        
        console.log('\n👥 Test users found:');
        users.forEach(user => {
            console.log(`  - ${user.email} (${user.name})`);
        });
        
        // Check ProjectInvitations table
        const [invitations] = await sequelize.query(`
            SELECT email, inviterEmail, status FROM ProjectInvitations 
            WHERE email LIKE '%test%' OR email LIKE '%@test.com%' 
            OR inviterEmail LIKE '%test%' OR inviterEmail LIKE '%@test.com%'
        `);
        
        console.log('\n📧 Test invitations found:');
        invitations.forEach(inv => {
            console.log(`  - ${inv.email} invited by ${inv.inviterEmail} (${inv.status})`);
        });
        
        // Check ProjectMembers table
        const [members] = await sequelize.query(`
            SELECT email FROM ProjectMembers 
            WHERE email LIKE '%test%' OR email LIKE '%@test.com%'
        `);
        
        console.log('\n👤 Test members found:');
        members.forEach(member => {
            console.log(`  - ${member.email}`);
        });
        
        console.log('\n✅ Check completed!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
};

checkTestEmails();
