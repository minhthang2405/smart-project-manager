// Fix existing 'completed' status to 'accepted' in database
import sequelize from './config/db.js';
import ProjectInvitation from './models/ProjectInvitation.js';

const fixInvitationStatus = async () => {
    try {
        console.log('🔧 Fixing invitation status from completed to accepted...');
        
        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connected');
        
        // Update any 'completed' status to 'accepted'
        const [results] = await sequelize.query(`
            UPDATE ProjectInvitations 
            SET status = 'accepted' 
            WHERE status = 'completed'
        `);
        
        console.log(`✅ Updated ${results.affectedRows || 0} records`);
        
        // Verify the fix
        const pendingCount = await ProjectInvitation.count({ where: { status: 'pending' } });
        const acceptedCount = await ProjectInvitation.count({ where: { status: 'accepted' } });
        const rejectedCount = await ProjectInvitation.count({ where: { status: 'rejected' } });
        
        console.log('📊 Current status counts:');
        console.log(`  Pending: ${pendingCount}`);
        console.log(`  Accepted: ${acceptedCount}`);
        console.log(`  Rejected: ${rejectedCount}`);
        
        console.log('✅ Fix completed successfully!');
        
    } catch (error) {
        console.error('❌ Fix error:', error);
    } finally {
        await sequelize.close();
    }
};

fixInvitationStatus();
