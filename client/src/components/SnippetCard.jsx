// src/components/SnippetCard.jsx
import React, { useState } from "react";
import { useClipboard } from "../hooks/useClipboard";
import Toast from "./Toast";

export default function SnippetCard({ snippet, onToggleFavorite, onTogglePin, onClick }) {
  const { copied, error, copy } = useClipboard({ timeout: 1500 });
  const [toastVisible, setToastVisible] = useState(false);

  // Basic syntax highlighting (expand with Prism or highlight.js later)
  function syntaxHighlight(code, lang) {
    if (!code) return "";
    if (lang === "javascript") {
      return code.replace(
        /(const|let|function|return|if|else|for|while|async|await|class|new|import|export)/g,
        '<span class="text-indigo-400 font-semibold">$1</span>'
      );
    }
    if (lang === "python") {
      return code.replace(
        /\b(def|return|if|else|elif|for|while|import|from|class|self|try|except|with|as)\b/g,
        '<span class="text-indigo-400 font-semibold">$1</span>'
      );
    }
    return code; // fallback plain
  }

  const handleCopy = (e) => {
    e.stopPropagation();
    copy(snippet.code);
    setToastVisible(true);
  };

  return (
    <>
      <article
        tabIndex={0}
        role="button"
        onClick={() => onClick && onClick(snippet.id)}
        className="bg-white/10 backdrop-blur-lg border border-indigo-300/30 rounded-2xl p-5 flex flex-col cursor-pointer shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        aria-label={`View snippet titled ${snippet.title}`}
        data-aos="fade-up"
      >
        <header className="flex justify-between mb-3 items-center">
          <h3 className="text-lg font-semibold text-indigo-200 truncate">{snippet.title}</h3>
          <div className="flex space-x-3">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(snippet.id); }}
              aria-pressed={snippet.favorite}
              aria-label={snippet.favorite ? "Unfavorite snippet" : "Favorite snippet"}
              className="focus:outline-none"
            >
              <i
                data-feather="star"
                className={snippet.favorite ? "text-yellow-400 w-5 h-5" : "text-indigo-400 w-5 h-5"}
              ></i>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin(snippet.id); }}
              aria-pressed={snippet.pinned}
              aria-label={snippet.pinned ? "Unpin snippet" : "Pin snippet"}
              className="focus:outline-none"
            >
              <i
                data-feather="bookmark"
                className={snippet.pinned ? "text-cyan-400 w-5 h-5" : "text-indigo-400 w-5 h-5"}
              ></i>
            </button>
            <button
              onClick={handleCopy}
              aria-label="Copy snippet code"
              className="focus:outline-none"
            >
              <i data-feather="copy" className="text-indigo-400 w-5 h-5"></i>
            </button>
          </div>
        </header>

        <pre
          className="bg-black/50 text-xs rounded p-3 max-h-28 overflow-x-auto whitespace-pre-wrap break-words selection:bg-indigo-600 selection:text-white"
          aria-label={`Code preview of snippet in ${snippet.language}`}
          dangerouslySetInnerHTML={{ __html: syntaxHighlight(snippet.code, snippet.language) }}
        />

        <footer className="mt-3 flex flex-wrap gap-2">
          {snippet.tags?.map((tag) => (
            <span
              key={tag}
              className="bg-indigo-800/40 text-indigo-300 px-2 py-0.5 rounded-md text-xs select-none"
            >
              #{tag}
            </span>
          ))}
        </footer>
      </article>

      <Toast
        message={error ? "Failed to copy" : copied ? "Copied!" : ""}
        show={toastVisible && (copied || error)}
        onClose={() => setToastVisible(false)}
        type={error ? "error" : "success"}
      />
    </>
  );
}
