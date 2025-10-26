import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import Product from "../models/Product.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();

// Multer setup for image uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `product-${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only image uploads are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Get all agricare providers
router.get('/', async (req, res) => {
  try {
    res.json({ message: 'AgriCare routes working' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get agricare stats
router.get('/stats', requireAuth, requireRole('agricare'), async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    
    // Mock data for AgriCare stats - in real app, would have AgriCare-specific models
    const farmers = await User.countDocuments({ role: 'farmer' });
    
    // Mock AgriCare products and orders
    const products = 3; // Soil Test Kit, Organic Fertilizer, Pest Control Spray
    const orders = 3; // Recent orders
    const revenue = 6794; // Total from orders
    
    res.json({
      products,
      orders,
      farmers,
      revenue
    });
  } catch (error) {
    console.error('Get agricare stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create AgriCare product
router.post('/products', requireAuth, requireRole('agricare'), upload.single('image'), async (req, res) => {
  try {
    const { name, type, price, stock, grade, description, image } = req.body;
    if (!name || price == null || stock == null) {
      return res.status(400).json({ message: 'name, price, stock are required' });
    }
    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (isNaN(priceNum) || priceNum <= 0) return res.status(400).json({ message: 'Price must be > 0' });
    if (!Number.isInteger(stockNum) || stockNum < 1) return res.status(400).json({ message: 'Stock must be integer >= 1' });

    let imageUrl;
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else if (image) {
      imageUrl = String(image).trim();
    }

    const product = await Product.create({
      user: req.user._id,
      name: name.trim(),
      type: type?.trim(),
      price: priceNum,
      stock: stockNum,
      grade: grade || 'Premium',
      image: imageUrl,
      description: description?.trim(),
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create agricare product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// List current AgriCare user's products
router.get('/products', requireAuth, requireRole('agricare'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;
    const query = { user: req.user._id };
    if (search) query.name = { $regex: new RegExp(search, 'i') };

    const [items, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(parseInt(skip)).limit(parseInt(limit)),
      Product.countDocuments(query)
    ]);

    res.json({ items, total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get agricare products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Catalog for farmers: list all products created by AgriCare users
router.get('/catalog', requireAuth, requireRole('farmer'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;
    const { default: User } = await import('../models/User.js');
    const agricareUsers = await User.find({ role: 'agricare' }).select('_id');
    const agricareIds = agricareUsers.map(u => u._id);

    const query = { user: { $in: agricareIds } };
    if (search) query.name = { $regex: new RegExp(search, 'i') };

    const [items, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(parseInt(skip)).limit(parseInt(limit)),
      Product.countDocuments(query)
    ]);

    res.json({ items, total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get agricare catalog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get agricare orders
router.get('/orders', requireAuth, requireRole('agricare'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    // Mock AgriCare orders - in real app, would filter actual orders for AgriCare products
    const mockOrders = [
      { id: "O-8901", date: "2025-05-08", status: "Processing", total: 3496, items: 4 },
      { id: "O-8892", date: "2025-05-07", status: "Shipped", total: 1299, items: 1 },
      { id: "O-8871", date: "2025-05-05", status: "Delivered", total: 1999, items: 2 },
    ];
    
    let filteredOrders = mockOrders;
    if (status && status !== 'All') {
      filteredOrders = mockOrders.filter(o => o.status === status);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    
    res.json({
      items: paginatedOrders,
      total: filteredOrders.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(filteredOrders.length / limit)
    });
  } catch (error) {
    console.error('Get agricare orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get agricare farmers (farmer clients)
router.get('/farmers', requireAuth, requireRole('agricare'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Mock farmer clients - in real app, would have relationship model
    const mockFarmers = [
      { id: "F-201", name: "Rahul N", location: "Idukki, KL", joined: "2024-10-12" },
      { id: "F-214", name: "Meera V", location: "Kumily, KL", joined: "2024-11-28" },
      { id: "F-225", name: "Jijo P", location: "Munnar, KL", joined: "2025-01-15" },
    ];
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedFarmers = mockFarmers.slice(startIndex, endIndex);
    
    res.json({
      items: paginatedFarmers,
      total: mockFarmers.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(mockFarmers.length / limit)
    });
  } catch (error) {
    console.error('Get agricare farmers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;