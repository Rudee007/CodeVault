// src/pages/ForgotPassword.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import Navbar from "../components/Navbar";

export default function ForgotPassword({ showToast }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [themeDark, setThemeDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== "light";
  });

  // Theme toggle handler (local)
  const toggleTheme = () => {
    setThemeDark((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  useEffect(() => {
    AOS.init({ once: true });
    feather.replace();
  }, []);

  const validateEmail = (email) => {
    // Simple regex for demonstration
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      showToast("Please enter your email address.", true);
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      showToast("Invalid email address.", true);
      return;
    }
    setError("");

    // Simulate a password reset request
    showToast("If your email exists, you will receive a reset link soon.");
    setTimeout(() => {
      navigate("/login");
    }, 2500);
  };

  return (
    <>
     

      <main
        className={`min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-br from-indigo-900 to-cyan-900 ${
          themeDark ? "text-white" : "text-gray-900"
        }`}
      >
        <section
          className="bg-[#1a1d27] rounded-2xl shadow-lg max-w-md w-full p-8"
          data-aos="zoom-in"
          aria-label="Forgot Password Form"
        >
          <h2 className="text-3xl font-extrabold text-indigo-300 mb-6 text-center">
            Forgot your password?
          </h2>
          <p className="text-gray-300 mb-6 text-center text-sm">
            Enter your email to receive a password reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className={`w-full rounded-md bg-white/10 px-4 py-3 pl-12 placeholder-gray-400 focus:outline-indigo-400 focus:ring-2 focus:ring-indigo-500 transition ${
                  error ? "border-red-500 border" : "border-transparent"
                } text-white`}
                aria-invalid={!!error}
                aria-describedby="email-error"
              />
              <span className="absolute left-4 top-3.5 text-indigo-400 pointer-events-none">
                <i data-feather="mail"></i>
              </span>
              {error && (
                <p
                  className="text-red-400 text-xs mt-1 absolute left-0 bottom-[-20px]"
                  id="email-error"
                >
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white px-5 py-3 rounded-lg font-semibold hover:scale-105 transition"
              aria-label="Send Reset Email"
            >
              Send Reset Link
            </button>

            <div className="text-center text-indigo-300 font-medium text-sm mt-4">
              <Link to="/login" className="hover:text-indigo-400 transition">
                &larr; Back to Login
              </Link>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
