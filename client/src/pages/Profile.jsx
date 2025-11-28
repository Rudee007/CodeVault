// src/pages/Profile.jsx

import React, { useState, useEffect, useRef } from "react";
import feather from "feather-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../components/Navbar";
import api from "../services/api";

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/identicon/svg?seed=devuser";

export default function Profile({ showToast }) {
  const [themeDark, setThemeDark] = useState(() => localStorage.getItem("theme") !== "light");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [avatarModified, setAvatarModified] = useState(false);

  const fileInputRef = useRef();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get("/auth/user-info");
        const userData = response.data.user;
        
        setUser(userData);
        setName(userData.name || "");
        
        // Use Google profile picture if available and user hasn't uploaded custom avatar
        if (!avatarModified && userData.avatar) {
          setAvatar(userData.avatar);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError(err.response?.data?.message || "Failed to load user data");
        showToast?.("Failed to load profile data", true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    feather.replace();
    AOS.init({ once: true });
  }, [themeDark, avatar, loading]);

  const toggleTheme = () => {
    setThemeDark(prev => {
      localStorage.setItem("theme", !prev ? "dark" : "light");
      return !prev;
    });
  };

  // Save profile
  const handleProfileSave = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      showToast("Name cannot be empty.", true);
      return;
    }

    try {
      setSaving(true);
      
      // TODO: Implement backend endpoint for profile update
      // await api.put("/update-profile", { name, avatar });
      
      // Update local state
      setUser(u => ({ ...u, name, avatar }));
      
      // Update localStorage if user data is stored there
      const storedUser = localStorage.getItem("cv_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem("cv_user", JSON.stringify({ ...parsedUser, name, avatar }));
      }
      
      showToast("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update failed:", err);
      showToast(err.response?.data?.message || "Failed to update profile", true);
    } finally {
      setSaving(false);
    }
  };

  // Avatar upload handler
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      showToast("Only image files are allowed!", true);
      return;
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast("Image size should be less than 5MB", true);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatar(ev.target.result);
      setAvatarModified(true);
    };
    reader.readAsDataURL(file);
  };

  // Loading state
  if (loading) {
    return (
      <>
        {/* <Navbar /> */}
        <main className={`min-h-screen pb-10 ${themeDark ? "text-white" : "text-gray-900"} bg-gradient-to-br from-indigo-950 to-cyan-900`}>
          <div className="container mx-auto max-w-2xl px-4 py-10 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-cyan-300 text-lg">Loading profile...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Error state
  if (error && !user) {
    return (
      <>
        {/* <Navbar /> */}
        <main className={`min-h-screen pb-10 ${themeDark ? "text-white" : "text-gray-900"} bg-gradient-to-br from-indigo-950 to-cyan-900`}>
          <div className="container mx-auto max-w-2xl px-4 py-10">
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
              <i data-feather="alert-circle" className="mx-auto mb-2 text-red-400"></i>
              <p className="text-red-300 text-lg mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg text-white font-semibold transition"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {/* <Navbar /> */}

      <main className={`min-h-screen pb-10 ${themeDark ? "text-white" : "text-gray-900"} bg-gradient-to-br from-indigo-950 to-cyan-900`}>
        <div className="container mx-auto max-w-2xl px-4 py-10">
          
          {/* Profile Settings Section */}
          <section className="bg-[#1a1d27] feature-card p-8 rounded-2xl shadow-xl" data-aos="zoom-in">
            <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent mb-7">
              Profile Settings
            </h2>
            
            <form onSubmit={handleProfileSave} className="space-y-6">
              {/* Avatar and Name Section */}
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full ring-4 ring-cyan-400 object-cover bg-white/5"
                  />
                  <button
                    type="button"
                    aria-label="Upload Avatar"
                    className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-cyan-500 text-white p-2 rounded-full shadow-lg transition transform hover:scale-110"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i data-feather="camera" className="w-4 h-4"></i>
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
                  <label className="block text-indigo-200 mb-2 font-semibold">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-white placeholder-gray-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              {/* Email Field (Read-only) */}
              <div>
                <label className="block text-indigo-200 mb-2 font-semibold">Email</label>
                <input
                  disabled
                  type="email"
                  value={user?.email || ""}
                  className="w-full px-4 py-2 bg-white/5 rounded-lg opacity-70 cursor-not-allowed select-none text-gray-300"
                  readOnly
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              {/* Save Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-2.5 rounded-lg text-white font-bold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i data-feather="save" className="w-4 h-4"></i>
                      Save Profile
                    </>
                  )}
                </button>
                
                {avatarModified && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatar(user?.avatar || DEFAULT_AVATAR);
                      setAvatarModified(false);
                      showToast("Avatar reset to original");
                    }}
                    className="px-6 py-2.5 rounded-lg bg-white/10 text-indigo-200 hover:bg-white/20 transition font-semibold"
                  >
                    Reset Avatar
                  </button>
                )}
              </div>
            </form>
          </section>

        </div>
      </main>
    </>
  );
}
