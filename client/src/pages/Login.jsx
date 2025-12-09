// pages/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";

const BACKEND_URL = "http://localhost:3003";
const GOOGLE_CLIENT_ID = "839742597149-lbkcmssge8ssh11oc7ds0ol2tbt1ra4s.apps.googleusercontent.com";

export default function Login({ showToast }) {
  const navigate = useNavigate();
  const { storeAuthData } = useAuth(); // ✅ Use auth hook
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AOS.init({ once: true });
    feather.replace();
  }, []);

  // ✅ Manual Login Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast("Please enter email and password", true);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/auth/login`,
        {
          email: email.trim().toLowerCase(),
          password: password,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: false,
          timeout: 10000,
        }
      );

      const token = res?.data?.token;
      if (!token) {
        showToast("Login failed: Token not received from server", true);
        setLoading(false);
        return;
      }

      console.log('✅ Manual login successful');
      console.log('🔑 Token:', token.substring(0, 30) + '...');

      // ✅ Use centralized storage
      storeAuthData(token, res?.data?.user);
      
      // ✅ Store in cv_token too (for backward compatibility)
      localStorage.setItem("cv_token", token);

      showToast("Login successful! Redirecting...");
      
      setTimeout(() => {
        navigate("/dashboard");
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      const msg =
        err?.response?.data?.message ||
        (err?.code === "ECONNABORTED"
          ? "Login request timed out"
          : "Invalid email or password");
      showToast(msg, true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Login Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      console.log('🔐 Google login in progress...');
      
      const res = await axios.post(
        `${BACKEND_URL}/api/auth/google`,
        {
          credential: credentialResponse.credential,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: false,
          timeout: 10000,
        }
      );

      const token = res?.data?.token;
      if (!token) {
        showToast("Google login failed: Token not received", true);
        setLoading(false);
        return;
      }

      console.log('✅ Google login successful');
      console.log('🔑 Token:', token.substring(0, 30) + '...');

      // ✅ Use centralized storage (SAME as manual login)
      storeAuthData(token, res?.data?.user);
      
      // ✅ Store in cv_token too (for backward compatibility)
      localStorage.setItem("cv_token", token);

      showToast("Google login successful! Redirecting...");
      
      setTimeout(() => {
        navigate("/dashboard");
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Google login error:", err);
      const msg = err?.response?.data?.message || "Google login failed";
      showToast(msg, true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Login Failure Handler
  const handleGoogleFailure = () => {
    console.error("Google Login Failed");
    showToast("Google login failed", true);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <main className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-br from-[#0f172a] to-[#1a1f2e] text-white overflow-hidden">
        {/* Decorative blurred circular shapes */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-700/30 filter blur-3xl animate-blob"
        ></div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-20 right-20 w-72 h-72 rounded-full bg-cyan-500/25 filter blur-3xl animate-blob animation-delay-2000"
        ></div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-20 right-1/2 w-64 h-64 rounded-full bg-purple-600/20 filter blur-2xl animate-blob animation-delay-4000"
        ></div>

        {/* Login Card */}
        <section
          className="feature-card max-w-md w-full p-8 animate-fadein relative z-10 bg-[#1a1f2e]/80 backdrop-blur-sm rounded-xl border border-indigo-900/30 shadow-2xl"
          data-aos="zoom-in"
          aria-label="Login Form"
        >
          <h2 className="text-3xl font-extrabold text-indigo-300 mb-2 text-center">
            Login to CodeVault
          </h2>
          <p className="text-gray-400 text-center text-sm mb-6">
            Access your code snippets and vault
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email Input */}
            <div className="relative">
              <input
                type="email"
                id="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-md bg-white/10 px-4 py-3 pl-12 placeholder-gray-400 focus:outline-indigo-400 focus:ring-2 focus:ring-indigo-500 transition text-white disabled:opacity-50"
              />
              <span className="absolute left-4 top-3.5 text-indigo-400 pointer-events-none">
                <i data-feather="mail"></i>
              </span>
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type="password"
                id="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-md bg-white/10 px-4 py-3 pl-12 placeholder-gray-400 focus:outline-indigo-400 focus:ring-2 focus:ring-indigo-500 transition text-white disabled:opacity-50"
              />
              <span className="absolute left-4 top-3.5 text-indigo-400 pointer-events-none">
                <i data-feather="lock"></i>
              </span>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white px-5 py-3 rounded-lg font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i data-feather="loader" className="animate-spin"></i>
                  Logging in...
                </>
              ) : (
                <>
                  <i data-feather="log-in"></i>
                  Login
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[#1a1f2e] text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Google Login Button */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                useOneTap
                theme="dark"
                locale="en"
              />
            </div>

            {/* Sign Up Link */}
            <div className="text-center text-indigo-300 font-medium space-x-2 text-sm">
              <span>Don't have an account?</span>
              <Link
                to="/signup"
                className="text-cyan-400 hover:text-cyan-300 transition font-semibold"
              >
                Sign up
              </Link>
            </div>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-indigo-400 hover:text-indigo-300 transition text-sm font-medium"
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        </section>
      </main>
    </GoogleOAuthProvider>
  );
}
