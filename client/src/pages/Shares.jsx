import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import feather from "feather-icons";
import AOS from "aos";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Shares({ showToast }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    AOS.init({ once: true });
    feather.replace();
    fetchUserLinks();
  }, []);

  const fetchUserLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/user/links`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch links");
      }

      setLinks(data.data.links || []);
    } catch (err) {
      console.error("Fetch links error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (shareableLink) => {
    navigator.clipboard.writeText(shareableLink).then(() => {
      showToast("Share link copied to clipboard!");
    });
  };

  const handleDeleteLink = async (shareId) => {
    if (!window.confirm("Are you sure you want to delete this share link?"))
      return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/links/${shareId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete link");
      }

      setLinks(links.filter((link) => link.shareId !== shareId));
      showToast("Share link deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to delete link");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-950 to-cyan-900 pb-12 text-white px-3">
        <div className="container mx-auto max-w-4xl py-8">
          <div className="text-center py-16">
            <i
              data-feather="loader"
              className="w-8 h-8 mx-auto animate-spin-slow mb-4"
            />
            <div>Loading your share links…</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 to-cyan-900 pb-12 text-white px-3">
      <div className="container mx-auto max-w-4xl py-8">
        <section data-aos="zoom-in">
          <div className="mb-8">
            <h1 className="font-extrabold text-4xl bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent mb-2">
              Share Snippet
            </h1>
            <p className="text-gray-300">
              Manage your public share links and view analytics
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-200">
              {error}
            </div>
          )}

          {links.length === 0 ? (
            <div className="feature-card bg-[#151826] p-12 rounded-2xl shadow-xl text-center">
              <i data-feather="link-2" className="w-16 h-16 mx-auto text-indigo-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">No share links yet</h2>
              <p className="text-gray-400 mb-6">
                Create a share link from a snippet to start sharing
              </p>
              <Link
                to="/snippet/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-3 rounded-lg font-semibold hover:scale-105 transition"
              >
                <i data-feather="plus" className="w-5 h-5" />
                Create Snippet
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {links.map((link) => (
                <div
                  key={link.shareId}
                  className="feature-card bg-[#151826] p-6 rounded-xl hover:shadow-lg transition"
                  data-aos="fade-up"
                >
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-indigo-300 mb-1">
                        {link.title || "Untitled Snippet"}
                      </h3>
                      <p className="text-sm text-gray-400">{link.description}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        link.status === "active"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {link.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-indigo-200">
                    <div className="flex items-center gap-2">
                      <i data-feather="eye" className="w-4 h-4" />
                      <span>{link.stats?.views || 0} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i data-feather="copy" className="w-4 h-4" />
                      <span>{link.stats?.copies || 0} copies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i data-feather="download" className="w-4 h-4" />
                      <span>{link.stats?.downloads || 0} downloads</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i data-feather="users" className="w-4 h-4" />
                      <span>{link.stats?.uniqueVisitors || 0} visitors</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyLink(link.shareableLink)}
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 px-4 py-2 rounded-lg text-indigo-200 transition"
                    >
                      <i data-feather="copy" className="w-4 h-4" />
                      Copy Link
                    </button>
                    <Link
                      to={`/share/${link.shareId}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 px-4 py-2 rounded-lg text-cyan-200 transition"
                    >
                      <i data-feather="external-link" className="w-4 h-4" />
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteLink(link.shareId)}
                      className="flex items-center justify-center gap-2 bg-rose-500/20 hover:bg-rose-500/30 px-4 py-2 rounded-lg text-rose-200 transition"
                    >
                      <i data-feather="trash-2" className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
