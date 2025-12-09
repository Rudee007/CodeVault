// src/pages/ShareSnippet.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import feather from "feather-icons";
import AOS from "aos";
import "aos/dist/aos.css";

const API_BASE_URL =  "http://localhost:5173";

export default function ShareSnippet({ showToast }) {
  const { shareId } = useParams();
  const [loading, setLoading] = useState(true);
  const [snippet, setSnippet] = useState(null);
  const [linkData, setLinkData] = useState(null);
  const [error, setError] = useState(null);
  const [askPassword, setAskPassword] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [user, setUser] = useState(null);

  // Fetch share data from backend
  const fetchShareData = useCallback(async (password = null) => {
    try {
      setLoading(true);
      setError(null);
      setPwError("");

      const url = password 
        ? `/api/share/${shareId}?password=${encodeURIComponent(password)}`
        : `/api/share/${shareId}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load share');
      }

      setSnippet(data.data.snippet);
      setLinkData(data.data.link);
      setUser(data.data.snippet.owner);
      
      // Check if password still required
      if (data.data.link.settings?.password && !password) {
        setAskPassword(true);
        return;
      }

      showToast("Snippet loaded successfully!");
    } catch (err) {
      console.error('Share fetch error:', err);
      
      if (err.message.includes('password')) {
        setAskPassword(true);
        setError(null);
      } else if (err.message.includes('expired') || err.message.includes('not found')) {
        setError(err.message);
      } else {
        setError('Failed to load snippet. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [shareId, showToast]);

  useEffect(() => {
    AOS.init({ once: true });
    feather.replace();
    fetchShareData();
  }, [fetchShareData]);

  // Handle password submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    await fetchShareData(inputPassword);
  };

  // Copy to clipboard
  const handleCopy = useCallback(() => {
    if (!snippet?.code) return;
    
    navigator.clipboard.writeText(snippet.code).then(() => {
      showToast("Code copied to clipboard!");
      
      // Track copy event (if user is logged in)
      if (linkData?.settings?.allowCopy !== false) {
        fetch(`/api/share/${shareId}/copy`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }).catch(console.error);
      }
    });
  }, [snippet?.code, linkData?.settings, shareId, showToast]);

  // Download snippet
  const handleDownload = () => {
    if (!snippet?.code || !linkData?.settings?.allowDownload) return;

    const blob = new Blob([snippet.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snippet.title || 'snippet'}.${snippet.language}`;
    a.click();
    URL.revokeObjectURL(url);

    showToast("Snippet downloaded!");
    
    // Track download
    fetch(`/api/share/${shareId}/download`, {
      method: 'POST',
      credentials: 'include'
    }).catch(console.error);
  };

  // Code is hidden if password required or loading
  const codeHidden = askPassword || loading || !snippet;

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-950 to-cyan-900 pb-12 text-white px-3">
        <div className="container mx-auto max-w-xl py-8">
          <section className="feature-card bg-[#151826] p-8 rounded-2xl shadow-xl">
            <div className="text-center py-16 animate-fadein">
              <i data-feather="loader" className="w-8 h-8 mx-auto animate-spin-slow mb-4" />
              <div>Loading share…</div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 to-cyan-900 pb-12 text-white px-3">
      <div className="container mx-auto max-w-xl py-8">
        <section className="feature-card bg-[#151826] p-8 rounded-2xl shadow-xl">
          
          {/* Error State */}
          {error && (
            <div className="text-center py-16 animate-fadein">
              <i data-feather="slash" className="w-8 h-8 mx-auto text-rose-400 mb-4" />
              <div className="text-rose-400 font-bold text-lg">{error}</div>
              <Link to="/" className="mt-4 inline-block text-indigo-300 hover:underline">
                Back to Home
              </Link>
            </div>
          )}

          {/* Password Prompt */}
          {askPassword && !error && (
            <form className="my-6" onSubmit={handlePasswordSubmit}>
              <label className="block text-indigo-200 mb-2 font-semibold">
                Enter password to unlock:
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="password"
                  value={inputPassword}
                  autoFocus
                  className="w-full px-4 py-2 bg-white/10 rounded focus:outline-indigo-500 transition text-indigo-100"
                  onChange={e => setInputPassword(e.target.value)}
                  placeholder="Enter share password"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-2 rounded text-white font-bold hover:scale-105 transition"
                  disabled={!inputPassword.trim()}
                >
                  Unlock
                </button>
              </div>
              {pwError && (
                <div className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <i data-feather="alert-circle" className="w-4 h-4" />
                  {pwError}
                </div>
              )}
            </form>
          )}

          {/* Success - Show Snippet */}
          {!error && !askPassword && snippet && (
            <>
              {/* Header */}
              <div className="flex justify-between items-start mb-4 gap-3">
                <div>
                  <h1 className="font-extrabold text-2xl bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent truncate leading-tight">
                    {snippet.title}
                  </h1>
                  <div className="text-gray-300 text-sm mt-1">{snippet.aiMetadata?.summary || 'No description available'}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  snippet.visibility === 'public' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}>
                  {snippet.visibility}
                </span>
              </div>

              {/* Metadata */}
              <div className="mb-6 grid grid-cols-2 gap-4 text-sm text-indigo-200">
                <div className="flex items-center gap-2">
                  <i data-feather="code" className="w-4 h-4" />
                  <span>{snippet.language}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i data-feather="tag" className="w-4 h-4" />
                  <span>{snippet.tags?.length || 0} tags</span>
                </div>
                {user && (
                  <div className="flex items-center gap-2 col-span-2">
                    <i data-feather="user" className="w-4 h-4" />
                    <span>Shared by {user.name || user.email}</span>
                  </div>
                )}
                {linkData?.stats && (
                  <div className="flex items-center gap-2 col-span-2">
                    <i data-feather="eye" className="w-4 h-4" />
                    <span>{linkData.stats.views} views • {linkData.stats.copies} copies</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {snippet.tags?.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {snippet.tags.slice(0, 8).map(tag => (
                    <span key={tag} className="bg-white/10 px-3 py-1 rounded-full text-xs text-indigo-200 hover:bg-white/20 transition">
                      #{tag}
                    </span>
                  ))}
                  {snippet.tags.length > 8 && (
                    <span className="bg-white/5 px-3 py-1 rounded-full text-xs text-gray-400">
                      +{snippet.tags.length - 8} more
                    </span>
                  )}
                </div>
              )}

              {/* Code Editor */}
              <div className="relative mb-6">
                <div className={`rounded-xl border-2 border-indigo-900/50 bg-gradient-to-b from-neutral-900/80 to-black/50 p-6 transition-all ${
                  codeHidden ? 'opacity-50 blur-sm pointer-events-none' : 'hover:border-indigo-700/70'
                }`}>
                  <Editor
                    value={snippet.code || '// Code not available'}
                    onValueChange={() => {}} // read-only
                    highlight={code => 
                      Prism.highlight(
                        code, 
                        Prism.languages[snippet.language?.toLowerCase()] || Prism.languages.javascript, 
                        snippet.language?.toLowerCase()
                      )
                    }
                    padding={20}
                    readOnly
                    style={{
                      fontFamily: "'Fira Code', 'SF Mono', Menlo, monospace",
                      fontSize: 15,
                      lineHeight: 1.6,
                      outline: "none",
                      minHeight: '400px'
                    }}
                  />
                </div>

                {/* Action Buttons */}
                {!codeHidden && (
                  <div className="absolute top-6 right-6 flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="group bg-white/10 hover:bg-white/20 p-3 rounded-xl backdrop-blur-sm transition-all flex items-center gap-2 text-indigo-200 hover:text-white hover:scale-105"
                      title="Copy code"
                      disabled={!linkData?.settings?.allowCopy}
                    >
                      <i data-feather="copy" className="w-5 h-5 group-disabled:opacity-50" />
                      {linkData?.settings?.allowCopy !== false ? 'Copy' : 'Disabled'}
                    </button>
                    
                    {linkData?.settings?.allowDownload !== false && (
                      <button
                        onClick={handleDownload}
                        className="group bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 p-3 rounded-xl backdrop-blur-sm transition-all flex items-center gap-2 text-emerald-200 hover:text-emerald-100 hover:scale-105 border border-emerald-500/30"
                        title="Download"
                      >
                        <i data-feather="download" className="w-5 h-5" />
                        Download
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Link Info */}
              {linkData && (
                <div className="text-xs text-indigo-400 text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-indigo-900/50">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <i data-feather="link-2" className="w-4 h-4" />
                    <span>Share ID: <code className="font-mono bg-indigo-900/50 px-2 py-1 rounded">{shareId}</code></span>
                  </div>
                  {linkData.settings?.expiresAt && (
                    <div className="flex items-center justify-center gap-1">
                      <i data-feather="clock" className="w-4 h-4" />
                      <span>Expires: {new Date(linkData.settings.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="text-center mt-12 pt-8 border-t border-indigo-900/30">
                <Link 
                  to="/" 
                  className="inline-flex items-center gap-2 text-indigo-300 hover:text-white hover:underline text-sm transition-colors"
                >
                  <i data-feather="arrow-left" className="w-4 h-4" />
                  Back to CodeVault
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
