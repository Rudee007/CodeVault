// app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const MongoDB = require('./config/db');
const app = express();
const linkRoutes = require('./routes/linkRoutes');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//database connection
MongoDB();

// Routes
const authRoutes = require('./routes/authRoutes');
const snippetRoutes = require('./routes/snippetRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/snippets', snippetRoutes); 
app.use('/api', linkRoutes); 

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
