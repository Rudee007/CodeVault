// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SnippetManagement from "./pages/SnippetManagement";
import ShareSnippet from "./pages/ShareSnippet";
import Analytics from "./pages/Analytics";
import VerifyPage from "./pages/VerifyPage";

export default function App() {
  const [themeDark, setThemeDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true; // default to dark if nothing saved
  });

  const toggleTheme = () => {
    setThemeDark((prev) => {
      const t = !prev;
      localStorage.setItem("theme", t ? "dark" : "light");
      return t;
    });
  };

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  const showToast = (message, error = false) => {
    setToastMessage(message);
    setToastError(error);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  // Check for existing token/user on load
  useEffect(() => {
    const token = localStorage.getItem("cv_token");
    const storedName = localStorage.getItem("cv_user");
    if (token) {
      setIsLoggedIn(true);
      if (storedName) setUserName(storedName);
    }
  }, []);

  const handleLoginSuccess = (token, name) => {
    localStorage.setItem("cv_token", token);
    localStorage.setItem("cv_user", name);
    setIsLoggedIn(true);
    setUserName(name);
    showToast(`Welcome, ${name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem("cv_token");
    localStorage.removeItem("cv_user");
    setIsLoggedIn(false);
    setUserName("");
    showToast("Logged out successfully");
  };

  // Sync theme to body
  useEffect(() => {
    document.body.className = themeDark ? "dark-theme" : "light-theme";
  }, [themeDark]);

  return (
    <Router>
      <Navbar
        isLoggedIn={isLoggedIn}
        userName={userName}
        themeDark={themeDark}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <Routes>
        <Route path="/" element={<Home showToast={showToast} />} />
        <Route
          path="/login"
          element={<Login showToast={showToast} onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/signup"
          element={<Signup showToast={showToast} onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/forgot-password" element={<ForgotPassword showToast={showToast} />} />
        <Route path="/dashboard" element={<Dashboard showToast={showToast} />} />
        <Route path="/profile" element={<Profile showToast={showToast} />} />
        <Route path="/snippet/:id" element={<SnippetManagement showToast={showToast} />} />
        <Route path="/share/:shareId" element={<ShareSnippet showToast={showToast} />} />
        <Route path="/analytics" element={<Analytics showToast={showToast} />} />
        <Route path="/verify" element={<VerifyPage onLoginSuccess={handleLoginSuccess} />} />
      </Routes>

      {toastVisible && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 transition-opacity ${
            toastError ? "bg-red-500" : "bg-green-500"
          }`}
          role="alert"
          aria-live="polite"
        >
          {toastMessage}
        </div>
      )}
    </Router>
  );
}
