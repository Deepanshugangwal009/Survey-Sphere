require('dotenv').config();

const express = require('express');

const { connectDatabase } = require('./config/database');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Online Survey System is running');
});

async function startServer() {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch {
    process.exit(1);
  }
}

startServer();
