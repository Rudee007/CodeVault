import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import feather from "feather-icons";

export default function Navbar() {
  const [themeDark, setThemeDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== "light"; // default dark mode
  });
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("token"))
  );
  const navigate = useNavigate();

  useEffect(() => {
    feather.replace();
    updateBodyTheme(themeDark);
  }, []);

  useEffect(() => {
    updateBodyTheme(themeDark);
  }, [themeDark]);

  function updateBodyTheme(isDark) {
    // You can keep same class toggling as Home.jsx's logic
    const darkClasses = [
      "bgGradientToBr",
      "fromColorDark1",
      "toColorDark2",
      "textWhite",
    ];
    const lightClasses = [
      "bgGradientToBr",
      "fromColorLight1",
      "toColorLight2",
      "textGray800",
    ];
    if (isDark) {
      document.body.classList.remove(...lightClasses);
      document.body.classList.add(...darkClasses);
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove(...darkClasses);
      document.body.classList.add(...lightClasses);
      localStorage.setItem("theme", "light");
    }
    setThemeDark(isDark);
  }

  function toggleTheme() {
    setThemeDark((dark) => !dark);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  }

  return (
    <header className="bg-white/5 backdrop-blur-xl sticky top-0 z-50 shadow shadow-indigo-950/10">
      <div className="container mx-auto flex justify-between items-center px-6 py-3">
        <Link to="/" className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-200 bg-clip-text text-transparent select-none">
          CodeVault
        </Link>
        <nav className="space-x-4 flex items-center">
          <Link to="/" className="hover:text-indigo-400 font-medium transition-colors" aria-current="page">
            Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-indigo-400 font-medium transition-colors">
                Dashboard
              </Link>
              <Link to="/profile" className="hover:text-indigo-400 font-medium transition-colors">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="ml-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition font-medium text-indigo-300"
                aria-label="Logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-400 font-medium transition-colors">
                Login
              </Link>
              <Link to="/signup" className="hover:text-indigo-400 font-medium transition-colors">
                Sign Up
              </Link>
            </>
          )}

          <button
            id="mode-toggle"
            className="ml-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            aria-label="Toggle Dark Mode"
            onClick={toggleTheme}
            type="button"
          >
            <i data-feather={themeDark ? "sun" : "moon"}></i>
          </button>
        </nav>
      </div>
    </header>
  );
}
