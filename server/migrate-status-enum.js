// Migration script to fix ProjectInvitation status enum
import sequelize from './config/db.js';

const updateStatusEnum = async () => {
    try {
        console.log('🔄 Updating ProjectInvitation status enum...');
        
        // Drop and recreate the enum constraint
        await sequelize.query(`
            ALTER TABLE ProjectInvitations 
            MODIFY COLUMN status ENUM('pending', 'accepted', 'rejected', 'completed') 
            DEFAULT 'pending'
        `);
        
        console.log('✅ Successfully updated ProjectInvitation status enum');
        
        // Test the change
        const [results] = await sequelize.query(`
            DESCRIBE ProjectInvitations
        `);
        
        const statusColumn = results.find(col => col.Field === 'status');
        console.log('📋 Status column info:', statusColumn);
        
    } catch (error) {
        console.error('❌ Migration error:', error.message);
        
        // Alternative approach for MySQL
        console.log('🔄 Trying alternative approach...');
        try {
            await sequelize.query(`
                ALTER TABLE ProjectInvitations 
                CHANGE COLUMN status status ENUM('pending', 'accepted', 'rejected', 'completed') 
                DEFAULT 'pending'
            `);
            console.log('✅ Alternative approach successful');
        } catch (altError) {
            console.error('❌ Alternative approach failed:', altError.message);
        }
    } finally {
        await sequelize.close();
    }
};

updateStatusEnum();
