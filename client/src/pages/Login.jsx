import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import Navbar from "../components/Navbar";

export default function Login({ showToast }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [themeDark, setThemeDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== "light"; // default dark
  });

  // Theme toggle handler (local only here, real global toggle in App.jsx)
  const toggleTheme = () => {
    setThemeDark(dark => {
      const newTheme = !dark;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  useEffect(() => {
    AOS.init({ once: true });
    feather.replace();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple validation
    if (!email.trim() || !password.trim()) {
      showToast("Please enter email and password", true);
      return;
    }

    // Simulate login API call
    if (email === "demo@codevault.com" && password === "password123") {
      showToast("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } else {
      showToast("Invalid email or password", true);
    }
  };

  return (
    <>
      <Navbar 
        isLoggedIn={false} 
        themeDark={themeDark} 
        toggleTheme={toggleTheme} 
        onLogout={() => {}} 
      />

      <main className={`min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-br from-indigo-900 to-cyan-900 ${themeDark ? "text-white" : "text-gray-900"}`}>
        <section
          className="bg-[#1a1d27] rounded-2xl shadow-lg max-w-md w-full p-8"
          data-aos="zoom-in"
          aria-label="Login Form"
        >
          <h2 className="text-3xl font-extrabold text-indigo-300 mb-6 text-center">Login to CodeVault</h2>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="relative">
              <input
                type="email"
                id="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md bg-white/10 px-4 py-3 pl-12 placeholder-gray-400 focus:outline-indigo-400 focus:ring-2 focus:ring-indigo-500 transition text-white"
                aria-describedby="emailHelp"
              />
              <span className="absolute left-4 top-3.5 text-indigo-400 pointer-events-none">
                <i data-feather="mail"></i>
              </span>
            </div>

            <div className="relative">
              <input
                type="password"
                id="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-white/10 px-4 py-3 pl-12 placeholder-gray-400 focus:outline-indigo-400 focus:ring-2 focus:ring-indigo-500 transition text-white"
                aria-describedby="passwordHelp"
              />
              <span className="absolute left-4 top-3.5 text-indigo-400 pointer-events-none">
                <i data-feather="lock"></i>
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white px-5 py-3 rounded-lg font-semibold hover:scale-105 transition"
              aria-label="Login"
            >
              Login
            </button>

            <div className="text-center text-indigo-300 font-medium space-x-2 text-sm">
              <span>Don't have an account?</span>
              <Link to="/signup" className="hover:text-indigo-400 transition">
                Sign up
              </Link>
            </div>

            <div className="text-center text-indigo-300 font-medium text-sm">
              <Link to="/forgot-password" className="hover:text-indigo-400 transition">
                Forgot Password?
              </Link>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
