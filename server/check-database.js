// Test database connection and check data
import sequelize from './config/db.js';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';

const checkDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');
        
        // Check data in tables
        const users = await User.findAll();
        const projects = await Project.findAll();
        const tasks = await Task.findAll();
        
        console.log('📊 Database Status:');
        console.log(`Users: ${users.length}`);
        console.log(`Projects: ${projects.length}`);
        console.log(`Tasks: ${tasks.length}`);
        
        if (users.length > 0) {
            console.log('👥 Users:', users.map(u => u.email));
        }
        
        if (projects.length > 0) {
            console.log('📋 Projects:', projects.map(p => p.name));
        }
        
        if (tasks.length > 0) {
            console.log('📝 Tasks:', tasks.map(t => t.title));
        }
        
    } catch (error) {
        console.error('❌ Database error:', error);
    }
};

checkDatabase();
