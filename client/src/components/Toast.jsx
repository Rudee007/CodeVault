// src/components/Toast.jsx

import React, { useEffect, useState } from "react";
import clsx from "clsx";

export default function Toast({ visible, message, error = false, duration = 2500 }) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [visible, duration]);

  return (
    <div
      aria-live="polite"
      role="status"
      className={clsx(
        "fixed bottom-[90px] right-8 px-4 py-2 rounded-lg shadow-lg transition-opacity z-[1001]",
        {
          "opacity-100 pointer-events-auto": show,
          "opacity-0 pointer-events-none": !show,
          "bg-indigo-700/90 text-white": !error,
          "bg-red-600/90 text-white": error,
        }
      )}
      style={{ transition: "opacity 0.3s ease-in-out" }}
    >
      {message}
    </div>
  );
}
