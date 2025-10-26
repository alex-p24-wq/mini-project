import express from 'express';
import Feedback from '../models/Feedback.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Health check for feedback routes
router.get('/health', (_req, res) => res.json({ message: 'Feedback routes working' }));

// List current user's feedback (optional helper for clarity/testing)
router.get('/', requireAuth, async (req, res) => {
  try {
    const items = await Feedback.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    console.error('List my feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit feedback (any authenticated user)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { subject, message, rating = 5, category = 'General' } = req.body;
    if (!subject || !message) return res.status(400).json({ message: 'subject and message are required' });
    const fb = await Feedback.create({
      user: req.user._id,
      role: req.user.role,
      subject: String(subject).trim(),
      message: String(message).trim(),
      rating: Math.max(1, Math.min(5, Number(rating) || 5)),
      category: String(category || 'General').trim() || 'General'
    });
    res.status(201).json({ message: 'Feedback submitted', feedback: fb });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;