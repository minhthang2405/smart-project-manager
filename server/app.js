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
  // Production frontend URLs
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  // Vercel domains
  'https://smart-project-manager.vercel.app',
  /\.vercel\.app$/,
  /https:\/\/.*\.vercel\.app$/
].filter(Boolean);

console.log('🔧 CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    console.log('🌐 Request from origin:', origin);
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      console.log('✅ Origin allowed:', origin);
      return callback(null, true);
    } else {
      console.log('❌ Origin blocked:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
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

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Debug endpoint to check database
app.get('/debug/db', async (req, res) => {
  try {
    const userCount = await User.count();
    const projectCount = await Project.count();
    const taskCount = await Task.count();
    
    res.json({
      database: 'connected',
      counts: {
        users: userCount,
        projects: projectCount,
        tasks: taskCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      database: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug CORS endpoint
app.get('/debug/cors', (req, res) => {
  res.json({
    origin: req.headers.origin,
    allowedOrigins: allowedOrigins,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/', taskRoutes);
app.use('/users', userRoutes);
app.use('/invitations', invitationRoutes);

// Start server with graceful error handling
const startServer = async () => {
    try {
        console.log('📊 Starting Smart Project Management Server...');
        console.log('🔍 Environment:', process.env.NODE_ENV || 'development');
        console.log('🔍 Port:', process.env.PORT || 5000);
        console.log('🔍 Database URL configured:', !!(process.env.DATABASE_URL || process.env.MYSQL_URL));
        
        // Test database connection with retry
        let dbConnected = false;
        let retries = 3;
        
        while (!dbConnected && retries > 0) {
            try {
                await sequelize.authenticate();
                console.log('✅ Database connected successfully.');
                dbConnected = true;
            } catch (dbError) {
                retries--;
                console.log(`⚠️ Database connection failed. Retries left: ${retries}`);
                if (retries === 0) {
                    console.error('❌ Database connection failed after retries:', dbError.message);
                    // Continue without database for now
                    console.log('⚠️ Starting server without database connection...');
                } else {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
                }
            }
        }
        
        // Sync database only if connected
        if (dbConnected) {
            try {
                await sequelize.sync({ alter: true });
                console.log('✅ Database synchronized successfully.');
            } catch (syncError) {
                console.error('⚠️ Database sync failed:', syncError.message);
            }
        }
        
        // Test email connection (non-blocking)
        console.log('📧 Testing email connection...');
        try {
            const emailTestPromise = testEmailConnection();
            const emailWorking = await Promise.race([
                emailTestPromise,
                new Promise(resolve => setTimeout(() => resolve(false), 5000)) // 5s timeout
            ]);
            
            if (emailWorking) {
                console.log('✅ Email service is ready!');
            } else {
                console.log('⚠️ Email service timeout or has issues - but server will continue');
            }
        } catch (emailError) {
            console.log('⚠️ Email test failed:', emailError.message, '- but server will continue');
        }
        
        const PORT = process.env.PORT || 5000;
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📧 Health check: /health`);
            console.log(`📧 API root: /`);
        });
        
        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('👋 SIGTERM received, shutting down gracefully');
            server.close(() => {
                console.log('✅ Process terminated');
                process.exit(0);
            });
        });
        
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
};

startServer();
