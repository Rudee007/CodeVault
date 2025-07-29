import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useClipboard } from "../hooks/useClipboard";
import Toast from "../components/Toast";

const mockSnippetData = {
  id: "1",
  title: "Use debounce hook",
  code: `function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}`,
  language: "javascript",
  tags: ["react", "hooks", "debounce"],
  visibility: "private", // or "public"
  createdAt: "2024-05-01",
  aiSummary: "A React hook that debounces a value over a delay period.",
};

export default function SnippetView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { copied, error, copy } = useClipboard({ timeout: 2000 });
  const [toastVisible, setToastVisible] = useState(false);
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    AOS.init({ duration: 700 });
    feather.replace();

    // TODO: Replace with real API call
    setLoading(true);
    setFetchError("");
    setTimeout(() => {
      if (id === mockSnippetData.id) {
        setSnippet(mockSnippetData);
        setLoading(false);
      } else {
        setFetchError("Snippet not found");
        setLoading(false);
      }
    }, 900);
  }, [id]);

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
          <p className="text-indigo-300 text-xl animate-fadein">Loading snippet...</p>
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
            onClick={() => navigate("/dashboard")}
            className="bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform shadow-lg"
            type="button"
          >
            Back to Dashboard
          </button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br fromColorDark1 toColorDark2 text-white p-6 md:p-12 max-w-5xl mx-auto">
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-4xl font-extrabold text-indigo-300 break-words">{snippet.title}</h1>
          <Link
            to={`/snippet/${id}/edit`}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-md transition transform hover:scale-105"
            aria-label="Edit snippet"
          >
            <i data-feather="edit" className="w-5 h-5"></i> Edit
          </Link>
        </header>

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
