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

// Debug environment variables
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
if (process.env.MONGODB_URI) {
  console.log('MONGODB_URI format:', process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
}

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${req.path}`);
  next();
});

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
    // First disconnect any existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    cachedConnection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 1,
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('Database name:', mongoose.connection.name);
    console.log('Connection state:', mongoose.connection.readyState);
    return cachedConnection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      codeName: error.codeName,
      reason: error.reason
    });
    
    // Specific error messages for common issues
    if (error.message.includes('Authentication failed')) {
      throw new Error('MongoDB authentication failed - check username/password');
    } else if (error.message.includes('connection timed out')) {
      throw new Error('MongoDB connection timed out - check network access in Atlas');
    } else if (error.message.includes('ENOTFOUND')) {
      throw new Error('MongoDB cluster not found - check cluster URL');
    }
    
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
        connectionState: mongoose.connection.readyState,
        mongoUri: process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') : 'Not set'
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

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    console.log('Testing database connection...');
    await connectToDatabase();
    
    // Try a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    res.json({
      status: 'SUCCESS',
      message: 'Database connection successful',
      database: {
        name: mongoose.connection.name,
        collections: collections.map(c => c.name),
        connectionState: mongoose.connection.readyState
      }
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message,
      details: {
        name: error.name,
        code: error.code
      }
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
const handler = serverless(app, {
  binary: false
});

// Export both named and default for compatibility
export { handler };
export const handler_default = handler;