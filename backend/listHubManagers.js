/**
 * Script to list all hub managers and their assigned hubs
 * 
 * Usage: node listHubManagers.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Hub from './models/Hub.js';

// Load environment variables
dotenv.config();

const listHubManagers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all hub managers
    const hubManagers = await User.find({ role: 'hub' })
      .select('username email phone profileData createdAt')
      .sort({ createdAt: -1 });

    if (hubManagers.length === 0) {
      console.log('\n📭 No hub managers found in the system.');
      console.log('💡 Tip: Register users with role "hub" to create hub managers.');
      return;
    }

    console.log('\n📋 Hub Managers List');
    console.log('='.repeat(80));

    for (const manager of hubManagers) {
      const assignedHub = manager.profileData?.assignedHub;
      
      console.log(`\n👤 ${manager.username}`);
      console.log(`   Email: ${manager.email}`);
      if (manager.phone) {
        console.log(`   Phone: ${manager.phone}`);
      }
      
      if (assignedHub) {
        const hub = await Hub.findOne({ name: assignedHub });
        if (hub) {
          console.log(`   🏢 Assigned Hub: ${hub.name}`);
          console.log(`   📍 Location: ${hub.district}, ${hub.state}`);
          console.log(`   📫 Address: ${hub.address}`);
          console.log(`   ✅ Status: Active`);
        } else {
          console.log(`   ⚠️  Assigned Hub: ${assignedHub} (Hub not found in database)`);
          console.log(`   🔧 Action Required: Update hub assignment`);
        }
      } else {
        console.log(`   ❌ No hub assigned`);
        console.log(`   💡 Action: Run assignHubToManager.js to assign a hub`);
      }
      
      console.log(`   📅 Created: ${manager.createdAt.toLocaleDateString()}`);
      console.log('   ' + '-'.repeat(76));
    }

    console.log(`\n📊 Summary: ${hubManagers.length} hub manager(s) found`);
    console.log('='.repeat(80));

    // Show available hubs
    console.log('\n🏢 Available Hubs for Assignment:');
    console.log('='.repeat(80));
    const hubs = await Hub.find({}).select('name district state isActive').sort({ district: 1, name: 1 });
    
    if (hubs.length === 0) {
      console.log('\n📭 No hubs found in the system.');
      console.log('💡 Tip: Run seedHubs.js to populate hubs.');
    } else {
      const hubsByDistrict = {};
      hubs.forEach(hub => {
        if (!hubsByDistrict[hub.district]) {
          hubsByDistrict[hub.district] = [];
        }
        hubsByDistrict[hub.district].push(hub);
      });

      for (const [district, districtHubs] of Object.entries(hubsByDistrict)) {
        console.log(`\n📍 ${district}:`);
        districtHubs.forEach(hub => {
          const status = hub.isActive ? '✅' : '❌';
          console.log(`   ${status} ${hub.name}`);
        });
      }
      
      console.log(`\n📊 Total: ${hubs.length} hub(s) available`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

listHubManagers();
