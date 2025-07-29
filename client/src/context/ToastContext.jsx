// src/context/ToastContext.jsx
import React, { createContext, useState, useCallback, useContext } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ message: "", type: "info", visible: false });

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={toast.message} show={toast.visible} type={toast.type} onClose={() => setToast((t) => ({ ...t, visible: false }))} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
