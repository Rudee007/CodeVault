// src/pages/Profile.jsx

import React, { useState, useEffect, useRef } from "react";
import feather from "feather-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../components/Navbar";

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/identicon/svg?seed=devuser";

export default function Profile({ showToast }) {
  // Replace these with real user data from context/api
  const [themeDark, setThemeDark] = useState(() => localStorage.getItem("theme") !== "light");
  const [user, setUser] = useState({
    email: "devuser@example.com",
    name: "Dev User",
    avatar: DEFAULT_AVATAR
  });
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);

  // Change password states
  const [passwords, setPasswords] = useState({ old: "", new1: "", new2: "" });
  const [pwError, setPwError] = useState("");

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    feather.replace();
    AOS.init({ once: true });
  }, [themeDark, avatar]);

  const toggleTheme = () => {
    setThemeDark(prev => {
      localStorage.setItem("theme", !prev ? "dark" : "light");
      return !prev;
    });
  };

  // Save profile (simulate async)
  const handleProfileSave = e => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Name cannot be empty.", true);
      return;
    }
    setUser(u => ({ ...u, name, avatar }));
    showToast("Profile updated!");
  };

  // Avatar upload handler (simulate cloud upload/use public image links)
  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Only image files allowed!", true);
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Password change with validation
  const handlePasswordSave = e => {
    e.preventDefault();
    setPwError("");
    if (!passwords.old || !passwords.new1 || !passwords.new2) {
      setPwError("All fields are required.");
      return;
    }
    if (passwords.new1.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (passwords.new1 !== passwords.new2) {
      setPwError("New passwords do not match.");
      return;
    }
    // Simulate API success
    showToast("Password changed!");
    setPasswords({ old: "", new1: "", new2: "" });
  };

  // Delete account
  const handleDelete = () => {
    setShowDeleteConfirm(false);
    showToast("Account deleted.");
    // Redirect or logout, etc.
  };

  return (
    <>
      <Navbar
        isLoggedIn={true}
        userName={user.name}
        themeDark={themeDark}
        toggleTheme={toggleTheme}
        onLogout={() => showToast("Logged out.")}
      />

      <main className={`min-h-screen pb-10 ${themeDark ? "text-white" : "text-gray-900"} bg-gradient-to-br from-indigo-950 to-cyan-900`}>
        <div className="container mx-auto max-w-2xl px-4 py-10">
          <section className="bg-[#1a1d27] feature-card p-8 rounded-2xl shadow-xl mb-10" data-aos="zoom-in">
            <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent mb-7">
              Profile Settings
            </h2>
            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full ring-4 ring-cyan-400 object-cover mb-1 bg-white/5"
                  />
                  <button
                    type="button"
                    aria-label="Upload Avatar"
                    className="absolute bottom-2 right-1 bg-indigo-600 hover:bg-cyan-500 text-white p-1 rounded-full shadow transition"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <i data-feather="camera"></i>
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-indigo-200 mb-1 font-semibold">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white/10 rounded focus:outline-indigo-300 transition"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={32}
                  />
                </div>
              </div>
              <div>
                <label className="block text-indigo-200 mb-1 font-semibold">Email</label>
                <input
                  disabled
                  type="email"
                  value={user.email}
                  className="w-full px-4 py-2 bg-white/10 rounded opacity-70 cursor-not-allowed select-none"
                  readOnly
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-2 rounded-lg text-white font-bold hover:scale-105 transition"
              >
                Save Profile
              </button>
            </form>
          </section>

          {/* Password change */}
          <section className="bg-[#1a1d27] feature-card p-8 rounded-2xl shadow-xl mb-10" data-aos="zoom-in" data-aos-delay="100">
            <h3 className="font-bold text-indigo-200 mb-6">Change Password</h3>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Current password"
                  className="w-full px-4 py-2 bg-white/10 rounded focus:outline-indigo-300 transition"
                  value={passwords.old}
                  onChange={e => setPasswords(pw => ({ ...pw, old: e.target.value }))}
                  autoComplete="current-password"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="New password"
                  className="w-full px-4 py-2 bg-white/10 rounded focus:outline-indigo-300 transition"
                  value={passwords.new1}
                  onChange={e => setPasswords(pw => ({ ...pw, new1: e.target.value }))}
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 bg-white/10 rounded focus:outline-indigo-300 transition"
                  value={passwords.new2}
                  onChange={e => setPasswords(pw => ({ ...pw, new2: e.target.value }))}
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              {pwError && <p className="text-red-400 text-xs">{pwError}</p>}
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-2 rounded-lg text-white font-bold hover:scale-105 transition"
              >
                Change Password
              </button>
            </form>
          </section>

          {/* Delete Account */}
          <section className="bg-[#1a1d27] feature-card p-8 rounded-2xl shadow-xl" data-aos="zoom-in" data-aos-delay="200">
            <h3 className="font-bold text-rose-300 mb-3 flex items-center gap-2">Delete Account <i data-feather="alert-triangle"></i></h3>
            <p className="text-gray-400 text-sm mb-4">
              Permanently delete your account and all snippets. This cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              type="button"
              className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded text-white font-bold transition"
            >
              Delete My Account
            </button>
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-[#151826] rounded-xl p-8 max-w-sm w-full shadow-xl text-center">
                  <h4 className="text-lg font-bold text-rose-400 mb-4">Are you sure?</h4>
                  <p className="text-gray-300 mb-6">This action cannot be undone.<br />Are you sure you want to permanently delete your account?</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-5 py-2 bg-white/10 rounded text-indigo-200 hover:bg-white/20 transition"
                    >Cancel</button>
                    <button
                      onClick={handleDelete}
                      className="px-5 py-2 bg-red-600 rounded text-white font-bold hover:bg-red-700 transition"
                    >Yes, Delete</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
