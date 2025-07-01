const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  const response = {
    message: 'Ultra simple server is working!',
    url: req.url,
    method: req.method,
    port: process.env.PORT || 3000,
    time: new Date().toISOString(),
    status: 'healthy'
  };
  
  res.writeHead(200);
  res.end(JSON.stringify(response, null, 2));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=== ULTRA SIMPLE SERVER ===`);
  console.log(`Server running on: http://0.0.0.0:${PORT}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Process PID: ${process.pid}`);
  console.log(`Node version: ${process.version}`);
  console.log(`===========================`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
