import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import debtRoutes from './routes/debtRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// Middleware
// Enable CORS to allow frontend to communicate with backend
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/debt-tracker';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('⚠️  Server will continue running, but database operations will fail.');
    console.error('⚠️  Please check your MONGODB_URI in the .env file.');
  });

// Root route - provides API information
app.get('/', (req, res) => {
  res.json({
    message: 'Debt Tracker API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      getAllDebts: 'GET /api/debts',
      createDebt: 'POST /api/debts',
      deleteDebt: 'DELETE /api/debts/:id',
      registerUser: 'POST /api/users/register',
      loginUser: 'POST /api/users/login',
      getAllUsers: 'GET /api/users'
    },
    status: mongoose.connection.readyState === 1 ? 'Connected to MongoDB' : 'MongoDB not connected'
  });
});

// API Routes
// All debt-related endpoints will be prefixed with /api/debts
app.use('/api/debts', debtRoutes);
// All user-related endpoints will be prefixed with /api/users
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: dbStatus
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

