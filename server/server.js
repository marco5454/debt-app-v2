import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import debtRoutes from './routes/debtRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

// Load environment variables from .env file in server directory
dotenv.config({ path: './.env' });

// Load environment variables from .env file in parent directory
dotenv.config({ path: '../.env' });

// Create Express app
const app = express();

// Middleware
// Enable CORS to allow frontend to communicate with backend
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// Connect to MongoDB and start server only after successful connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/debt-tracker';
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    console.log('📍 Connection string:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Connection state:', mongoose.connection.readyState); // Should be 1 (connected)
    console.log('🗄️  Database:', mongoose.connection.name);

    // Optional: log connection state changes
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
      console.log('📊 Connection state:', mongoose.connection.readyState);
    });
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err.message);
    });

    // Try starting the server, falling back to the next available port if in use
    const basePort = Number(PORT) || 5000;
    let currentPort = basePort;

    while (true) {
      try {
        await new Promise((resolve, reject) => {
          const server = app.listen(currentPort, () => resolve());
          server.on('error', (err) => reject(err));
        });
        console.log(`🚀 Server running on http://localhost:${currentPort}`);
        break;
      } catch (err) {
        if (err && err.code === 'EADDRINUSE') {
          console.warn(`⚠️  Port ${currentPort} in use. Trying ${currentPort + 1}...`);
          currentPort += 1;
          continue;
        }
        throw err;
      }
    }
  } catch (error) {
    console.error('❌ Startup error:', error.message);
    console.error('📋 Full error:', error);
    console.error('⚠️  Check your MONGODB_URI and network access settings.');
    console.error('💡 Common issues:');
    console.error('   - IP address not whitelisted in MongoDB Atlas');
    console.error('   - Invalid username or password');
    console.error('   - Network firewall blocking connection');
    process.exit(1);
  }
}

start();

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
      getAllUsers: 'GET /api/users',
      createReport: 'POST /api/reports',
      getAllReports: 'GET /api/reports'
    },
    status: mongoose.connection.readyState === 1 ? 'Connected to MongoDB' : 'MongoDB not connected'
  });
});

// API Routes
// All debt-related endpoints will be prefixed with /api/debts
app.use('/api/debts', debtRoutes);
// All user-related endpoints will be prefixed with /api/users
app.use('/api/users', userRoutes);
// Payment-related endpoints
app.use('/api/payments', paymentRoutes);
// Report-related endpoints
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: dbStatus
  });
});

// Server start moved to `start()` after successful DB connection

