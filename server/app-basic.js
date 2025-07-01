const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Railway!');
});

app.get('/test', (req, res) => {
  res.json({
    message: 'Server is working',
    port: process.env.PORT || 3000,
    time: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Basic server running on port ${PORT}`);
});
