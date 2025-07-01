const express = require('express');
const cors = require('cors');
const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Manager API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    port: process.env.PORT
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Environment variables check
app.get('/env-check', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
    EMAIL: process.env.EMAIL ? 'Set' : 'Not set',
    PASSWORD: process.env.PASSWORD ? 'Set' : 'Not set',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=== Smart Manager Debug Server ===`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`================================`);
});
