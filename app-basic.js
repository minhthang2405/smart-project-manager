const express = require('express');
const app = express();

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.json({
    message: 'Hello from Railway! Server is working!',
    status: 'healthy',
    port: process.env.PORT || 3000,
    time: new Date().toISOString()
  });
});

app.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({
    message: 'Basic server is working',
    port: process.env.PORT || 3000,
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  console.log('Health endpoint hit');
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Catch all other routes
app.get('*', (req, res) => {
  console.log(`Unknown route: ${req.path}`);
  res.json({
    message: `Route ${req.path} not found`,
    availableRoutes: ['/', '/test', '/health']
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=== BASIC SERVER STARTED ===`);
  console.log(`Server running on: http://0.0.0.0:${PORT}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Process PID: ${process.pid}`);
  console.log(`Node version: ${process.version}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`================================`);
});
