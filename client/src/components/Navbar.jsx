import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import feather from "feather-icons";
import PrivateSnippetsModal from "./PrivateSnippetsModal";

export default function Navbar({ isLoggedIn = false, userName = "", onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    feather.replace();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className="bg-[#1a1d27] backdrop-blur-xl sticky top-0 z-50 shadow shadow-indigo-950/10"
        role="banner"
      >
        <div className="container mx-auto flex justify-between items-center px-6 py-3 max-w-7xl">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-200 bg-clip-text text-transparent select-none"
            aria-label="Go to CodeVault homepage"
          >
            CodeVault
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex space-x-6 items-center"
            aria-label="Primary navigation"
          >
            <NavLink to="/" label="Home" currentPath={location.pathname} />

            {isLoggedIn && (
              <>
                <NavLink
                  to="/dashboard"
                  label="Dashboard"
                  currentPath={location.pathname}
                />
                <NavLink
                  to="/analytics"
                  label="Analytics"
                  currentPath={location.pathname}
                />
                <NavLink
                  to="/profile"
                  label="Profile"
                  currentPath={location.pathname}
                />
                {/* Private Snippets Modal Trigger */}
                <button
                  onClick={() => setShowPrivateModal(true)}
                  className="font-medium text-gray-300 hover:text-indigo-400 transition-colors"
                >
                  Private Snippets
                </button>
                <NavLink
                  to="/snippet/new"
                  label="Add Snippet"
                  currentPath={location.pathname}
                />
              </>
            )}

            {!isLoggedIn ? (
              <>
                <NavLink
                  to="/login"
                  label="Login"
                  currentPath={location.pathname}
                />
                <NavLink
                  to="/signup"
                  label="Signup"
                  currentPath={location.pathname}
                />
                <NavLink
                  to="/forgot-password"
                  label="Forgot Password"
                  currentPath={location.pathname}
                />
              </>
            ) : (
              <>
                <span className="text-indigo-300 font-semibold select-none">
                  {userName}
                </span>
                <button
                  onClick={onLogout}
                  className="ml-3 rounded-lg bg-pink-500 px-4 py-2 font-semibold text-white hover:bg-pink-600 transition"
                  type="button"
                >
                  Logout
                </button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden ml-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <i data-feather={menuOpen ? "x" : "menu"}></i>
          </button>
        </div>

        {/* Mobile navigation */}
        {menuOpen && (
          <nav
            className="md:hidden bg-[#1a1d27] bg-opacity-90 backdrop-blur-lg px-6 py-4 space-y-4"
            aria-label="Mobile primary navigation"
          >
            <NavLink
              to="/"
              label="Home"
              currentPath={location.pathname}
              mobile
            />

            {isLoggedIn && (
              <>
                <NavLink
                  to="/dashboard"
                  label="Dashboard"
                  currentPath={location.pathname}
                  mobile
                />
                <NavLink
                  to="/analytics"
                  label="Analytics"
                  currentPath={location.pathname}
                  mobile
                />
                <NavLink
                  to="/profile"
                  label="Profile"
                  currentPath={location.pathname}
                  mobile
                />
                <button
                  onClick={() => {
                    setShowPrivateModal(true);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left font-medium text-gray-300 hover:text-indigo-400 transition-colors py-2"
                >
                  Private Snippets
                </button>
                <NavLink
                  to="/snippet/new"
                  label="Add Snippet"
                  currentPath={location.pathname}
                  mobile
                />
              </>
            )}

            {!isLoggedIn ? (
              <>
                <NavLink
                  to="/login"
                  label="Login"
                  currentPath={location.pathname}
                  mobile
                />
                <NavLink
                  to="/signup"
                  label="Signup"
                  currentPath={location.pathname}
                  mobile
                />
                <NavLink
                  to="/forgot-password"
                  label="Forgot Password"
                  currentPath={location.pathname}
                  mobile
                />
              </>
            ) : (
              <>
                <span className="block text-indigo-300 font-semibold text-center">
                  {userName}
                </span>
                <button
                  onClick={onLogout}
                  className="w-full rounded-lg bg-pink-500 px-4 py-2 font-semibold text-white hover:bg-pink-600 transition"
                  type="button"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        )}
      </header>

      {/* Private Snippets Modal */}
      {showPrivateModal && (
        <PrivateSnippetsModal onClose={() => setShowPrivateModal(false)} />
      )}
    </>
  );
}

function NavLink({ to, label, currentPath, mobile }) {
  const isActive = currentPath === to;

  return (
    <Link
      to={to}
      className={`font-medium transition-colors ${
        isActive
          ? "text-indigo-400 font-semibold"
          : "text-gray-300 hover:text-indigo-400"
      } ${mobile ? "block text-lg" : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </Link>
  );
}
