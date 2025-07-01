const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Railway! Server is working!');
});

app.get('/test', (req, res) => {
  res.json({
    message: 'Basic server is working',
    port: process.env.PORT || 3000,
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Basic server running on port ${PORT}`);
  console.log(`Time: ${new Date().toISOString()}`);
});
