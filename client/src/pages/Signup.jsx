import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init();
    feather.replace();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== passwordConfirm) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    // TODO: Replace this with real API Signup call
    setTimeout(() => {
      setLoading(false);
      if (email === "existing@example.com") {
        setErrorMessage("Email already in use");
      } else {
        // Registration success - set fake token and redirect
        localStorage.setItem("token", "demo-token");
        navigate("/dashboard");
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
            Create your CodeVault Account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <label className="block">
              <span className="text-gray-300">Name</span>
              <input
                type="text"
                className="w-full mt-1 px-4 py-2 rounded bg-white/20 focus:outline-indigo-400"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-label="Name"
              />
            </label>
            <label className="block">
              <span className="text-gray-300">Email</span>
              <input
                type="email"
                className="w-full mt-1 px-4 py-2 rounded bg-white/20 focus:outline-indigo-400"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                aria-label="Email"
              />
            </label>
            <label className="block">
              <span className="text-gray-300">Password</span>
              <input
                type="password"
                className="w-full mt-1 px-4 py-2 rounded bg-white/20 focus:outline-indigo-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                aria-label="Password"
              />
            </label>
            <label className="block">
              <span className="text-gray-300">Confirm Password</span>
              <input
                type="password"
                className="w-full mt-1 px-4 py-2 rounded bg-white/20 focus:outline-indigo-400"
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                autoComplete="new-password"
                aria-label="Confirm Password"
              />
            </label>
            {errorMessage && (
              <div className="text-red-400 text-sm mb-2" role="alert">
                {errorMessage}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 py-3 rounded-lg font-semibold hover:scale-105 transition-transform shadow-lg"
              aria-busy={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>
          <p className="mt-6 text-center text-gray-300 text-sm">
            Already have an account?{" "}
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
