// src/pages/UserProfile.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";

export default function UserProfile() {
  const [name, setName] = useState("John Doe");
  const [avatar, setAvatar] = useState(null);
  const [email, setEmail] = useState("john@example.com");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    AOS.init();
    feather.replace();
  }, []);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
      // You can handle file upload here or preview
      setAvatar(URL.createObjectURL(file));
    }
  }

  function handleSaveProfile(e) {
    e.preventDefault();
    setMessage("");
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    setSaving(true);

    // TODO: API call to update profile
    setTimeout(() => {
      setSaving(false);
      setMessage("Profile updated successfully!");
    }, 1200);
  }

  function handleDeleteAccount() {
    if (window.confirm("Are you sure you want to delete your account? This action is irreversible.")) {
      // TODO: API call to delete account, then logout
      alert("Account deleted (mock).");
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br fromColorDark1 toColorDark2 p-6 md:p-12 text-white max-w-3xl mx-auto rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-indigo-300 text-center">User Profile</h1>
        <form onSubmit={handleSaveProfile} className="space-y-6" data-aos="fade-up">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-4 rounded-full bg-indigo-800 overflow-hidden border-2 border-indigo-400 cursor-pointer">
              {avatar ? (
                <img src={avatar} alt="User avatar" className="w-full h-full object-cover" />
              ) : (
                <i data-feather="user" className="w-16 h-16 text-indigo-400 mx-auto mt-4"></i>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Change avatar"
              />
            </div>
            <p className="text-sm text-indigo-400">Click avatar to change</p>
          </div>

          <label className="block">
            <span className="text-gray-300">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white/20 focus:outline-indigo-400"
              required
              aria-label="Name"
            />
          </label>

          <label className="block">
            <span className="text-gray-300">Email (read-only)</span>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-2 rounded bg-white/10 cursor-not-allowed"
              aria-label="Email"
            />
          </label>

          <label className="block">
            <span className="text-gray-300">New Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white/20 focus:outline-indigo-400"
              placeholder="Leave blank to keep unchanged"
              aria-label="New Password"
            />
          </label>

          <label className="block">
            <span className="text-gray-300">Confirm New Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white/20 focus:outline-indigo-400"
              placeholder="Confirm new password"
              aria-label="Confirm New Password"
            />
          </label>

          {message && <p className="text-center text-indigo-400 font-medium">{message}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 py-3 rounded-lg font-semibold hover:scale-105 transition-transform shadow-lg"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <hr className="my-6 border-indigo-700" />

          <button
            type="button"
            onClick={handleDeleteAccount}
            className="w-full bg-red-700 hover:bg-red-800 text-white py-3 rounded-lg font-semibold transition-transform hover:scale-105 shadow-lg"
          >
            Delete Account
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
