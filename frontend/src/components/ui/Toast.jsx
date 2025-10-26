import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import '../../css/theme-modern.css';

const ToastCtx = createContext({ notify: () => {} });

export function useToast() {
  return useContext(ToastCtx);
}

// Simple animated toast system
export default function ToastProvider({ children }) {
  const [items, setItems] = useState([]); // { id, type, text }
  const idRef = useRef(1);

  const remove = useCallback((id) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback((text, type = 'success', ms = 2800) => {
    const id = idRef.current++;
    setItems((list) => [...list, { id, type, text }]);
    // Auto remove
    setTimeout(() => remove(id), ms);
  }, [remove]);

  const ctx = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastCtx.Provider value={ctx}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {items.map((t) => (
          <div key={t.id} className={`toast-item ${t.type}`}>
            <div className="toast-icon">{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</div>
            <div className="toast-text">{t.text}</div>
            <button className="toast-close" onClick={() => remove(t.id)}>×</button>
          </div>
        ))}
      </div>
      <style>{`
        .toast-stack { position: fixed; top: 16px; right: 16px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
        .toast-item { display:flex; align-items:center; gap:10px; background:#111827; color:white; padding:10px 12px; border-radius:10px; box-shadow:0 6px 24px rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.08); animation: toastSlideIn 280ms cubic-bezier(.21,1.02,.73,1); }
        .toast-item.success { border-color:#10B98133; }
        .toast-item.error { border-color:#EF444433; }
        .toast-item.info { border-color:#3B82F633; }
        .toast-icon { font-size:18px; }
        .toast-text { font-size:14px; line-height:1.2; max-width: 320px; }
        .toast-close { background:transparent; color:#fff; border:0; font-size:18px; line-height:1; cursor:pointer; opacity:.6; }
        .toast-close:hover { opacity:1; }
        @keyframes toastSlideIn { from { opacity:0; transform: translateY(-8px) scale(.98); } to { opacity:1; transform: translateY(0) scale(1); } }
      `}</style>
    </ToastCtx.Provider>
  );
}