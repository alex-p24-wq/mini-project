import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import Hub from "../models/Hub.js";
import HubActivity from "../models/HubActivity.js";
import { sendProductArrivedAtHubEmail, sendHubArrivalOTPEmail } from "../utils/emailService.js";
import crypto from "crypto";

const router = express.Router();

// Get all active hubs (public endpoint for farmers)
router.get('/', async (req, res) => {
  try {
    const { state, district } = req.query;
    
    let query = { isActive: true };
    
    if (state) {
      query.state = state;
    }
    
    if (district) {
      query.district = district;
    }
    
    const hubs = await Hub.find(query)
      .select('name state district address contactPerson phone email services operatingHours')
      .sort({ name: 1 });
    
    res.json(hubs);
  } catch (error) {
    console.error('Get hubs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hubs by district (specific endpoint for farmers)
router.get('/by-district/:state/:district', async (req, res) => {
  try {
    const { state, district } = req.params;
    
    const hubs = await Hub.find({ 
      state: state, 
      district: district, 
      isActive: true 
    })
    .select('name address contactPerson phone services')
    .sort({ name: 1 });
    
    res.json(hubs);
  } catch (error) {
    console.error('Get hubs by district error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new hub (admin/hub manager only)
router.post('/', requireAuth, requireRole(['admin', 'hub']), async (req, res) => {
  try {
    const {
      name,
      state,
      district,
      address,
      contactPerson,
      phone,
      email,
      capacity,
      services,
      operatingHours
    } = req.body;

    // Validate required fields
    if (!name || !state || !district || !address) {
      return res.status(400).json({ 
        message: 'Name, state, district, and address are required' 
      });
    }

    // Check if hub with same name exists in the same district
    const existingHub = await Hub.findOne({ 
      name: name.trim(), 
      state: state.trim(), 
      district: district.trim() 
    });
    
    if (existingHub) {
      return res.status(400).json({ 
        message: 'A hub with this name already exists in this district' 
      });
    }

    const hub = new Hub({
      name: name.trim(),
      state: state.trim(),
      district: district.trim(),
      address: address.trim(),
      contactPerson: contactPerson?.trim(),
      phone: phone?.trim(),
      email: email?.trim(),
      capacity: capacity || 0,
      services: services || [],
      operatingHours: operatingHours?.trim(),
      registeredBy: req.user._id
    });

    await hub.save();
    res.status(201).json(hub);
  } catch (error) {
    console.error('Create hub error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update hub (admin/hub manager only)
router.put('/:id', requireAuth, requireRole(['admin', 'hub']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.registeredBy;
    delete updateData.createdAt;
    
    const hub = await Hub.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!hub) {
      return res.status(404).json({ message: 'Hub not found' });
    }

    res.json(hub);
  } catch (error) {
    console.error('Update hub error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete/Deactivate hub (admin only)
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Instead of deleting, we deactivate the hub
    const hub = await Hub.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!hub) {
      return res.status(404).json({ message: 'Hub not found' });
    }

    res.json({ message: 'Hub deactivated successfully' });
  } catch (error) {
    console.error('Delete hub error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all hubs for admin management
router.get('/admin/all', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, state, district, isActive } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    if (state) query.state = state;
    if (district) query.district = district;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const [hubs, total] = await Promise.all([
      Hub.find(query)
        .populate('registeredBy', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Hub.countDocuments(query)
    ]);
    
    res.json({
      hubs,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get all hubs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hub statistics
router.get('/stats', requireAuth, requireRole(['admin', 'hub']), async (req, res) => {
  try {
    const [totalHubs, activeHubs, stateStats] = await Promise.all([
      Hub.countDocuments(),
      Hub.countDocuments({ isActive: true }),
      Hub.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$state', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);
    
    res.json({
      totalHubs,
      activeHubs,
      inactiveHubs: totalHubs - activeHubs,
      topStates: stateStats
    });
  } catch (error) {
    console.error('Get hub stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sold product activities by district (public)
router.get('/activities/by-district/:state/:district', async (req, res) => {
  try {
    const { state, district } = req.params;
    if (!state || !district) {
      return res.status(400).json({ message: 'state and district are required' });
    }

    const activities = await HubActivity.find({
      type: 'sold',
      state,
      district
    })
      .select('product order farmer customer quantity amount createdAt hubArrivalConfirmed hubArrivalConfirmedAt customerNotified')
      .populate('farmer', 'name email phone')
      .populate('customer', 'name email phone')
      .populate('product', 'name grade price')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ items: activities });
  } catch (error) {
    console.error('Get hub activities by district error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate OTP for hub arrival confirmation (any authenticated user can request)
router.post('/activities/:activityId/generate-otp', requireAuth, async (req, res) => {
  try {
    const { activityId } = req.params;
    
    const activity = await HubActivity.findById(activityId)
      .populate('farmer', 'name email')
      .populate('customer', 'name email')
      .populate('product', 'name grade');
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    // Check if already confirmed
    if (activity.hubArrivalConfirmed) {
      return res.status(400).json({ message: 'Product arrival already confirmed' });
    }
    
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Save OTP to activity
    activity.hubArrivalOTP = otp;
    activity.hubArrivalOTPExpiry = otpExpiry;
    await activity.save();
    
    console.log(`✅ OTP generated for activity ${activityId}: ${otp}`);
    
    // Send OTP to farmer's email
    console.log(`📧 Attempting to send OTP to farmer...`);
    console.log(`   Farmer: ${activity.farmer?.name}`);
    console.log(`   Email: ${activity.farmer?.email}`);
    console.log(`   Product: ${activity.product?.name}`);
    console.log(`   OTP: ${otp}`);
    
    if (activity.farmer && activity.farmer.email) {
      const productName = activity.product?.name || 'Cardamom Product';
      
      try {
        const emailResult = await sendHubArrivalOTPEmail(
          activity.farmer.email,
          activity.farmer.name,
          otp,
          productName
        );
        
        console.log(`📧 Email send result:`, emailResult);
        
        if (emailResult.success) {
          console.log(`✅ OTP email sent successfully to farmer: ${activity.farmer.email}`);
        } else {
          console.error(`❌ Failed to send OTP email: ${emailResult.error}`);
          return res.status(500).json({ 
            message: `Failed to send OTP email: ${emailResult.error}` 
          });
        }
      } catch (emailError) {
        console.error(`❌ Exception while sending OTP email:`, emailError);
        return res.status(500).json({ 
          message: `Error sending OTP email: ${emailError.message}` 
        });
      }
    } else {
      console.error(`❌ Farmer email not found!`);
      return res.status(400).json({ 
        message: 'Farmer email not found. Cannot send OTP.' 
      });
    }
    
    res.json({ 
      success: true, 
      message: `OTP has been sent to your registered email: ${activity.farmer.email}`,
      email: activity.farmer.email,
      expiresIn: '10 minutes'
    });
  } catch (error) {
    console.error('Generate OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP and confirm hub arrival (any authenticated user can verify)
router.post('/activities/:activityId/verify-otp', requireAuth, async (req, res) => {
  try {
    const { activityId } = req.params;
    const { otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }
    
    const activity = await HubActivity.findById(activityId)
      .populate('farmer', 'name email')
      .populate('customer', 'name email')
      .populate('product', 'name grade');
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    // Check if already confirmed
    if (activity.hubArrivalConfirmed) {
      return res.status(400).json({ message: 'Product arrival already confirmed' });
    }
    
    // Check if OTP exists
    if (!activity.hubArrivalOTP) {
      return res.status(400).json({ message: 'No OTP generated. Please generate OTP first' });
    }
    
    // Check if OTP expired
    if (new Date() > activity.hubArrivalOTPExpiry) {
      return res.status(400).json({ message: 'OTP has expired. Please generate a new one' });
    }
    
    // Verify OTP
    if (activity.hubArrivalOTP !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // Mark as confirmed
    activity.hubArrivalConfirmed = true;
    activity.hubArrivalConfirmedAt = new Date();
    activity.hubArrivalConfirmedBy = req.user.userId;
    activity.hubArrivalOTP = undefined; // Clear OTP
    activity.hubArrivalOTPExpiry = undefined;
    await activity.save();
    
    // Send email notification to customer
    if (activity.customer && activity.customer.email) {
      const orderData = {
        productName: activity.product?.name || 'Cardamom',
        farmerName: activity.farmer?.name || 'Farmer',
        quantity: activity.quantity || 0,
        orderIdShort: String(activity.order).slice(-8),
        hubLocation: `${activity.district}, ${activity.state}`
      };
      
      const emailResult = await sendProductArrivedAtHubEmail(
        activity.customer.email,
        activity.customer.name,
        orderData
      );
      
      if (emailResult.success) {
        activity.customerNotified = true;
        await activity.save();
        console.log(`✅ Customer notification sent to ${activity.customer.email}`);
      } else {
        console.error(`❌ Failed to send customer notification: ${emailResult.error}`);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Product arrival confirmed successfully. Customer has been notified.',
      confirmedAt: activity.hubArrivalConfirmedAt,
      customerNotified: activity.customerNotified
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
