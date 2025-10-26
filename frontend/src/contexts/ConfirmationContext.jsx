import React, { createContext, useContext, useState } from 'react';
import ConfirmationModal from '../components/modals/ConfirmationModal';

const ConfirmationContext = createContext();

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }
  return context;
};

export const ConfirmationProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning',
    icon: '⚠️',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showConfirmation = ({
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "warning",
    icon = "⚠️",
    onConfirm = () => {},
    onCancel = () => {}
  }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        icon,
        onConfirm: () => {
          onConfirm();
          resolve(true);
        },
        onCancel: () => {
          onCancel();
          resolve(false);
        }
      });
    });
  };

  const hideConfirmation = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    modalState.onConfirm();
    hideConfirmation();
  };

  const handleCancel = () => {
    modalState.onCancel();
    hideConfirmation();
  };

  const value = {
    showConfirmation
  };

  return (
    <ConfirmationContext.Provider value={value}>
      {children}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        type={modalState.type}
        icon={modalState.icon}
        onConfirm={handleConfirm}
        onClose={handleCancel}
      />
    </ConfirmationContext.Provider>
  );
};
