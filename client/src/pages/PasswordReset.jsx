import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // Success or info message
  const [errorMessage, setErrorMessage] = useState("");
  
  useEffect(() => {
    AOS.init();
    feather.replace();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");
    setLoading(true);

    // TODO: Replace with actual API call for password reset
    setTimeout(() => {
      setLoading(false);
      // Fake validation example
      if (email === "") {
        setErrorMessage("Please enter your email");
      } else {
        setMessage("If that email exists in our system, a reset link will be sent.");
      }
    }, 1400);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br fromColorDark1 toColorDark2 text-white flex flex-col justify-center items-center p-4">
        <div
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full shadow-lg"
          data-aos="fade-up"
        >
          <h2 className="text-3xl font-extrabold mb-6 text-indigo-300 text-center">
            Reset Your Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <label className="block">
              <span className="text-gray-300">Email Address</span>
              <input
                type="email"
                className="w-full mt-1 px-4 py-2 rounded bg-white/20 focus:outline-indigo-400"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-label="Email Address"
              />
            </label>
            {errorMessage && (
              <div className="text-red-400 text-sm mb-2" role="alert">
                {errorMessage}
              </div>
            )}
            {message && (
              <div className="text-green-400 text-sm mb-2" role="status">
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 py-3 rounded-lg font-semibold hover:scale-105 transition-transform shadow-lg"
              aria-busy={loading}
            >
              {loading ? "Sending reset link..." : "Send Reset Link"}
            </button>
          </form>
          <p className="mt-6 text-center text-gray-300 text-sm">
            Remembered your password?{" "}
            <Link to="/login" className="text-indigo-400 hover:underline focus:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
