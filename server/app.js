import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';
import userRoutes from './routes/user.routes.js';
import invitationRoutes from './routes/invitation.routes.js';
import { testEmailConnection } from './services/mail.service.js';

// Import models để thiết lập associations
import Project from './models/Project.js';
import ProjectInvitation from './models/ProjectInvitation.js';
import ProjectMember from './models/ProjectMember.js';
import User from './models/User.js';
import Task from './models/Task.js';

// Load environment variables FIRST
dotenv.config();

// Debug: Kiểm tra biến môi trường
console.log('🔍 Checking environment variables:');
console.log('EMAIL:', process.env.EMAIL ? '✅ Set' : '❌ Not set');
console.log('PASSWORD:', process.env.PASSWORD ? '✅ Set' : '❌ Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Thiết lập associations
Project.hasMany(ProjectInvitation, { foreignKey: 'projectId', as: 'invitations' });
ProjectInvitation.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Associations cho ProjectMember
Project.hasMany(ProjectMember, { foreignKey: 'projectId', as: 'members' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

User.hasMany(ProjectMember, { foreignKey: 'email', sourceKey: 'email', as: 'memberships' });
ProjectMember.belongsTo(User, { foreignKey: 'email', targetKey: 'email', as: 'user' });

// Associations cho Task
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

User.hasMany(Task, { foreignKey: 'assignee', sourceKey: 'email', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assignee', targetKey: 'email', as: 'assignedUser' });

const app = express();

// CORS configuration - update for production
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000',
  // Add your production frontend URL here
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint for Railway
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    res.status(200).json({ 
      status: 'OK', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Project Management API',
    version: '1.0.0',
    status: 'running' 
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/', taskRoutes);
app.use('/users', userRoutes);
app.use('/invitations', invitationRoutes);

// Start server with email test
const startServer = async () => {
    try {
        console.log('📊 Starting Smart Project Management Server...');
        
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connected successfully.');
        
        // Sync database
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized successfully.');
        
        // Test email connection
        console.log('📧 Testing email connection...');
        const emailWorking = await testEmailConnection();
        if (emailWorking) {
            console.log('✅ Email service is ready!');
        } else {
            console.log('⚠️ Email service has issues - check configuration');
        }
        
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📧 Test email endpoint: http://localhost:${PORT}/invitations/test-email`);
        });
        
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

startServer();
