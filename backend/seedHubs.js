import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hub from './models/Hub.js';
import User from './models/User.js';

dotenv.config();

// 14 Kerala District Hubs for E-Cardamom Connect
// Covering all 14 districts of Kerala state
const keralaDistrictHubs = [
  // 1. Idukki - Primary Cardamom Production District
  {
    name: "Kumily Cardamom Hub",
    state: "Kerala",
    district: "Idukki",
    address: "Kumily Market Road, Kumily, Idukki District",
    contactPerson: "Ravi Kumar",
    phone: "9876543210",
    email: "kumily.hub@cardamom.com",
    capacity: 12000,
    services: ["Storage", "Processing", "Quality Testing", "Transportation", "Export Services"],
    operatingHours: "5:00 AM - 9:00 PM",
    hubType: "Primary Production Hub",
    coordinates: { latitude: 9.9167, longitude: 77.1167 }
  },

  // 2. Wayanad - High-Quality Cardamom Region
  {
    name: "Wayanad Spice Center",
    state: "Kerala",
    district: "Wayanad",
    address: "Kalpetta Town, Wayanad District",
    contactPerson: "Meera Thomas",
    phone: "9876543213",
    email: "wayanad.hub@cardamom.com",
    capacity: 8000,
    services: ["Storage", "Processing", "Quality Testing", "Transportation"],
    operatingHours: "6:00 AM - 8:00 PM",
    hubType: "Primary Production Hub",
    coordinates: { latitude: 11.39, longitude: 76.05 }
  },

  // 3. Ernakulam - Export Hub
  {
    name: "Kochi Export Terminal",
    state: "Kerala",
    district: "Ernakulam",
    address: "Willingdon Island, Kochi Port, Ernakulam",
    contactPerson: "Rajesh Menon",
    phone: "9876543215",
    email: "kochi.port@cardamom.com",
    capacity: 20000,
    services: ["Storage", "Processing", "Packaging", "Quality Testing", "Export Services", "Transportation"],
    operatingHours: "24/7",
    hubType: "Export Hub",
    coordinates: { latitude: 10.00, longitude: 76.25 }
  },

  // 4. Palakkad - Processing Hub
  {
    name: "Palakkad Processing Hub",
    state: "Kerala",
    district: "Palakkad",
    address: "Palakkad Industrial Area, Palakkad District",
    contactPerson: "Sunil Nair",
    phone: "9876543225",
    email: "palakkad.hub@cardamom.com",
    capacity: 7000,
    services: ["Storage", "Processing", "Packaging", "Quality Testing"],
    operatingHours: "6:00 AM - 8:00 PM",
    hubType: "Processing Hub",
    coordinates: { latitude: 10.47, longitude: 76.39 }
  },

  // 5. Thiruvananthapuram - Capital Distribution Center
  {
    name: "Thiruvananthapuram Distribution Center",
    state: "Kerala",
    district: "Thiruvananthapuram",
    address: "Technopark Phase II, Thiruvananthapuram",
    contactPerson: "Lakshmi Pillai",
    phone: "9876543226",
    email: "tvm.hub@cardamom.com",
    capacity: 6000,
    services: ["Storage", "Packaging", "Transportation", "Export Services"],
    operatingHours: "7:00 AM - 7:00 PM",
    hubType: "Distribution Hub",
    coordinates: { latitude: 8.5241, longitude: 76.9366 }
  },

  // 6. Kozhikode - Northern Kerala Hub
  {
    name: "Kozhikode Spice Hub",
    state: "Kerala",
    district: "Kozhikode",
    address: "Kozhikode Beach Road, Kozhikode District",
    contactPerson: "Abdul Rahman",
    phone: "9876543230",
    email: "kozhikode.hub@cardamom.com",
    capacity: 5000,
    services: ["Storage", "Processing", "Transportation"],
    operatingHours: "6:00 AM - 8:00 PM",
    hubType: "Regional Hub",
    coordinates: { latitude: 11.59, longitude: 75.48 }
  },

  // 7. Thrissur - Cultural Capital Hub
  {
    name: "Thrissur Cardamom Center",
    state: "Kerala",
    district: "Thrissur",
    address: "Thrissur Round, Thrissur District",
    contactPerson: "Priya Varma",
    phone: "9876543231",
    email: "thrissur.hub@cardamom.com",
    capacity: 4500,
    services: ["Storage", "Quality Testing", "Transportation"],
    operatingHours: "6:30 AM - 7:30 PM",
    hubType: "Regional Hub",
    coordinates: { latitude: 10.31, longitude: 76.12 }
  },

  // 8. Kollam - Coastal Hub
  {
    name: "Kollam Coastal Hub",
    state: "Kerala",
    district: "Kollam",
    address: "Kollam Port Area, Kollam District",
    contactPerson: "Sreekanth Nair",
    phone: "9876543232",
    email: "kollam.hub@cardamom.com",
    capacity: 4000,
    services: ["Storage", "Packaging", "Transportation", "Export Services"],
    operatingHours: "6:00 AM - 8:00 PM",
    hubType: "Port Hub",
    coordinates: { latitude: 8.89, longitude: 76.55 }
  },

  // 9. Alappuzha - Backwater Hub
  {
    name: "Alappuzha Spice Terminal",
    state: "Kerala",
    district: "Alappuzha",
    address: "Alappuzha Market Junction, Alappuzha District",
    contactPerson: "Radhika Menon",
    phone: "9876543233",
    email: "alappuzha.hub@cardamom.com",
    capacity: 3500,
    services: ["Storage", "Processing", "Transportation"],
    operatingHours: "6:00 AM - 7:00 PM",
    hubType: "Collection Hub",
    coordinates: { latitude: 9.5, longitude: 76.33 }
  },

  // 10. Kottayam - Central Kerala Hub
  {
    name: "Kottayam Central Hub",
    state: "Kerala",
    district: "Kottayam",
    address: "Kottayam Town Center, Kottayam District",
    contactPerson: "Thomas George",
    phone: "9876543234",
    email: "kottayam.hub@cardamom.com",
    capacity: 4000,
    services: ["Storage", "Quality Testing", "Transportation"],
    operatingHours: "6:30 AM - 7:30 PM",
    hubType: "Regional Hub",
    coordinates: { latitude: 9.36, longitude: 76.34 }
  },

  // 11. Pathanamthitta - Hill Station Hub
  {
    name: "Pathanamthitta Hills Hub",
    state: "Kerala",
    district: "Pathanamthitta",
    address: "Pathanamthitta Market Road, Pathanamthitta District",
    contactPerson: "Suja Kumari",
    phone: "9876543235",
    email: "pathanamthitta.hub@cardamom.com",
    capacity: 3000,
    services: ["Storage", "Processing", "Transportation"],
    operatingHours: "6:00 AM - 7:00 PM",
    hubType: "Collection Hub",
    coordinates: { latitude: 9.26, longitude: 76.78 }
  },

  // 12. Malappuram - Northern Malabar Hub
  {
    name: "Malappuram Spice Center",
    state: "Kerala",
    district: "Malappuram",
    address: "Malappuram Town, Malappuram District",
    contactPerson: "Faizal Ahmed",
    phone: "9876543236",
    email: "malappuram.hub@cardamom.com",
    capacity: 3500,
    services: ["Storage", "Processing", "Transportation"],
    operatingHours: "6:00 AM - 8:00 PM",
    hubType: "Regional Hub",
    coordinates: { latitude: 11.03, longitude: 76.07 }
  },

  // 13. Kannur - Malabar Coast Hub
  {
    name: "Kannur Coastal Hub",
    state: "Kerala",
    district: "Kannur",
    address: "Kannur Port Road, Kannur District",
    contactPerson: "Vineesh Kumar",
    phone: "9876543237",
    email: "kannur.hub@cardamom.com",
    capacity: 3000,
    services: ["Storage", "Transportation", "Export Services"],
    operatingHours: "6:00 AM - 8:00 PM",
    hubType: "Port Hub",
    coordinates: { latitude: 11.87, longitude: 75.37 }
  },

  // 14. Kasaragod - Northern Border Hub
  {
    name: "Kasaragod Border Hub",
    state: "Kerala",
    district: "Kasaragod",
    address: "Kasaragod Market Area, Kasaragod District",
    contactPerson: "Shanti Bhat",
    phone: "9876543238",
    email: "kasaragod.hub@cardamom.com",
    capacity: 2500,
    services: ["Storage", "Quality Testing", "Transportation"],
    operatingHours: "6:30 AM - 7:30 PM",
    hubType: "Border Hub"
  }
];

const seedHubs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find an admin user to assign as registeredBy
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      // Create a default admin user if none exists
      console.log('Creating default admin user...');
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@cardamom.com',
        password: 'admin123', // This will be hashed by the pre-save middleware
        role: 'admin'
      });
    }

    // Clear existing hubs
    await Hub.deleteMany({});
    console.log('🗑️ Cleared existing hubs');

    // Insert 14 Kerala district hubs
    const hubsWithRegisteredBy = keralaDistrictHubs.map(hub => ({
      ...hub,
      registeredBy: adminUser._id
    }));

    const createdHubs = await Hub.insertMany(hubsWithRegisteredBy);
    console.log(`✅ Created ${createdHubs.length} Kerala district hubs`);

    // Display summary by state/district
    const summary = {};
    createdHubs.forEach(hub => {
      const key = `${hub.state} - ${hub.district}`;
      if (!summary[key]) summary[key] = 0;
      summary[key]++;
    });

    console.log('\n📊 Hubs created by location:');
    Object.entries(summary).forEach(([location, count]) => {
      console.log(`   ${location}: ${count} hubs`);
    });

    console.log('\n🎉 Hub seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding hubs:', error);
    process.exit(1);
  }
};

seedHubs();
