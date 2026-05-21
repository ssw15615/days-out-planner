import { useState, useCallback } from 'react';

let _addToast = null;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  _addToast = useCallback((msg, type = '') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  return (
    <>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </>
  );
}

export function toast(msg, type = '') {
  if (_addToast) _addToast(msg, type);
}
