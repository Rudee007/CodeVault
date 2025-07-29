import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useClipboard } from "../hooks/useClipboard";
import Toast from "../components/Toast";

const mockSharedSnippet = {
  id: "share123",
  title: "Shared AES Encryption snippet",
  code: `const encrypted = CryptoJS.AES.encrypt(text, key).toString();`,
  language: "javascript",
  tags: ["encryption", "crypto", "shared"],
  visibility: "public",
  createdAt: "2024-06-15",
  aiSummary: "Encrypt data with AES-256 using CryptoJS.",
  passwordProtected: true,
  password: "secret123", // In real app, password is not exposed client side
};

export default function SharedSnippetView() {
  const { shareId } = useParams();
  const navigate = useNavigate();

  const { copied, error, copy } = useClipboard({ timeout: 2000 });
  const [toastVisible, setToastVisible] = useState(false);

  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    AOS.init({ duration: 700 });
    feather.replace();

    // Mock fetching snippet by shareId
    setLoading(true);
    setFetchError("");
    setTimeout(() => {
      if (shareId === mockSharedSnippet.id) {
        if (mockSharedSnippet.passwordProtected) {
          setShowPasswordModal(true);
          setLoading(false);
        } else {
          setSnippet(mockSharedSnippet);
          setLoading(false);
        }
      } else {
        setFetchError("Shared snippet not found or expired.");
        setLoading(false);
      }
    }, 800);
  }, [shareId]);

  function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError("");

    // In real app, password verification occurs server-side
    if (passwordInput === mockSharedSnippet.password) {
      setSnippet(mockSharedSnippet);
      setShowPasswordModal(false);
    } else {
      setPasswordError("Incorrect password, please try again.");
    }
  }

  function handleCopy() {
    if (snippet?.code) {
      copy(snippet.code);
      setToastVisible(true);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-br fromColorDark1 toColorDark2 text-white flex justify-center items-center p-6">
          <p className="text-indigo-300 text-xl animate-fadein">Loading shared snippet...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (fetchError) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-br fromColorDark1 toColorDark2 text-white flex flex-col justify-center items-center p-6">
          <p className="text-red-500 text-lg mb-6">{fetchError}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform shadow-lg"
            type="button"
          >
            Back to Home
          </button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br fromColorDark1 toColorDark2 text-white p-6 md:p-12 max-w-5xl mx-auto relative">
        <h1 className="text-4xl font-extrabold text-indigo-300 mb-6 break-words">{snippet.title}</h1>

        {/* Snippet Meta Info */}
        <section className="mb-6 flex flex-wrap gap-4 text-indigo-300 text-sm">
          <div>
            <strong>Language:</strong> {snippet.language}
          </div>
          <div>
            <strong>Visibility:</strong>{" "}
            <span className={snippet.visibility === "public" ? "text-green-400" : "text-yellow-400"}>
              {snippet.visibility.charAt(0).toUpperCase() + snippet.visibility.slice(1)}
            </span>
          </div>
          <div>
            <strong>Created:</strong> {new Date(snippet.createdAt).toLocaleDateString()}
          </div>
        </section>

        {/* Tags */}
        <section className="mb-6 flex flex-wrap gap-2" aria-label="Snippet tags">
          {snippet.tags.map((tag) => (
            <span
              key={tag}
              className="bg-indigo-800/50 text-indigo-300 px-3 py-1 rounded-full text-xs select-none"
            >
              #{tag}
            </span>
          ))}
        </section>

        {/* AI Generated Summary */}
        {snippet.aiSummary && (
          <section className="mb-6 bg-white/10 backdrop-blur-md p-4 rounded-lg text-indigo-200 italic shadow-inner">
            <strong>AI Summary: </strong> {snippet.aiSummary}
          </section>
        )}

        {/* Code Editor Read-Only */}
        <div className="relative rounded border border-indigo-400 overflow-hidden shadow-lg max-h-[480px]">
          <Editor
            height="480px"
            defaultLanguage={snippet.language}
            value={snippet.code}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              wordWrap: "on",
              fontSize: 14,
              scrollBeyondLastLine: false,
            }}
            theme="vs-dark"
            aria-label={`Code snippet in ${snippet.language}`}
          />
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy code to clipboard"
            className="absolute top-3 right-3 bg-indigo-700/80 hover:bg-indigo-600 px-3 py-1 rounded-md shadow-md transition"
          >
            <i data-feather="copy" className="w-5 h-5 text-indigo-300"></i>
          </button>
        </div>

        {/* Password Modal */}
        {showPasswordModal && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[999]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="passwordModalTitle"
          >
            <div className="bg-[#1a1d27] rounded-2xl max-w-md w-full p-8 shadow-2xl relative">
              <h3 id="passwordModalTitle" className="text-2xl font-bold mb-5 text-indigo-200">
                Enter Password to View Snippet
              </h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 bg-white/10 rounded focus:outline-indigo-300"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  aria-label="Enter snippet password"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-red-500 text-sm" role="alert">
                    {passwordError}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white px-5 py-2 rounded-lg font-semibold hover:scale-105 transition"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Toast
        message={error ? "Failed to copy" : copied ? "Copied to clipboard!" : ""}
        show={toastVisible && (copied || error)}
        onClose={() => setToastVisible(false)}
        type={error ? "error" : "success"}
      />

      <Footer />
    </>
  );
}
