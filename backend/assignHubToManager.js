/**
 * Script to assign hubs to hub managers
 * This sets the assignedHub field in user's profileData
 * 
 * Usage: node assignHubToManager.js <username> <hubName>
 * Example: node assignHubToManager.js john_hub "Idukki Cardamom Hub"
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Hub from './models/Hub.js';

// Load environment variables
dotenv.config();

const assignHubToManager = async (username, hubName) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      console.error(`❌ User not found: ${username}`);
      process.exit(1);
    }

    // Verify user is a hub manager
    if (user.role !== 'hub') {
      console.error(`❌ User ${username} is not a hub manager (current role: ${user.role})`);
      console.log('💡 Tip: Only users with role "hub" can be assigned to hubs');
      process.exit(1);
    }

    // Find the hub
    const hub = await Hub.findOne({ name: hubName });
    if (!hub) {
      console.error(`❌ Hub not found: ${hubName}`);
      console.log('\n📋 Available hubs:');
      const allHubs = await Hub.find({}).select('name district state');
      allHubs.forEach(h => {
        console.log(`  • ${h.name} (${h.district}, ${h.state})`);
      });
      process.exit(1);
    }

    // Update user's profileData
    user.profileData = user.profileData || {};
    user.profileData.assignedHub = hub.name;
    user.profileData.assignedHubId = hub._id;
    
    await user.save();

    console.log('\n✅ Hub assigned successfully!');
    console.log('━'.repeat(50));
    console.log(`👤 User: ${user.username} (${user.email})`);
    console.log(`🏢 Hub: ${hub.name}`);
    console.log(`📍 Location: ${hub.district}, ${hub.state}`);
    console.log(`📫 Address: ${hub.address}`);
    console.log('━'.repeat(50));
    console.log('\n💡 The hub manager can now see bulk products assigned to this hub.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node assignHubToManager.js <username> <hubName>');
  console.log('\nExample:');
  console.log('  node assignHubToManager.js john_hub "Idukki Cardamom Hub"');
  console.log('\n💡 Tip: Use quotes around hub name if it contains spaces');
  process.exit(1);
}

const [username, ...hubNameParts] = args;
const hubName = hubNameParts.join(' ');

assignHubToManager(username, hubName);
