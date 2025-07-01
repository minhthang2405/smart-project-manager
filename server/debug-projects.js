import sequelize from './config/db.js';
import Project from './models/Project.js';
import Task from './models/Task.js';

// Thiết lập association
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

async function debugProjects() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');
        
        // Lấy tất cả projects
        const projects = await Project.findAll();
        console.log('📋 All projects:');
        projects.forEach(p => console.log(`  ID: ${p.id}, Name: "${p.name}", Owner: ${p.owner}`));
        
        // Lấy tất cả tasks với project info
        const tasks = await Task.findAll({
            include: [{
                model: Project,
                as: 'project',
                attributes: ['id', 'name']
            }]
        });
        
        console.log('\n📝 All tasks with project info:');
        tasks.forEach(t => {
            console.log(`  Task ID: ${t.id}, Title: "${t.title}", ProjectID: ${t.projectId}`);
            console.log(`    Project: ${t.project ? `"${t.project.name}"` : 'NULL'}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

debugProjects();
