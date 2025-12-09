// components/PrivateSnippetsContent.jsx
import React, { useState, useEffect } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import feather from "feather-icons";
import AOS from "aos";

const API_BASE_URL =  "http://localhost:3003";

export default function PrivateSnippetsContent({ onClose }) {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSnippet, setSelectedSnippet] = useState(null);

  const token = localStorage.getItem("token") || localStorage.getItem("cv_token");

  useEffect(() => {
    console.log('📚 PrivateSnippetsContent mounted');
    console.log('🔑 Token:', token ? '✓ Present' : '✗ Missing');
    
    // ✅ Remove feather.replace() - it conflicts with React
    AOS.init({ once: true });
    
    if (token) {
      fetchPrivateSnippets();
    } else {
      console.error('❌ No token found for fetching snippets');
      setError("Authentication token not found");
      setLoading(false);
    }
  }, [token]);

  const fetchPrivateSnippets = async () => {
    try {
      console.log('🔄 Fetching private snippets...');
      setLoading(true);
      
      const response = await fetch(
        `${API_BASE_URL}/api/snippets/user/me?visibility=private`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log('📊 Fetch response status:', response.status);

      const data = await response.json();
      
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch snippets");
      }

      console.log('✅ Snippets fetched:', data.snippets?.length || 0);
      setSnippets(data.snippets || []);
    } catch (err) {
      console.error("❌ Fetch snippets error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShare = async (snippetId) => {
    try {
      console.log('🔗 Creating share link for:', snippetId);
      
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
      alert("✅ Share link created and copied to clipboard!");
    } catch (err) {
      console.error("❌ Create share error:", err);
      alert("❌ " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 mx-auto mb-4 text-indigo-400 animate-spin">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="text-gray-400">Loading your private snippets…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 mx-auto mb-4 text-rose-400">⚠️</div>
        <div className="text-rose-400 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-500 rounded-lg text-white hover:bg-indigo-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (snippets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-4 text-indigo-400">🔒</div>
        <h3 className="text-xl font-bold mb-2 text-white">
          No Private Snippets
        </h3>
        <p className="text-gray-400">
          Create your first private snippet to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {snippets.map((snippet) => (
        <div
          key={snippet._id}
          className="bg-[#1a1f2e] p-6 rounded-xl hover:shadow-lg transition border border-indigo-900/30"
          data-aos="fade-up"
        >
          {/* Header */}
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-indigo-300 mb-1 truncate">
                {snippet.title}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                {snippet.aiMetadata?.summary || snippet.description || "No description"}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 whitespace-nowrap flex-shrink-0">
              {snippet.language}
            </span>
          </div>

          {/* Tags */}
          {snippet.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
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
                  +{snippet.tags.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Code Preview */}
          <div className="bg-gradient-to-b from-neutral-900/50 to-black/50 p-4 rounded-lg mb-4 max-h-48 overflow-hidden">
            <Editor
              value={snippet.code.substring(0, 300)}
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
            {snippet.code.length > 300 && (
              <div className="text-xs text-gray-500 mt-2">... view full</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSnippet(snippet)}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 px-4 py-2 rounded-lg text-indigo-200 transition text-sm font-medium"
            >
              👁️ View
            </button>
            <button
              onClick={() => handleCreateShare(snippet._id)}
              className="flex-1 flex items-center justify-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 px-4 py-2 rounded-lg text-cyan-200 transition text-sm font-medium"
            >
              🔗 Share
            </button>
          </div>
        </div>
      ))}

      {/* Full Snippet Modal */}
      {selectedSnippet && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3"
          onClick={() => setSelectedSnippet(null)}
        >
          <div
            className="bg-[#151826] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-indigo-900/30 flex justify-between sticky top-0 bg-[#151826] z-10">
              <h2 className="text-2xl font-bold text-indigo-300 truncate">
                {selectedSnippet.title}
              </h2>
              <button
                onClick={() => setSelectedSnippet(null)}
                className="text-gray-400 hover:text-white text-2xl flex-shrink-0 ml-4"
              >
                ✕
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

            <div className="p-6 border-t border-indigo-900/30 flex gap-2 sticky bottom-0 bg-[#151826]">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedSnippet.code);
                  alert("✅ Copied to clipboard!");
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 px-4 py-2 rounded-lg text-indigo-200 transition font-medium"
              >
                📋 Copy Code
              </button>
              <button
                onClick={() => setSelectedSnippet(null)}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-500/20 hover:bg-gray-500/30 px-4 py-2 rounded-lg text-gray-200 transition font-medium"
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
