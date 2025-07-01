import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000',
  process.env.CLIENT_URL,
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    database: 'not connected (temporary)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Project Management API',
    version: '1.0.0',
    status: 'running (without database)',
    note: 'Database will be connected later'
  });
});

// Temporary API endpoints (without database)
app.get('/api/status', (req, res) => {
  res.json({
    server: 'running',
    database: 'disabled temporarily',
    environment: process.env.NODE_ENV
  });
});

// Start server
const startServer = () => {
  try {
    console.log('📊 Starting Smart Project Management Server (No DB)...');
    console.log('🔍 Environment:', process.env.NODE_ENV || 'development');
    console.log('🔍 Port:', process.env.PORT || 5000);
    
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: /health`);
      console.log(`📊 API status: /api/status`);
      console.log(`✅ Server started successfully WITHOUT database`);
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
    process.exit(1);
  }
};

startServer();
