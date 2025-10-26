import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastNotification from './ToastNotification';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      position: 'top-right',
      ...toast
    };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Toast helper functions
  const showSuccess = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'success',
      title,
      message,
      icon: '🎉',
      ...options
    });
  }, [addToast]);

  const showError = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'error',
      title,
      message,
      icon: '❌',
      duration: 7000, // Longer duration for errors
      ...options
    });
  }, [addToast]);

  const showWarning = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'warning',
      title,
      message,
      icon: '⚠️',
      ...options
    });
  }, [addToast]);

  const showInfo = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'info',
      title,
      message,
      icon: 'ℹ️',
      ...options
    });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Container component to render toasts
const ToastContainer = ({ toasts, onRemoveToast }) => {
  // Group toasts by position
  const toastsByPosition = toasts.reduce((acc, toast) => {
    const position = toast.position || 'top-right';
    if (!acc[position]) acc[position] = [];
    acc[position].push(toast);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <div key={position} className={`toast-container-${position}`}>
          {positionToasts.map((toast) => (
            <ToastNotification
              key={toast.id}
              notification={toast}
              onClose={() => onRemoveToast(toast.id)}
              duration={toast.duration}
              position={position}
            />
          ))}
        </div>
      ))}
    </>
  );
};

export default ToastContainer;
