import React, { useEffect, useState } from 'react';
import './ToastNotification.css';

export default function ToastNotification({ 
  notification, 
  onClose, 
  duration = 5000,
  position = 'top-right' 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Show animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match CSS animation duration
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div 
      className={`toast-notification ${notification.type} ${position} ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''}`}
      style={{ '--type-color': getTypeColor(notification.type) }}
    >
      <div className="toast-content">
        <div className="toast-icon">
          {notification.icon || getTypeIcon(notification.type)}
        </div>
        <div className="toast-text">
          <div className="toast-title">{notification.title}</div>
          <div className="toast-message">{notification.message}</div>
        </div>
        <button className="toast-close" onClick={handleClose}>
          ×
        </button>
      </div>
      <div className="toast-progress">
        <div 
          className="toast-progress-bar" 
          style={{ animationDuration: `${duration}ms` }}
        ></div>
      </div>
    </div>
  );
}
