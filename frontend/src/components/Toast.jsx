import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message, duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  const success = (title, message) => addToast('success', title, message);
  const error = (title, message) => addToast('error', title, message);
  const info = (title, message) => addToast('info', title, message);

  const icons = {
    success: <CheckCircle size={22} style={{ color: 'var(--success)' }} />,
    error: <AlertCircle size={22} style={{ color: 'var(--danger)' }} />,
    info: <Info size={22} style={{ color: 'var(--primary)' }} />,
  };

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exit' : ''}`}>
            <div className="toast-icon">{icons[toast.type]}</div>
            <div className="toast-body">
              <div className="toast-title">{toast.title}</div>
              {toast.message && <div className="toast-message">{toast.message}</div>}
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
