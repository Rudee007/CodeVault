import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init();
    feather.replace();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    // TODO: replace with actual API call for authentication
    setTimeout(() => {
      setLoading(false);
      if (email === "test@example.com" && password === "password") {
        localStorage.setItem("token", "demo-token");
        navigate("/dashboard");
      } else {
        setErrorMessage("Invalid email or password");
      }
    }, 1200);
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
            Login to CodeVault
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                autoComplete="current-password"
                aria-label="Password"
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
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="mt-6 text-center text-gray-300 text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-indigo-400 hover:underline focus:underline">
              Sign up
            </Link>
          </p>
          <p className="mt-2 text-center text-gray-300 text-sm">
            <Link to="/password-reset" className="text-indigo-400 hover:underline focus:underline">
              Forgot password?
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
