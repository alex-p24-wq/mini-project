import React, { useState } from 'react';
import { googleSignIn } from '../../services/googleAuth';
import { useNavigate } from 'react-router-dom';

export default function GoogleButton({ label = 'Sign in with Google', className = '' }) {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const onClick = async () => {
    try {
      setBusy(true);
      await googleSignIn();
      // Redirect after login — adjust as needed
      const returnTo = sessionStorage.getItem('returnTo') || '/';
      sessionStorage.removeItem('returnTo');
      navigate(returnTo);
    } catch (e) {
      alert(e?.message || 'Google login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button onClick={onClick} className={`view-all-btn btn-pulse ${className}`} disabled={busy}>
      {busy ? 'Signing in...' : label}
    </button>
  );
}