import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export default function Login({ showToast }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    AOS.init({ once: true });
    feather.replace();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast("Please enter email and password", true);
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:3003/api/auth/login",
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
        return;
      }
      localStorage.setItem("cv_token", token);
      showToast("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard");
        window.location.reload();
      });
    } catch (err) {
      console.error("Login error:", err);
      const msg =
        err?.response?.data?.message ||
        (err?.code === "ECONNABORTED"
          ? "Login request timed out"
          : "Invalid email or password");
      showToast(msg, true);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:3003/api/auth/google", {
        credential: credentialResponse.credential,
      });
      localStorage.setItem("cv_token", res.data.token);
      navigate("/dashboard");
      window.location.reload();
    } catch (err) {
      console.error("Google signup error", err.response?.data || err.message);
      showToast("Google signup failed", true);
    }
  };

  const handleGoogleFailure = () => {
    console.log("Google Login Failed");
    showToast("Google signup failed", true);
  };

  return (
    <GoogleOAuthProvider clientId="839742597149-lbkcmssge8ssh11oc7ds0ol2tbt1ra4s.apps.googleusercontent.com">
      <main
        className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-br fromColorDark1 toColorDark2 textWhite overflow-hidden"
      >
        {/* Decorative blurred circular shapes for professional background pattern */}
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

        <section
          className="feature-card max-w-md w-full p-8 animate-fadein relative z-10"
          data-aos="zoom-in"
          aria-label="Login Form"
        >
          <h2 className="text-3xl font-extrabold text-indigo-300 mb-6 text-center">
            Login to CodeVault
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email */}
            <div className="relative">
              <input
                type="email"
                id="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md bg-white/10 px-4 py-3 pl-12 placeholder-gray-400 focus:outline-indigo-400 focus:ring-2 focus:ring-indigo-500 transition text-white"
              />
              <span className="absolute left-4 top-3.5 text-indigo-400 pointer-events-none">
                <i data-feather="mail"></i>
              </span>
            </div>
            {/* Password */}
            <div className="relative">
              <input
                type="password"
                id="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-white/10 px-4 py-3 pl-12 placeholder-gray-400 focus:outline-indigo-400 focus:ring-2 focus:ring-indigo-500 transition text-white"
              />
              <span className="absolute left-4 top-3.5 text-indigo-400 pointer-events-none">
                <i data-feather="lock"></i>
              </span>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white px-5 py-3 rounded-lg font-semibold hover:scale-105 transition"
            >
              Login
            </button>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              useOneTap
            />
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
    </GoogleOAuthProvider>
  );
}

