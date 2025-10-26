import React, { useEffect } from 'react';
import './ConfirmationModal.css';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // warning, danger, info, success
  icon = "⚠️"
}) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  const getModalTypeClass = () => {
    switch (type) {
      case 'danger': return 'modal-danger';
      case 'success': return 'modal-success';
      case 'info': return 'modal-info';
      default: return 'modal-warning';
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className={`confirmation-modal ${getModalTypeClass()}`}>
        <div className="modal-header">
          <div className="modal-icon">
            {icon}
          </div>
          <h3 className="modal-title">{title}</h3>
        </div>
        
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-cancel" 
            onClick={onClose}
            autoFocus
          >
            {cancelText}
          </button>
          <button 
            className={`btn btn-confirm ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
