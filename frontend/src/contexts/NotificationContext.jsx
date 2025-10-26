import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead as markAsReadAPI, markAllNotificationsAsRead as markAllAsReadAPI } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backendNotifications, setBackendNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      type: 'info',
      icon: '🔔',
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto-remove after 10 seconds if it's a temporary notification
    if (notification.autoRemove !== false) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 10000);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Fetch notifications from backend
  const fetchBackendNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setLoading(true);
      const data = await getNotifications({ limit: 50 });
      
      // Transform backend notifications to match frontend format
      const transformedNotifications = data.notifications.map(notif => ({
        id: notif._id,
        title: notif.title,
        message: notif.message,
        type: getNotificationType(notif.type),
        timestamp: new Date(notif.createdAt),
        read: notif.read,
        icon: notif.icon,
        data: notif.data,
        isBackend: true
      }));
      
      setBackendNotifications(transformedNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Transform backend notification types to frontend types
  const getNotificationType = (backendType) => {
    switch (backendType) {
      case 'product_sold':
      case 'payment_received':
      case 'order_placed':
        return 'success';
      case 'order_cancelled':
      case 'stock_low':
        return 'warning';
      default:
        return 'info';
    }
  };

  // Mark backend notification as read
  const markBackendNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await markAsReadAPI(notificationId);
      setBackendNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all backend notifications as read
  const markAllBackendNotificationsAsRead = useCallback(async () => {
    try {
      await markAllAsReadAPI();
      setBackendNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchBackendNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchBackendNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [fetchBackendNotifications]);

  // Combine frontend and backend notifications
  const allNotifications = [...notifications, ...backendNotifications].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const unreadCount = allNotifications.filter(notif => !notif.read).length;

  // Enhanced markAsRead to handle both frontend and backend notifications
  const enhancedMarkAsRead = useCallback((id) => {
    const notification = allNotifications.find(notif => notif.id === id);
    if (notification?.isBackend) {
      markBackendNotificationAsRead(id);
    } else {
      markAsRead(id);
    }
  }, [allNotifications, markBackendNotificationAsRead, markAsRead]);

  // Enhanced markAllAsRead to handle both frontend and backend notifications
  const enhancedMarkAllAsRead = useCallback(() => {
    markAllAsRead();
    markAllBackendNotificationsAsRead();
  }, [markAllAsRead, markAllBackendNotificationsAsRead]);

  const value = {
    notifications: allNotifications,
    unreadCount,
    loading,
    addNotification,
    removeNotification,
    markAsRead: enhancedMarkAsRead,
    markAllAsRead: enhancedMarkAllAsRead,
    clearAllNotifications,
    fetchBackendNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
