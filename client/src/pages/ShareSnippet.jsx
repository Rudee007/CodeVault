// src/pages/ShareSnippet.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import feather from "feather-icons";
import AOS from "aos";
import "aos/dist/aos.css";

// Simulated backend fetch by shareId
const demoShares = {
  "abc123": {
    id: "2",
    title: "JWT Verification Express Middleware",
    summary: "Verify JWT tokens in Express.",
    code: "jwt.verify(token, secret, callback);",
    language: "JavaScript",
    tags: ["jwt", "nodejs", "auth"],
    visibility: "Public",
    owner: "devuser",
    protected: true,
    expiresAt: "2025-08-08T23:59",
    accessCount: 1,
    maxAccess: 3,
    encrypted: true,
    password: "secret123"
  },
  "open789": {
    id: "5",
    title: "Sort a Python list by length",
    summary: "Sorts a Python list using len().",
    code: "words.sort(key=len)",
    language: "Python",
    tags: ["python", "sort", "list"],
    visibility: "Public",
    owner: "snippy",
    protected: false,
    expiresAt: null,
    accessCount: 2,
    maxAccess: 100,
    encrypted: false
  }
};
// Simulate loading code share data
const getShareInfo = (shareId) => demoShares[shareId] || null;

export default function ShareSnippet({ showToast }) {
  const { shareId } = useParams();
  const [loading, setLoading] = useState(true);
  const [snippet, setSnippet] = useState(null);
  const [expired, setExpired] = useState(false);
  const [askPassword, setAskPassword] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    AOS.init({ once: true });
    feather.replace();
    setLoading(true);

    // Simulate server-side checks: fetch share, check expiration/access/password
    setTimeout(() => {
      const data = getShareInfo(shareId);
      if (!data) {
        setExpired(true);
        setLoading(false);
        return;
      }
      // Simulated expiry
      if (data.expiresAt && new Date() > new Date(data.expiresAt)) {
        setExpired(true);
        setLoading(false);
        return;
      }
      // Simulated max access count
      if (data.accessCount >= data.maxAccess) {
        setExpired(true);
        setLoading(false);
        return;
      }
      // Check if password-protected
      if (data.protected) {
        setAskPassword(true);
      }
      setSnippet(data);
      setLoading(false);
    }, 1000);
  }, [shareId]);

  // Password check
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPwError("");
    if (inputPassword === snippet.password) {
      setAskPassword(false);
      showToast("Access granted!");
    } else {
      setPwError("Incorrect password. Try again.");
    }
  };

  // Obfuscate code if protected and password not entered
  const codeHidden =
    snippet && snippet.protected && askPassword;

  return (
    <>
     

      <main className="min-h-screen bg-gradient-to-br from-indigo-950 to-cyan-900 pb-12 text-white px-3">
        <div className="container mx-auto max-w-xl py-8">
          <section
            className="feature-card bg-[#151826] p-8 rounded-2xl shadow-xl"
            data-aos="zoom-in"
          >
            {/* Loader and Expired */}
            {loading ? (
              <div className="text-center py-16 animate-fadein">
                <i data-feather="loader" className="w-8 h-8 mx-auto animate-spin-slow mb-4" />
                <div>Loading share…</div>
              </div>
            ) : expired ? (
              <div className="text-center py-16 animate-fadein">
                <i data-feather="slash" className="w-8 h-8 mx-auto text-rose-400 mb-4" />
                <div className="text-rose-400 font-bold text-lg">Link expired or not found.</div>
                <Link to="/" className="mt-4 inline-block text-indigo-300 hover:underline">Back to Home</Link>
              </div>
            ) : (
              <>
                {/* Header/meta */}
                <div className="flex justify-between items-center mb-2 gap-2">
                  <h1 className="font-extrabold text-xl bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent truncate">
                    {snippet.title}
                  </h1>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${snippet.visibility === "Public" ? "bg-cyan-700 text-cyan-200" : "bg-indigo-700 text-indigo-200"}`}>
                    {snippet.visibility}
                  </span>
                </div>
                <div className="text-gray-300 italic text-sm mb-1">{snippet.summary}</div>

                <div className="mb-2 flex flex-wrap gap-2">
                  {snippet.tags.map(tag =>
                    <span
                      key={tag}
                      className="bg-white/10 px-2 py-1 rounded text-xs text-indigo-300"
                    >#{tag}</span>)
                  }
                </div>
                <div className="text-xs text-indigo-200 mb-3 flex items-center gap-2">
                  <i data-feather="user" className="w-4 h-4" /> Shared by {snippet.owner}
                  {snippet.expiresAt &&
                    <span className="ml-2 flex items-center gap-1">
                      <i data-feather="clock" className="w-4 h-4" /> Expires: {new Date(snippet.expiresAt).toLocaleString()}
                    </span>}
                </div>

                {/* Access/analytics */}
                <div className="mb-6 flex gap-3 text-xs items-center">
                  <span><i data-feather="activity" className="w-4 h-4" /> Access {snippet.accessCount}/{snippet.maxAccess}</span>
                  {snippet.encrypted && <span className="text-cyan-400 flex items-center gap-1 ml-1"><i data-feather="lock" className="w-4 h-4" />Encrypted</span>}
                  <span><i data-feather="info" className="w-4 h-4" />Read only</span>
                </div>

                {/* Password prompt */}
                {askPassword && (
                  <form className="my-6" onSubmit={handlePasswordSubmit} data-aos="fade-in">
                    <label className="block text-indigo-200 mb-2 font-semibold">Enter password:</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="password"
                        value={inputPassword}
                        autoFocus
                        className="w-full px-4 py-2 bg-white/10 rounded focus:outline-indigo-500 transition text-indigo-100"
                        onChange={e => setInputPassword(e.target.value)}
                        autoComplete="off"
                      />
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 rounded text-white font-bold hover:scale-105 transition"
                      >
                        Unlock
                      </button>
                    </div>
                    {pwError &&
                      <div className="text-red-400 text-xs mt-2">{pwError}</div>
                    }
                  </form>
                )}

                {/* Code Block */}
                <div className={`my-5 rounded-lg border border-indigo-900 bg-neutral-900/60 relative transition ${codeHidden ? "opacity-30 blur-sm pointer-events-none" : ""}`}>
                  <Editor
                    value={snippet.code}
                    onValueChange={() => {}} // read only
                    highlight={code => Prism.highlight(code, Prism.languages[snippet.language.toLowerCase()] || Prism.languages.javascript, snippet.language.toLowerCase())}
                    padding={16}
                    readOnly
                    style={{
                      minHeight: 96,
                      fontFamily: "SF Mono, Fira Mono, Menlo, monospace",
                      fontSize: 15,
                      outline: "none"
                    }}
                  />
                  {/* Copy button */}
                  {!codeHidden && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(snippet.code);
                        showToast("Snippet copied to clipboard!");
                      }}
                      className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 rounded-lg p-2 text-indigo-200 transition"
                      title="Copy"
                    >
                      <i data-feather="copy" className="w-5 h-5"></i>
                    </button>
                  )}
                </div>
                {codeHidden && (
                  <div className="text-center text-indigo-300 text-sm mb-3">
                    <i data-feather="lock" className="inline w-4 h-4" /> This snippet is protected. Enter password to view.
                  </div>
                )}

                {/* Footer */}
                <div className="text-center mt-8">
                  <Link to="/" className="text-indigo-300 hover:underline text-sm"><i data-feather="arrow-left" className="inline w-4 h-4" />&nbsp;Back to CodeVault</Link>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
