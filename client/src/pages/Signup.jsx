import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import Navbar from "../components/Navbar";

export default function Signup({ showToast }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const [themeDark, setThemeDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== "light"; // default dark
  });

  // Theme toggle handler (local here)
  const toggleTheme = () => {
    setThemeDark((dark) => {
      const newTheme = !dark;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  useEffect(() => {
    AOS.init({ once: true });
    feather.replace();
  }, []);

  // Basic client-side validation
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim())
      newErrors.email = "Email is required";
    else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)
    )
      newErrors.email = "Invalid email address";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (!form.confirmPassword)
      newErrors.confirmPassword = "Please confirm password";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please fix form errors", true);
      return;
    }

    // Simulate signup API call
    showToast("Signup successful! Redirecting to login...");
    setTimeout(() => {
      navigate("/login");
    }, 2000);
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
          aria-label="Signup Form"
        >
          <h2 className="text-3xl font-extrabold text-indigo-300 mb-6 text-center">
            Create a CodeVault Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Name */}
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className={`w-full rounded-md bg-white/10 px-4 py-3 pl-12 placeholder-gray-400 focus:outline-indigo-400 focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.name ? "border-red-500 border" : "border-transparent"
                } text-white`}
                aria-invalid={!!errors.name}
                aria-describedby="name-error"
              />
              <span className="absolute left-4 top-3.5 text-indigo-400 pointer-events-none">
                <i data-feather="user"></i>
              </span>
              {errors.name && (
                <p
                  className="text-red-400 text-xs mt-1 absolute left-0 bottom-[-20px]"
                  id="name-error"
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className={`w-full rounded-md bg-white/10 px-4 py-3 pl-12 placeholder-gray-400 focus:outline-indigo-400 focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.email ? "border-red-500 border" : "border-transparent"
                } text-white`}
                aria-invalid={!!errors.email}
                aria-describedby="email-error"
              />
              <span className="absolute left-4 top-3.5 text-indigo-400 pointer-events-none">
                <i data-feather="mail"></i>
              </span>
              {errors.email && (
                <p
                  className="text-red-400 text-xs mt-1 absolute left-0 bottom-[-20px]"
                  id="email-error"
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className={`w-full rounded-md bg-white/10 px-4 py-3 pl-12 placeholder-gray-400 focus:outline-indigo-400 focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.password ? "border-red-500 border" : "border-transparent"
                } text-white`}
                aria-invalid={!!errors.password}
                aria-describedby="password-error"
              />
              <span className="absolute left-4 top-3.5 text-indigo-400 pointer-events-none">
                <i data-feather="lock"></i>
              </span>
              {errors.password && (
                <p
                  className="text-red-400 text-xs mt-1 absolute left-0 bottom-[-20px]"
                  id="password-error"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`w-full rounded-md bg-white/10 px-4 py-3 pl-12 placeholder-gray-400 focus:outline-indigo-400 focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.confirmPassword
                    ? "border-red-500 border"
                    : "border-transparent"
                } text-white`}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby="confirmPassword-error"
              />
              <span className="absolute left-4 top-3.5 text-indigo-400 pointer-events-none">
                <i data-feather="lock"></i>
              </span>
              {errors.confirmPassword && (
                <p
                  className="text-red-400 text-xs mt-1 absolute left-0 bottom-[-20px]"
                  id="confirmPassword-error"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white px-5 py-3 rounded-lg font-semibold hover:scale-105 transition"
              aria-label="Sign Up"
            >
              Sign Up
            </button>

            <div className="text-center text-indigo-300 font-medium space-x-2 text-sm">
              <span>Already have an account?</span>
              <Link to="/login" className="hover:text-indigo-400 transition">
                Login
              </Link>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
