import sequelize from './config/db.js';
import User from './models/User.js';
import Project from './models/Project.js';
import ProjectMember from './models/ProjectMember.js';
import ProjectInvitation from './models/ProjectInvitation.js';
import Task from './models/Task.js';

async function initDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');

    console.log('🔄 Syncing database models...');
    await sequelize.sync({ force: false }); // Set to true to recreate tables
    console.log('✅ Database synced successfully!');

    console.log('🎉 Database initialization completed!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
