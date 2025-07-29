import React, { useEffect } from "react";

export default function Toast({ message, show, onClose, type = "info" }) {
  // Auto close toast after 3 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const bgColors = {
    info: "bg-indigo-600",
    success: "bg-green-600",
    error: "bg-red-600",
  };
  const bgColor = bgColors[type] || bgColors.info;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-10 right-10 max-w-sm rounded-lg px-4 py-3 text-white shadow-lg shadow-black/50 animate-fadein ${bgColor} z-[10000]`}
    >
      {message}
    </div>
  );
}
