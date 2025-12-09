// hooks/useAuth.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3003";

export const useAuth = () => {
  const navigate = useNavigate();

  // ✅ Unified login handler
  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ Store token and user
      storeAuthData(data.token, data.user);
      return data;
    } catch (error) {
      console.error("Manual login error:", error);
      throw error;
    }
  }, []);

  // ✅ Unified Google login handler
  const loginWithGoogle = useCallback(async (credential) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Google login failed");
      }

      // ✅ Store token and user (SAME as manual login)
      storeAuthData(data.token, data.user);
      return data;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  }, []);

  // ✅ Centralized storage logic
  const storeAuthData = (token, user) => {
    console.log('💾 Storing auth data...');
    
    if (token) {
      localStorage.setItem("token", token);
      console.log('✅ Token stored:', token.substring(0, 30) + '...');
    }

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      console.log('✅ User stored:', user.name || user.email);
    }

    // Also store auth state
    localStorage.setItem("isLoggedIn", "true");
  };

  // ✅ Logout
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  }, [navigate]);

  // ✅ Get current token
  const getToken = () => localStorage.getItem("token");

  // ✅ Get current user
  const getUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  };

  // ✅ Check if logged in
  const isLoggedIn = () => !!localStorage.getItem("token");

  return {
    login,
    loginWithGoogle,
    logout,
    getToken,
    getUser,
    isLoggedIn,
    storeAuthData
  };
};
