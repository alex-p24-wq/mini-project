import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useConfirmation } from '../contexts/ConfirmationContext';

/**
 * Custom hook to block browser back/forward navigation from protected pages
 * Shows custom confirmation dialog when user tries to navigate away
 * Does not block page refresh/close to avoid unwanted browser dialogs
 */
export function useNavigationBlock(isEnabled = true) {
  const navigate = useNavigate();
  const location = useLocation();
  const { showConfirmation } = useConfirmation();

  const showLogoutConfirmation = useCallback(async () => {
    const confirmed = await showConfirmation({
      title: "Are you sure you want to logout?",
      message: "You must logout to leave the dashboard. All unsaved changes will be lost.",
      confirmText: "Yes, Logout",
      cancelText: "Stay Here",
      type: "warning",
      icon: "🚪",
      onConfirm: () => {
        // User confirmed - redirect to logout
        window.dispatchEvent(new CustomEvent('forceLogout'));
      }
    });
    return confirmed;
  }, [showConfirmation]);

  // Removed blockNavigation function as it's no longer needed without beforeunload

  useEffect(() => {
    if (!isEnabled) return;

    // Block browser back/forward navigation
    const handlePopState = (event) => {
      // Push current state back to prevent navigation
      window.history.pushState(null, '', location.pathname);
      
      // Show custom confirmation
      showLogoutConfirmation();
    };

    // Add event listeners (removed beforeunload to prevent unwanted "Leave site?" dialog)
    window.addEventListener('popstate', handlePopState);

    // Push current state to history to enable popstate detection
    window.history.pushState(null, '', location.pathname);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isEnabled, location.pathname, showLogoutConfirmation]);

  // Hook doesn't need to return anything - it handles navigation blocking internally
}
