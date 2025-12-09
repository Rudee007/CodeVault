// components/PrivateSnippetsModal.jsx
import React, { useState } from "react";
import feather from "feather-icons";
import { useAuth } from "../hooks/useAuth";
import PrivateSnippetsContent from "./PrivateSnippetsContent";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3003";

export default function PrivateSnippetsModal({ onClose }) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const token = getToken();

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log('🔐 Password verification started...');
      
      if (!token) {
        console.error('❌ No token found');
        setError("You need to be logged in to access this vault");
        setLoading(false);
        return;
      }

      console.log('🔑 Token found:', token.substring(0, 30) + '...');
      console.log('📤 Sending password verification request...');

      const response = await fetch(
        `${API_BASE_URL}/api/auth/verify-vault-password`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      console.log('📊 Response status:', response.status);
      console.log('📄 Response type:', response.headers.get('content-type'));

      const data = await response.json();
      
      console.log('📦 Response data:', data);

      if (!response.ok) {
        console.error('❌ Verification failed:', data.error);
        setError(data.error || "Failed to verify password");
        setLoading(false);
        return;
      }

      if (data.authenticated) {
        console.log('✅ Password verified! Authenticating...');
        setIsAuthenticated(true);
        setPassword("");
        console.log('✅ State updated, should render PrivateSnippetsContent now');
      } else {
        console.error('❌ Password authentication returned false');
        setError("Password verification failed");
      }
    } catch (err) {
      console.error("❌ Verify password error:", err);
      console.error("Error details:", err.message);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="bg-[#151826] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-indigo-900/30 flex justify-between items-center bg-[#151826] z-10">
          <div>
            <h2 className="text-3xl font-bold text-indigo-300">
              Private Snippets
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Your secure code vault
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <i data-feather="x" className="w-6 h-6"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isAuthenticated ? (
            <PasswordGate
              onSubmit={handlePasswordSubmit}
              password={password}
              setPassword={setPassword}
              error={error}
              loading={loading}
            />
          ) : (
            <>
              {console.log('🎉 Rendering PrivateSnippetsContent')}
              <PrivateSnippetsContent onClose={onClose} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordGate({ onSubmit, password, setPassword, error, loading }) {
  return (
    <div className="max-w-md mx-auto py-12 text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <i data-feather="lock" className="w-8 h-8 text-indigo-400"></i>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Enter Your Password
        </h3>
        <p className="text-gray-400">
          Enter the same password you use to login
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your login password"
          className="w-full px-4 py-3 bg-white/10 border border-indigo-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition"
          autoFocus
          disabled={loading}
        />

        {error && (
          <div className="text-red-400 text-sm flex items-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <i data-feather="alert-circle" className="w-4 h-4 flex-shrink-0"></i>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!password.trim() || loading}
          className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-3 rounded-lg font-semibold text-white hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <i data-feather="loader" className="w-4 h-4 animate-spin"></i>
              Verifying...
            </>
          ) : (
            <>
              <i data-feather="unlock" className="w-4 h-4"></i>
              Unlock Vault
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-6">
        This is the same password you used when signing up
      </p>
    </div>
  );
}
