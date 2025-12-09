// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SnippetWizard from "./pages/SnippetWizard"; // ✅ NEW Wizard Component
import ShareSnippet from "./pages/ShareSnippet";
import Analytics from "./pages/Analytics";
import VerifyPage from "./pages/VerifyPage";
import AIAnalysisStep from "./components/AIAnalysisStep";
import SnippetView from './pages/SnippetView';
import Shares from './pages/Shares';
import PrivateSnippets from './pages/PrivateSnippets';
import ShareLinkPage from './pages/ShareLinkPage';

// Inner component so we can safely use useNavigate
function AppContent({ themeDark, toggleTheme }) {
  const navigate = useNavigate();

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);

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
    const storedId = localStorage.getItem("cv_userId");
    
    if (token) {
      setIsLoggedIn(true);
      if (storedName) setUserName(storedName);
      if (storedId) setUserId(storedId);
    }
  }, []);

  const handleLoginSuccess = (token, name, id) => {
    localStorage.setItem("cv_token", token);
    localStorage.setItem("cv_user", name);
    if (id) localStorage.setItem("cv_userId", id);
    
    setIsLoggedIn(true);
    setUserName(name);
    if (id) setUserId(id);
    
    showToast(`Welcome, ${name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem("cv_token");
    localStorage.removeItem("cv_user");
    localStorage.removeItem("cv_userId");
    
    setIsLoggedIn(false);
    setUserName("");
    setUserId(null);
    
    showToast("Logged out successfully");
    navigate("/");
  };

  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        userName={userName}
        themeDark={themeDark}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home showToast={showToast} />} />
        <Route path="/login" element={<Login showToast={showToast} onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={<Signup showToast={showToast} onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/forgot-password" element={<ForgotPassword showToast={showToast} />} />
        <Route path="/verify" element={<VerifyPage onLoginSuccess={handleLoginSuccess} showToast={showToast} />} />
        
        {/* Shared Routes */}
        {/* <Route path="/share/:shareId" element={<ShareSnippet showToast={showToast} />} /> */}
        <Route path="/share/:shareId" element={<ShareLinkPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<Dashboard showToast={showToast} isLoggedIn={isLoggedIn} />} />
        <Route path="/profile" element={<Profile showToast={showToast} isLoggedIn={isLoggedIn} />} />
        <Route path="/analytics" element={<Analytics showToast={showToast} isLoggedIn={isLoggedIn} />} />
        <Route path="/snippet/view/:id" element={<SnippetView showToast={showToast} />} />
        <Route path="/shares" element={<Shares showToast={showToast} />} />
        <Route path="/private-snippets" element={<PrivateSnippets showToast={showToast} />} />
        
        {/* ✅ Snippet Wizard - Handles both create (/snippet/new) and edit (/snippet/:id) */}
        <Route path="/snippet/:id" element={<SnippetWizard showToast={showToast} isLoggedIn={isLoggedIn} />} />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Toast Notification */}
      {toastVisible && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 transition-opacity animate-fadein ${
            toastError ? "bg-red-500" : "bg-green-500"
          }`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            {toastError ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {toastMessage}
          </div>
        </div>
      )}
    </>
  );
}

// 404 Not Found Component
function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-cyan-900 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-indigo-300 mb-8">Page not found</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-400 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-cyan-500 transition-all"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [themeDark, setThemeDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  const toggleTheme = () => {
    setThemeDark((prev) => {
      const t = !prev;
      localStorage.setItem("theme", t ? "dark" : "light");
      return t;
    });
  };

  useEffect(() => {
    document.body.className = themeDark ? "dark-theme" : "light-theme";
  }, [themeDark]);

  return (
    <Router>
      <AppContent themeDark={themeDark} toggleTheme={toggleTheme} />
    </Router>
  );
}
