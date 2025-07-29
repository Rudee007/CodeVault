import React, { useState, useEffect, useMemo } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Inside Dashboard.jsx render method (replace snippet card grid with below)
{filteredSnippets.length === 0 ? (
  <p className="text-indigo-300">No snippets found.</p>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {filteredSnippets.map((snippet) => (
      <SnippetCard
        key={snippet.id}
        snippet={snippet}
        onToggleFavorite={(id) => {
          setSnippets((prev) =>
            prev.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s))
          );
        }}
        onTogglePin={(id) => {
          setSnippets((prev) =>
            prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
          );
        }}
        onClick={(id) => navigate(`/snippet/${id}`)}
      />
    ))}
  </div>
)}

const sampleSnippets = [
  {
    id: "1",
    title: "Use debounce hook",
    code: "function useDebounce(value, delay) { /*...*/ }",
    language: "javascript",
    tags: ["react", "hooks", "debounce"],
    pinned: true,
    favorite: true,
    createdAt: "2024-05-01",
  },
  {
    id: "2",
    title: "AES256 Encryption example",
    code: "const encrypted = CryptoJS.AES.encrypt(text, key).toString();",
    language: "javascript",
    tags: ["encryption", "crypto"],
    pinned: false,
    favorite: false,
    createdAt: "2024-06-15",
  },
  {
    id: "3",
    title: "Python list comprehension",
    code: "[x for x in range(10) if x % 2 == 0]",
    language: "python",
    tags: ["python", "list", "comprehension"],
    pinned: false,
    favorite: true,
    createdAt: "2024-03-20",
  },
  // Add more mock snippets if you want
];

