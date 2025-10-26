import React, { useEffect } from 'react';
import './ProductTypeModal.css';

export default function ProductTypeModal({
  isOpen,
  onClose,
  onSelectDomestic,
  onSelectBulk
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="product-type-modal">
        <div className="modal-header">
          <div className="modal-icon">
            🛒
          </div>
          <h3 className="modal-title">Choose Product Type</h3>
        </div>

        <div className="modal-body">
          <p className="modal-message">Select the type of product you want to add:</p>

          <div className="product-type-options">
            <button
              className="product-type-option domestic-option"
              onClick={onSelectDomestic}
            >
              <div className="option-icon">🏠</div>
              <div className="option-content">
                <h4>Domestic</h4>
                <p>Individual product for local market (1-20 kg)</p>
              </div>
            </button>

            <button
              className="product-type-option bulk-option"
              onClick={onSelectBulk}
            >
              <div className="option-icon">📦</div>
              <div className="option-content">
                <h4>Bulk</h4>
                <p>Large quantity for wholesale buyers</p>
              </div>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-cancel"
            onClick={onClose}
            autoFocus
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}