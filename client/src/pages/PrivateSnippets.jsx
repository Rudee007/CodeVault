import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import feather from "feather-icons";
import AOS from "aos";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3003";

export default function PrivateSnippets({ showToast }) {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSnippet, setSelectedSnippet] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    AOS.init({ once: true });
    feather.replace();
    fetchPrivateSnippets();
  }, []);

  const fetchPrivateSnippets = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/snippets?visibility=private`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch snippets");
      }

      setSnippets(data.data || []);
    } catch (err) {
      console.error("Fetch snippets error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShare = async (snippetId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/snippets/${snippetId}/share`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            settings: { expiresIn: "24" },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create share link");
      }

      const shareUrl = `${window.location.origin}/share/${data.data.shareId}`;
      navigator.clipboard.writeText(shareUrl);
      showToast("Share link created and copied!");
    } catch (err) {
      console.error("Create share error:", err);
      showToast(err.message);
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
            <div>Loading private snippets…</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 to-cyan-900 pb-12 text-white px-3">
      <div className="container mx-auto max-w-6xl py-8">
        <section data-aos="zoom-in">
          <div className="mb-8">
            <h1 className="font-extrabold text-4xl bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent mb-2">
              Private Snippets
            </h1>
            <p className="text-gray-300">
              Your private code snippets - only visible to you
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-200">
              {error}
            </div>
          )}

          {snippets.length === 0 ? (
            <div className="feature-card bg-[#151826] p-12 rounded-2xl shadow-xl text-center">
              <i data-feather="lock" className="w-16 h-16 mx-auto text-indigo-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">No private snippets yet</h2>
              <p className="text-gray-400 mb-6">
                Create your first private snippet
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
            <div className="grid gap-6">
              {snippets.map((snippet) => (
                <div
                  key={snippet._id}
                  className="feature-card bg-[#151826] rounded-2xl overflow-hidden hover:shadow-lg transition"
                  data-aos="fade-up"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-indigo-900/30">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-indigo-300 mb-1">
                          {snippet.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {snippet.aiMetadata?.summary || "No description"}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300">
                        {snippet.language}
                      </span>
                    </div>

                    {/* Tags */}
                    {snippet.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {snippet.tags.slice(0, 5).map((tag) => (
                          <span
                            key={tag}
                            className="bg-white/10 px-2 py-1 rounded text-xs text-indigo-200"
                          >
                            #{tag}
                          </span>
                        ))}
                        {snippet.tags.length > 5 && (
                          <span className="text-xs text-gray-400">
                            +{snippet.tags.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Code Preview */}
                  <div
                    className="bg-gradient-to-b from-neutral-900/50 to-black/50 p-6 max-h-64 overflow-hidden"
                    onClick={() => setSelectedSnippet(snippet)}
                  >
                    <Editor
                      value={snippet.code.substring(0, 500)}
                      onValueChange={() => {}}
                      highlight={(code) =>
                        Prism.highlight(
                          code,
                          Prism.languages[snippet.language?.toLowerCase()] ||
                            Prism.languages.javascript,
                          snippet.language?.toLowerCase()
                        )
                      }
                      padding={0}
                      readOnly
                      style={{
                        fontFamily: "'Fira Code', monospace",
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    />
                    {snippet.code.length > 500 && (
                      <div className="text-xs text-gray-500 mt-2">
                        ... view full snippet
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-6 flex gap-2">
                    <button
                      onClick={() => setSelectedSnippet(snippet)}
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 px-4 py-2 rounded-lg text-indigo-200 transition"
                    >
                      <i data-feather="eye" className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleCreateShare(snippet._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 px-4 py-2 rounded-lg text-cyan-200 transition"
                    >
                      <i data-feather="share-2" className="w-4 h-4" />
                      Share
                    </button>
                    <Link
                      to={`/snippet/edit/${snippet._id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 px-4 py-2 rounded-lg text-emerald-200 transition"
                    >
                      <i data-feather="edit" className="w-4 h-4" />
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modal for viewing full snippet */}
        {selectedSnippet && (
          <div
            className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-3"
            onClick={() => setSelectedSnippet(null)}
          >
            <div
              className="bg-[#151826] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-indigo-900/30 flex justify-between items-start">
                <h2 className="text-2xl font-bold text-indigo-300">
                  {selectedSnippet.title}
                </h2>
                <button
                  onClick={() => setSelectedSnippet(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <i data-feather="x" className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 bg-gradient-to-b from-neutral-900/50 to-black/50">
                <Editor
                  value={selectedSnippet.code}
                  onValueChange={() => {}}
                  highlight={(code) =>
                    Prism.highlight(
                      code,
                      Prism.languages[selectedSnippet.language?.toLowerCase()] ||
                        Prism.languages.javascript,
                      selectedSnippet.language?.toLowerCase()
                    )
                  }
                  padding={16}
                  readOnly
                  style={{
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 14,
                    lineHeight: 1.6,
                    minHeight: "300px",
                  }}
                />
              </div>

              <div className="p-6 border-t border-indigo-900/30 flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedSnippet.code);
                    showToast("Copied to clipboard!");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 px-4 py-2 rounded-lg text-indigo-200 transition"
                >
                  <i data-feather="copy" className="w-4 h-4" />
                  Copy Code
                </button>
                <button
                  onClick={() => setSelectedSnippet(null)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-500/20 hover:bg-gray-500/30 px-4 py-2 rounded-lg text-gray-200 transition"
                >
                  <i data-feather="x" className="w-4 h-4" />
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
