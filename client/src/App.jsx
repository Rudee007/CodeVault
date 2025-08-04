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

export default function App() {
  const [themeDark, setThemeDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== "light";
  });

  const toggleTheme = () => {
    setThemeDark((prev) => {
      const t = !prev;
      localStorage.setItem("theme", t ? "dark" : "light");
      return t;
    });
  };

  // Toast and auth state management here...
  // For simplicity, below basic example of showToast and login state.
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [toastError, setToastError] = React.useState(false);

  const showToast = (message, error = false) => {
    setToastMessage(message);
    setToastError(error);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const handleLogout = () => {
    showToast("Logged out");
    // Add your log out logic here
  };

  const isLoggedIn = true; // Replace with real auth state
  const userName = "DevUser";

  return (
    <Router>
      {/* Navbar rendered here globally */}
      <Navbar
        isLoggedIn={isLoggedIn}
        userName={userName}
        themeDark={themeDark}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      {/* All route pages rendered below */}
      <Routes>
        <Route path="/" element={<Home showToast={showToast} />} />
        <Route path="/login" element={<Login showToast={showToast} />} />
        <Route path="/signup" element={<Signup showToast={showToast} />} />
        <Route path="/forgot-password" element={<ForgotPassword showToast={showToast} />} />
        <Route path="/dashboard" element={<Dashboard showToast={showToast} />} />
        <Route path="/profile" element={<Profile showToast={showToast} />} />
        <Route path="/snippet/:id" element={<SnippetManagement showToast={showToast} />} />
        <Route path="/share/:shareId" element={<ShareSnippet showToast={showToast} />} />
        <Route path="/analytics" element={<Analytics showToast={showToast} />} />
      </Routes>

      {/* Your Toast component also goes here for global notifications */}
      {/* Example: <Toast visible={toastVisible} message={toastMessage} error={toastError} /> */}
    </Router>
  );
}
