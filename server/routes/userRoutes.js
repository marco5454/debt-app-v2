import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';

const router = express.Router();

// Middleware to check MongoDB connection
const checkDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: 'Database not connected. Please check your MongoDB connection string in the .env file.',
      error: 'MongoDB connection failed'
    });
  }
  next();
};

// Apply database connection check to all routes
router.use(checkDatabaseConnection);

// POST /users/register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, gender } = req.body;
    
    // Validate required fields
    if (!username || !password || !gender) {
      return res.status(400).json({ 
        message: 'Missing required fields: username, password, and gender are required' 
      });
    }
    
    // Validate username length
    if (username.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Username must be at least 2 characters' 
      });
    }
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters' 
      });
    }
    
    // Validate gender
    const validGenders = ['Male', 'Female', 'Other'];
    if (!validGenders.includes(gender)) {
      return res.status(400).json({ 
        message: 'Gender must be Male, Female, or Other' 
      });
    }
    
    // Check if user already exists (by username - in a real app, you'd use email)
    // For simplicity, we'll allow multiple users with same username
    // In production, you'd want unique usernames or email addresses
    
    // Create new user document
    const newUser = new User({
      username: username.trim(),
      password: password, // In production, hash this password!
      gender
    });
    
    // Save to database
    const savedUser = await newUser.save();
    
    // Return user data (excluding password in production)
    const userResponse = {
      _id: savedUser._id,
      username: savedUser.username,
      gender: savedUser.gender,
      createdAt: savedUser.createdAt
    };
    
    res.status(201).json({ 
      message: 'User registered successfully',
      user: userResponse
    });
  } catch (error) {
    // Handle validation errors or other database errors
    res.status(400).json({ message: 'Error registering user', error: error.message });
  }
});

// POST /users/login - Login a user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }
    
    // Find user by username
    const user = await User.findOne({ username: username.trim() });
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid username or password' 
      });
    }
    
    // Check password (in production, compare hashed passwords)
    if (user.password !== password) {
      return res.status(401).json({ 
        message: 'Invalid username or password' 
      });
    }
    
    // Login successful - return user data (excluding password)
    const userResponse = {
      _id: user._id,
      username: user.username,
      gender: user.gender,
      createdAt: user.createdAt
    };
    
    res.status(200).json({ 
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

// GET /users - Get all users (for testing, remove in production)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

export default router;

