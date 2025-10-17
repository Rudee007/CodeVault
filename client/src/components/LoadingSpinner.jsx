// src/components/LoadingSpinner.jsx
import React from "react";

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-cyan-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-indigo-300 font-medium">{message}</div>
      </div>
    </div>
  );
}