export default function Dashboard() {
  const [snippets, setSnippets] = useState(sampleSnippets);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    AOS.init({ once: true, duration: 600, easing: "ease-in-out" });
    feather.replace();
  }, []);

  // Collect all tags and languages from snippets for filter dropdowns
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    snippets.forEach((s) => s.tags.forEach((t) => tagsSet.add(t)));
    return Array.from(tagsSet).sort();
  }, [snippets]);

  const allLanguages = useMemo(() => {
    const langsSet = new Set(snippets.map((s) => s.language));
    return Array.from(langsSet).sort();
  }, [snippets]);

  // Filter snippets based on search and filters
  const filteredSnippets = useMemo(() => {
    return snippets.filter((snippet) => {
      if (showFavoritesOnly && !snippet.favorite) return false;
      if (filterTag && !snippet.tags.includes(filterTag)) return false;
      if (filterLanguage && snippet.language !== filterLanguage) return false;
      if (
        searchTerm &&
        !(
          snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          snippet.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          snippet.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      )
        return false;
      return true;
    });
  }, [snippets, searchTerm, filterTag, filterLanguage, showFavoritesOnly]);

  // Separate pinned snippets
  const pinnedSnippets = filteredSnippets.filter((s) => s.pinned);
  const otherSnippets = filteredSnippets.filter((s) => !s.pinned);

  // Handlers for toggling favorite and pin states (mock implementation)
  function toggleFavorite(id) {
    setSnippets((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, favorite: !s.favorite } : s
      )
    );
  }
  function togglePin(id) {
    setSnippets((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, pinned: !s.pinned } : s
      )
    );
  }

  // Copy code to clipboard with feedback
  function copyToClipboard(code) {
    navigator.clipboard.writeText(code);
    alert("Copied to clipboard!");
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br fromColorDark1 toColorDark2 text-white p-6 md:p-12">
        <h1 className="text-4xl font-extrabold text-indigo-300 mb-8 text-center">Your Code Snippets</h1>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <input
            type="search"
            placeholder="Search snippets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/20 rounded px-4 py-2 text-indigo-100 placeholder-indigo-300 focus:outline-indigo-400 w-full max-w-xs"
            aria-label="Search snippets"
          />
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="bg-white/20 rounded px-4 py-2 text-indigo-100 focus:outline-indigo-400"
            aria-label="Filter by tag"
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="bg-white/20 rounded px-4 py-2 text-indigo-100 focus:outline-indigo-400"
            aria-label="Filter by language"
          >
            <option value="">All Languages</option>
            {allLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <label className="inline-flex items-center cursor-pointer select-none ml-2">
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={() => setShowFavoritesOnly((b) => !b)}
              className="form-checkbox accent-indigo-400"
              aria-label="Show favorites only"
            />
            <span className="ml-2 text-indigo-300">Favorites only</span>
          </label>
        </div>

        {/* Pinned Snippets */}
        {pinnedSnippets.length > 0 && (
          <section className="mb-10" aria-label="Pinned snippets">
            <h2 className="text-2xl font-semibold text-indigo-200 mb-4">Pinned Snippets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {pinnedSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onToggleFavorite={() => toggleFavorite(snippet.id)}
                  onTogglePin={() => togglePin(snippet.id)}
                  onCopy={() => copyToClipboard(snippet.code)}
                />
              ))}
            </div>
          </section>
        )}

        {/* All other snippets */}
        <section aria-label="All snippets">
          <h2 className="text-2xl font-semibold text-indigo-200 mb-4">All Snippets</h2>
          {otherSnippets.length === 0 ? (
            <p className="text-indigo-300">No snippets found matching the criteria.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {otherSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onToggleFavorite={() => toggleFavorite(snippet.id)}
                  onTogglePin={() => togglePin(snippet.id)}
                  onCopy={() => copyToClipboard(snippet.code)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Add Snippet Button */}
      <button
        aria-label="Add new snippet"
        className="fixed bottom-8 right-8 bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-2xl rounded-full w-16 h-16 flex items-center justify-center text-white text-2xl hover:scale-105 transition-all z-40"
        type="button"
        onClick={() => alert("Add new snippet modal coming soon!")}
      >
        <i data-feather="plus"></i>
      </button>

      <Footer />
    </>
  );
}

// Snippet card component
function SnippetCard({ snippet, onToggleFavorite, onTogglePin, onCopy }) {
  // Simple syntax highlight for JS and Python - can expand later or use libraries like Prism.js or Highlight.js
  function syntaxHighlight(code, lang) {
    if (!code) return "";
    if (lang === "javascript") {
      return code.replace(
        /(const|let|function|return|if|else|for|while|async|await|class|new|import|export)/g,
        '<span class="text-indigo-400 font-semibold">$1</span>'
      );
    } else if (lang === "python") {
      return code.replace(
        /\b(def|return|if|else|elif|for|while|import|from|class|self|try|except|with|as)\b/g,
        '<span class="text-indigo-400 font-semibold">$1</span>'
      );
    }
    return code;
  }

  return (
    <article
      className="bg-white/10 backdrop-blur-lg border border-indigo-300/30 rounded-2xl p-5 flex flex-col shadow-md hover:shadow-lg transition-shadow"
      data-aos="fade-up"
      tabIndex={0}
    >
      <header className="flex justify-between items-center mb-2 break-words">
        <h3 className="text-lg font-semibold text-indigo-200 truncate">{snippet.title}</h3>
        <div className="flex space-x-3">
          <button
            className={`focus:outline-none`}
            onClick={onToggleFavorite}
            aria-label={snippet.favorite ? "Unfavorite snippet" : "Favorite snippet"}
            type="button"
          >
            <i data-feather={snippet.favorite ? "star" : "star"} className={snippet.favorite ? "text-yellow-400" : "text-indigo-400"}></i>
          </button>
          <button
            className={`focus:outline-none`}
            onClick={onTogglePin}
            aria-label={snippet.pinned ? "Unpin snippet" : "Pin snippet"}
            type="button"
          >
            <i data-feather={snippet.pinned ? "bookmark" : "bookmark"} className={snippet.pinned ? "text-cyan-400" : "text-indigo-400"}></i>
          </button>
          <button
            className="focus:outline-none"
            onClick={onCopy}
            aria-label="Copy code to clipboard"
            type="button"
          >
            <i data-feather="copy" className="text-indigo-400"></i>
          </button>
        </div>
      </header>
      <pre
        className="bg-black/50 rounded p-3 text-xs overflow-x-auto max-h-36 leading-snug selection:bg-indigo-600 selection:text-white"
        dangerouslySetInnerHTML={{ __html: syntaxHighlight(snippet.code, snippet.language) }}
        aria-label={`Code snippet in ${snippet.language}`}
      />
      <footer className="mt-3 flex flex-wrap gap-2">
        {snippet.tags.map((tag) => (
          <span
            key={tag}
            className="text-indigo-300 bg-indigo-800/40 px-2 py-0.5 rounded-md text-xs select-none"
          >
            #{tag}
          </span>
        ))}
      </footer>
    </article>
  );
}
