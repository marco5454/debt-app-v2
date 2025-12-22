import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

// Load environment variables
dotenv.config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/debt-tracker';

async function removeTestUserAndShowUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('🗄️  Database:', mongoose.connection.name);

    // Remove test user
    const deleteResult = await User.deleteOne({ username: 'testuser' });
    if (deleteResult.deletedCount > 0) {
      console.log('🗑️  Test user removed successfully');
    } else {
      console.log('ℹ️  No test user found to remove');
    }

    // Show all existing users in the database
    const users = await User.find({}, 'username gender createdAt');
    console.log('\n👥 Existing users in debt-tracker database:');
    if (users.length === 0) {
      console.log('   No users found in the database');
      console.log('   You can register a new user through the app or create one manually');
    } else {
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. Username: ${user.username}, Gender: ${user.gender}, Created: ${user.createdAt}`);
      });
    }

    console.log(`\n📊 Total users: ${users.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

removeTestUserAndShowUsers();