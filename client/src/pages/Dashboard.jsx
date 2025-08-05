// src/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import feather from "feather-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

// Dummy data for demonstration.
// Replace with real API calls or global state when backend ready.
const demoSnippets = [
  {
    id: "1",
    title: "Connect to MongoDB in Node.js",
    code: "const client = new MongoClient(uri, options);",
    language: "JavaScript",
    tags: ["mongodb", "database", "nodejs"],
    summary: "Create a MongoDB client instance.",
    favorite: true,
    pinned: false,
    updated: "2025-08-03",
    visibility: "Private",
  },
  {
    id: "2",
    title: "JWT Verification Express Middleware",
    code: "jwt.verify(token, secret, callback);",
    language: "JavaScript",
    tags: ["jwt", "nodejs", "auth"],
    summary: "Verify JWT tokens in Express.",
    favorite: false,
    pinned: true,
    updated: "2025-08-01",
    visibility: "Public",
  },
  // ...more
];

// Cards and style are animated and themed.
export default function Dashboard({ showToast }) {
  // Page-level state
  const [themeDark, setThemeDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== "light";
  });

  const [snippets, setSnippets] = useState(demoSnippets);
  const [query, setQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sort, setSort] = useState("updated");

  // Calculate stats
  const total = snippets.length;
  const favorites = snippets.filter(s => s.favorite).length;
  const pinned = snippets.filter(s => s.pinned).length;
  const allLanguages = [...new Set(snippets.map(s => s.language))];

  // Theme switch handler
  const toggleTheme = () => {
    setThemeDark((prev) => {
      const t = !prev;
      localStorage.setItem("theme", t ? "dark" : "light");
      return t;
    });
  };

  // Filtering
  const filteredSnippets = snippets.filter(s => {
    const search = (s.title + s.code + s.tags.join(" ")).toLowerCase();
    const tagMatch = tagFilter ? s.tags.includes(tagFilter) : true;
    const langMatch = languageFilter ? s.language === languageFilter : true;
    return (
      search.includes(query.toLowerCase()) &&
      tagMatch &&
      langMatch
    );
  }).sort((a, b) => {
    if (sort === "updated") {
      return new Date(b.updated) - new Date(a.updated);
    }
    return a.title.localeCompare(b.title);
  });

  useEffect(() => {
    AOS.init({ once: true });
    feather.replace();
  }, [themeDark, filteredSnippets, sort]);

  // Pin/favorite handlers
  const togglePin = (id) => {
    setSnippets(list =>
      list.map(s =>
        s.id === id ? { ...s, pinned: !s.pinned } : s
      )
    );
    showToast("Snippet pin status updated");
  };

  const toggleFavorite = (id) => {
    setSnippets(list =>
      list.map(s =>
        s.id === id ? { ...s, favorite: !s.favorite } : s
      )
    );
    showToast("Snippet favorite status updated");
  };

  return (
    <>
     

      <main className={`min-h-screen pb-8 ${themeDark ? "text-white" : "text-gray-900"} bg-gradient-to-br from-indigo-950 to-cyan-900`}>
        {/* Title and FAB */}
        <section className="container mx-auto max-w-5xl pt-10 pb-2 px-4 flex justify-between items-center">
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent drop-shadow animate-fadein" data-aos="fade-right">
            Dashboard
          </h1>
          <Link
            to="/snippet/new"
            className="rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 w-14 h-14 flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all btn text-2xl z-40"
            title="Add Snippet"
            aria-label="Add Snippet"
          >
            <i data-feather="plus"></i>
          </Link>
        </section>

        {/* Stats cards */}
        <section className="container mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 px-4">
          <StatCard icon="code" label="Snippets" value={total} bg="from-indigo-500 to-violet-400" aos="fade-up" delay={0} />
          <StatCard icon="star" label="Favorites" value={favorites} bg="from-yellow-400 to-yellow-300" aos="fade-up" delay={100} />
          <StatCard icon="bookmark" label="Pinned" value={pinned} bg="from-pink-500 to-red-400" aos="fade-up" delay={200} />
          <StatCard icon="hash" label="Languages" value={allLanguages.length} bg="from-cyan-400 to-teal-300" aos="fade-up" delay={300} />
        </section>

        {/* Filter & search bar */}
        <section className="container mx-auto max-w-5xl px-4 mb-3 animate-fadein">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              className="px-5 py-2 bg-white/10 rounded-md placeholder-gray-400 text-indigo-100 focus:outline-none focus:bg-white/20 transition flex-1"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search your snippets…"
              aria-label="Search snippets"
            />

            <select
              className="bg-white/10 rounded-md px-3 py-2 text-indigo-200 focus:outline-none focus:bg-white/20 transition"
              value={languageFilter}
              onChange={e => setLanguageFilter(e.target.value)}
              aria-label="Filter by language"
            >
              <option value="">All Languages</option>
              {allLanguages.map(lang => (
                <option value={lang} key={lang}>{lang}</option>
              ))}
            </select>

            <select
              className="bg-white/10 rounded-md px-3 py-2 text-indigo-200 focus:outline-none focus:bg-white/20 transition"
              value={tagFilter}
              onChange={e => setTagFilter(e.target.value)}
              aria-label="Filter by tag"
            >
              <option value="">All Tags</option>
              {[...new Set(snippets.flatMap(snippet => snippet.tags))].map(tag => (
                <option value={tag} key={tag}>{tag}</option>
              ))}
            </select>

            <select
              className="bg-white/10 rounded-md px-3 py-2 text-indigo-200 focus:outline-none focus:bg-white/20 transition"
              value={sort}
              onChange={e => setSort(e.target.value)}
              aria-label="Sort by"
            >
              <option value="updated">Recently Updated</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </section>

        {/* Snippets list */}
        <section className="container mx-auto max-w-5xl px-4">
          {filteredSnippets.length === 0 ? (
            <p className="text-lg text-center text-indigo-300 py-8">No snippets found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSnippets.map(snippet => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onPin={() => togglePin(snippet.id)}
                  onFavorite={() => toggleFavorite(snippet.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function StatCard({ icon, label, value, bg, aos, delay }) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-lg text-center bg-gradient-to-br ${bg} feature-card`}
      data-aos={aos}
      data-aos-delay={delay}
      tabIndex={0}
    >
      <div className="flex justify-center mb-2">
        <i data-feather={icon} className="w-7 h-7 text-indigo-50 animate-bounce-slow"></i>
      </div>
      <div className="font-black text-2xl mb-1">{value}</div>
      <div className="text-indigo-100 text-sm tracking-wider">{label}</div>
    </div>
  );
}

function SnippetCard({ snippet, onPin, onFavorite }) {
  return (
    <div
      className="feature-card p-5 relative animate-fadein"
      data-aos="zoom-in"
      tabIndex={0}
    >
      {/* Pin & Favorite */}
      <div className="absolute top-3 right-4 flex gap-2 z-20">
        <button
          onClick={onPin}
          title={snippet.pinned ? "Unpin" : "Pin"}
          className="group bg-white/10 rounded-full p-2 hover:bg-white/20 transition focus:outline-none"
        >
          <i
            data-feather="bookmark"
            className={`w-5 h-5 ${snippet.pinned ? "text-pink-400 fill-pink-400" : "text-indigo-200 group-hover:text-pink-400"}`}
          ></i>
        </button>
        <button
          onClick={onFavorite}
          title={snippet.favorite ? "Unfavorite" : "Favorite"}
          className="group bg-white/10 rounded-full p-2 hover:bg-white/20 transition focus:outline-none"
        >
          <i
            data-feather="star"
            className={`w-5 h-5 ${snippet.favorite ? "text-yellow-300 fill-yellow-300" : "text-indigo-200 group-hover:text-yellow-300"}`}
          ></i>
        </button>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <span className="font-semibold text-lg text-indigo-200 truncate">{snippet.title}</span>
        {snippet.visibility === "Public" ? (
          <span className="text-xs bg-cyan-500/20 px-2 py-1 rounded text-cyan-300 ml-1">Public</span>
        ) : (
          <span className="text-xs bg-indigo-700/20 px-2 py-1 rounded text-indigo-300 ml-1">Private</span>
        )}
      </div>
      <div className="text-indigo-200 text-xs font-mono mb-1">{snippet.language}</div>
      <div className="text-gray-300 text-sm mb-2">{snippet.summary}</div>
      <div className="mb-2 flex flex-wrap gap-2">
        {snippet.tags.map(tag => (
          <span
            key={tag}
            className="bg-white/10 px-2 py-1 rounded text-xs text-indigo-300"
          >
            #{tag}
          </span>
        ))}
      </div>
      <div className="text-gray-400 text-xs flex justify-between items-center">
        <span>Updated: {snippet.updated}</span>
        <Link to={`/snippet/${snippet.id}`} className="text-cyan-300 hover:underline text-xs">
          View & Edit
        </Link>
      </div>
    </div>
  );
}
