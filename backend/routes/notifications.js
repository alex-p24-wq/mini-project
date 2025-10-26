import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../utils/notifications.js';

const router = express.Router();

// Get user notifications
router.get('/', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const result = await getUserNotifications(req.user._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true'
    });
    
    res.json(result);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to get notifications' });
  }
});

// Get unread count
router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const result = await getUserNotifications(req.user._id, { limit: 1 });
    res.json({ unreadCount: result.unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
});

// Mark notification as read
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const notification = await markNotificationAsRead(req.params.id, req.user._id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', requireAuth, async (req, res) => {
  try {
    const result = await markAllNotificationsAsRead(req.user._id);
    res.json({ 
      message: 'All notifications marked as read', 
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

export default router;
