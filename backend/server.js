import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const app = express();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-app.vercel.app'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-App-Check']
};
app.use(cors(corsOptions));
// Handle CORS preflight for all routes
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
import authRoutes from "./routes/auth.js";
import farmerRoutes from "./routes/farmer.js";
import customerRoutes from "./routes/customer.js";
import agriCareRoutes from "./routes/agricare.js";
import hubManagerRoutes from "./routes/hubmanager.js";
import adminRoutes from "./routes/admin.js";
import feedbackRoutes from "./routes/feedback.js";
import paymentRoutes from "./routes/payment.js";
import notificationRoutes from "./routes/notifications.js";
import hubRoutes from "./routes/hub.js";
import orderRequestRoutes from "./routes/orderRequest.js";
import Feedback from "./models/Feedback.js";
import { verifyEmailConfig } from "./utils/emailService.js";

app.use("/api/auth", authRoutes);
app.use("/api/farmer", farmerRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/agricare", agriCareRoutes);
app.use("/api/hubmanager", hubManagerRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/hubs", hubRoutes);
app.use("/api/order-requests", orderRequestRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection and server startup
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Start server with automatic port fallback if port is busy
    const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;

    const startListening = (port, attempt = 0) => {
      const server = app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
        console.log(`📧 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🖼️ Serving uploads at /uploads`);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && attempt < 5) {
          const nextPort = port + 1;
          console.warn(`⚠️ Port ${port} in use. Trying ${nextPort}...`);
          startListening(nextPort, attempt + 1);
        } else {
          console.error('❌ Failed to start server:', err);
          process.exit(1);
        }
      });
    };

    // Ensure indexes for Feedback and OrderRequest are created
    try {
      await Feedback.init();
      console.log('✅ Feedback indexes ensured');
    } catch (e) {
      console.warn('⚠️ Could not ensure Feedback indexes:', e?.message || e);
    }

    try {
      const OrderRequest = (await import('./models/OrderRequest.js')).default;
      await OrderRequest.init();
      console.log('✅ OrderRequest indexes ensured');
    } catch (e) {
      console.warn('⚠️ Could not ensure OrderRequest indexes:', e?.message || e);
    }

    // Verify email configuration
    try {
      await verifyEmailConfig();
    } catch (e) {
      console.warn('⚠️ Email service verification failed:', e?.message || e);
    }

    startListening(DEFAULT_PORT);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
