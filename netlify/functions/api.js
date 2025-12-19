import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import debtRoutes from '../../server/routes/debtRoutes.js';
import userRoutes from '../../server/routes/userRoutes.js';
import paymentRoutes from '../../server/routes/paymentRoutes.js';
import reportRoutes from '../../server/routes/reportRoutes.js';
import serverless from 'serverless-http';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let cachedConnection = null;

const connectToDatabase = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  
  // Log (without exposing credentials) for debugging
  console.log('Attempting to connect to MongoDB...');
  console.log('URI format:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
  
  try {
    cachedConnection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Increased timeout for serverless
      maxPoolSize: 1,
      bufferCommands: false,
      bufferMaxEntries: 0,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('Database name:', mongoose.connection.name);
    return cachedConnection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      codeName: error.codeName
    });
    throw error;
  }
};

// Health check endpoint (before middleware)
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    const hasMongoUri = !!process.env.MONGODB_URI;
    
    res.json({ 
      status: 'OK', 
      message: 'Debt Tracker API is running on Netlify Functions',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        hasMongoUri,
        connectionState: mongoose.connection.readyState
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Middleware to ensure DB connection before handling requests
app.use('/api', async (req, res, next) => {
  // Skip DB connection for health check
  if (req.path === '/health') {
    return next();
  }
  
  try {
    console.log(`API call to: ${req.method} ${req.path}`);
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    
    let errorMessage = 'Database connection failed';
    let details = {};
    
    if (error.message.includes('MONGODB_URI')) {
      errorMessage = 'MongoDB URI not configured';
      details.hint = 'Please set MONGODB_URI environment variable in Netlify';
    } else if (error.name === 'MongoServerSelectionError') {
      errorMessage = 'Cannot connect to MongoDB server';
      details.hint = 'Check MongoDB Atlas network access settings';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : details,
      timestamp: new Date().toISOString()
    });
  }
});

// Routes
app.use('/api/debts', debtRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

// Create serverless handler
const handler = serverless(app);

export { handler };