// src/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link } from "react-router-dom";
import { snippetService } from "../services/snippetService";
import { ArrowLeft, Plus, Code, Star, Bookmark, Hash, Search, Filter } from "react-feather";

export default function Dashboard({ showToast }) {
  const [themeDark, setThemeDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== "light";
  });

  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sort, setSort] = useState("updated");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Calculate stats
  const total = snippets.length;
  const favorites = snippets.filter(s => s.favorite).length;
  const pinned = snippets.filter(s => s.pinned).length;
  const allLanguages = [...new Set(snippets.map(s => s.language).filter(Boolean))];
  const allTags = [...new Set(snippets.flatMap(s => s.tags || []))];

  // Fetch snippets from backend
  const fetchSnippets = async () => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: 20,
        sortBy: sort === 'updated' ? 'createdAt' : 'title',
        sortOrder: 'desc'
      };

      if (languageFilter) params.language = languageFilter;
      if (tagFilter) params.tags = tagFilter;

      const response = await snippetService.getMySnippets(params);
      
      console.log('📦 Fetched snippets:', response.data);
      
      setSnippets(response.data.snippets || []);
      setPagination(response.data.pagination);
      
    } catch (error) {
      console.error('Failed to fetch snippets:', error);
      showToast('Failed to load snippets', true);
      setSnippets([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSnippets();
  }, [page, sort, languageFilter, tagFilter]);

  // Client-side search filtering
  const filteredSnippets = snippets.filter(s => {
    if (!query) return true;
    const searchText = (
      s.title + 
      s.code + 
      (s.tags || []).join(" ") +
      (s.documentation || "")
    ).toLowerCase();
    return searchText.includes(query.toLowerCase());
  });

  // AOS animation
  useEffect(() => {
    AOS.init({ once: true, duration: 600 });
  }, []);

  // Toggle pin
  const togglePin = async (id) => {
    try {
      const snippet = snippets.find(s => s._id === id);
      await snippetService.updateSnippet(id, { pinned: !snippet.pinned });
      
      setSnippets(list =>
        list.map(s =>
          s._id === id ? { ...s, pinned: !s.pinned } : s
        )
      );
      showToast("Snippet pin status updated");
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      showToast("Failed to update pin status", true);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (id) => {
    try {
      const snippet = snippets.find(s => s._id === id);
      await snippetService.updateSnippet(id, { favorite: !snippet.favorite });
      
      setSnippets(list =>
        list.map(s =>
          s._id === id ? { ...s, favorite: !s.favorite } : s
        )
      );
      showToast("Snippet favorite status updated");
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      showToast("Failed to update favorite status", true);
    }
  };

  // Delete snippet
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;
    
    try {
      await snippetService.deleteSnippet(id);
      setSnippets(list => list.filter(s => s._id !== id));
      showToast("Snippet deleted successfully");
    } catch (error) {
      console.error('Failed to delete snippet:', error);
      showToast("Failed to delete snippet", true);
    }
  };

  return (
    <main className={`min-h-screen pb-8 pt-20 ${themeDark ? "text-white" : "text-gray-900"} bg-gradient-to-br from-indigo-950 to-cyan-900`}>
      {/* Title and FAB */}
      <section className="container mx-auto max-w-6xl pt-10 pb-2 px-4 flex justify-between items-center">
        <h1 
          className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent drop-shadow" 
          data-aos="fade-right"
        >
          My Snippets
        </h1>
        <Link
          to="/snippet/new"
          className="rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 w-14 h-14 flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all z-40"
          title="Add Snippet"
          aria-label="Add Snippet"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </section>

      {/* Stats cards */}
      <section className="container mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 px-4">
        <StatCard 
          icon={<Code className="w-7 h-7" />} 
          label="Snippets" 
          value={total} 
          bg="from-indigo-500 to-violet-400" 
          aos="fade-up" 
          delay={0} 
        />
        <StatCard 
          icon={<Star className="w-7 h-7" />} 
          label="Favorites" 
          value={favorites} 
          bg="from-yellow-400 to-yellow-300" 
          aos="fade-up" 
          delay={100} 
        />
        <StatCard 
          icon={<Bookmark className="w-7 h-7" />} 
          label="Pinned" 
          value={pinned} 
          bg="from-pink-500 to-red-400" 
          aos="fade-up" 
          delay={200} 
        />
        <StatCard 
          icon={<Hash className="w-7 h-7" />} 
          label="Languages" 
          value={allLanguages.length} 
          bg="from-cyan-400 to-teal-300" 
          aos="fade-up" 
          delay={300} 
        />
      </section>

      {/* Filter & search bar */}
      <section className="container mx-auto max-w-6xl px-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-300" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 bg-white/10 rounded-lg placeholder-gray-400 text-indigo-100 focus:outline-none focus:bg-white/20 transition border border-white/10"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search your snippets…"
              aria-label="Search snippets"
            />
          </div>

          <select
            className="bg-white/10 rounded-lg px-4 py-3 text-indigo-200 focus:outline-none focus:bg-white/20 transition border border-white/10"
            value={languageFilter}
            onChange={e => setLanguageFilter(e.target.value)}
            aria-label="Filter by language"
          >
            <option value="">All Languages</option>
            {allLanguages.map(lang => (
              <option value={lang} key={lang} className="text-gray-900">
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>

          <select
            className="bg-white/10 rounded-lg px-4 py-3 text-indigo-200 focus:outline-none focus:bg-white/20 transition border border-white/10"
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value)}
            aria-label="Filter by tag"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option value={tag} key={tag} className="text-gray-900">
                #{tag}
              </option>
            ))}
          </select>

          <select
            className="bg-white/10 rounded-lg px-4 py-3 text-indigo-200 focus:outline-none focus:bg-white/20 transition border border-white/10"
            value={sort}
            onChange={e => setSort(e.target.value)}
            aria-label="Sort by"
          >
            <option value="updated" className="text-gray-900">Recently Updated</option>
            <option value="title" className="text-gray-900">Title (A-Z)</option>
          </select>
        </div>
      </section>

      {/* Loading state */}
      {loading && (
        <div className="container mx-auto max-w-6xl px-4 py-12 text-center">
          <div className="inline-block w-12 h-12 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin"></div>
          <p className="text-indigo-300 mt-4">Loading snippets...</p>
        </div>
      )}

      {/* Snippets list */}
      {!loading && (
        <section className="container mx-auto max-w-6xl px-4">
          {filteredSnippets.length === 0 ? (
            <div className="text-center py-16" data-aos="fade-up">
              <Code className="w-20 h-20 mx-auto text-indigo-300/50 mb-4" />
              <p className="text-xl text-indigo-300 mb-2">No snippets found</p>
              <p className="text-indigo-400 mb-6">
                {snippets.length === 0 
                  ? "Start building your code library!" 
                  : "Try adjusting your filters"}
              </p>
              <Link
                to="/snippet/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 rounded-lg font-semibold transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Your First Snippet
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSnippets.map(snippet => (
                  <SnippetCard
                    key={snippet._id}
                    snippet={snippet}
                    onPin={() => togglePin(snippet._id)}
                    onFavorite={() => toggleFavorite(snippet._id)}
                    onDelete={() => handleDelete(snippet._id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrev}
                    className="px-4 py-2 bg-white/10 rounded-lg text-indigo-200 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <span className="text-indigo-300">
                    Page {pagination.current} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!pagination.hasNext}
                    className="px-4 py-2 bg-white/10 rounded-lg text-indigo-200 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}

function StatCard({ icon, label, value, bg, aos, delay }) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-lg text-center bg-gradient-to-br ${bg} backdrop-blur-sm border border-white/10`}
      data-aos={aos}
      data-aos-delay={delay}
    >
      <div className="flex justify-center mb-2 text-white">
        {icon}
      </div>
      <div className="font-black text-3xl mb-1 text-white">{value}</div>
      <div className="text-white/90 text-sm tracking-wider">{label}</div>
    </div>
  );
}

function SnippetCard({ snippet, onPin, onFavorite, onDelete }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-5 relative hover:border-indigo-400/50 transition-all group"
      data-aos="zoom-in"
    >
      {/* Pin & Favorite */}
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <button
          onClick={onPin}
          title={snippet.pinned ? "Unpin" : "Pin"}
          className="bg-white/10 rounded-full p-2 hover:bg-white/20 transition focus:outline-none"
        >
          <Bookmark
            className={`w-4 h-4 ${snippet.pinned ? "text-pink-400 fill-pink-400" : "text-indigo-200"}`}
          />
        </button>
        <button
          onClick={onFavorite}
          title={snippet.favorite ? "Unfavorite" : "Favorite"}
          className="bg-white/10 rounded-full p-2 hover:bg-white/20 transition focus:outline-none"
        >
          <Star
            className={`w-4 h-4 ${snippet.favorite ? "text-yellow-300 fill-yellow-300" : "text-indigo-200"}`}
          />
        </button>
      </div>

      {/* Title */}
      <div className="mb-3 pr-20">
        <h3 className="font-bold text-lg text-white truncate mb-1">
          {snippet.title}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono bg-indigo-500/30 px-2 py-1 rounded text-indigo-200">
            {snippet.language || 'N/A'}
          </span>
          {snippet.visibility === "public" ? (
            <span className="text-xs bg-cyan-500/20 px-2 py-1 rounded text-cyan-300">Public</span>
          ) : (
            <span className="text-xs bg-indigo-700/20 px-2 py-1 rounded text-indigo-300">Private</span>
          )}
        </div>
      </div>

      {/* Summary */}
      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
        {snippet.documentation || snippet.aiMetadata?.summary || 'No description'}
      </p>

      {/* Code preview */}
      <div className="bg-black/30 rounded-lg p-3 mb-3 font-mono text-xs text-gray-400 overflow-hidden">
        <code className="line-clamp-2">{snippet.code}</code>
      </div>

      {/* Tags */}
      {snippet.tags && snippet.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {snippet.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="bg-white/10 px-2 py-1 rounded text-xs text-indigo-300"
            >
              #{tag}
            </span>
          ))}
          {snippet.tags.length > 3 && (
            <span className="text-xs text-indigo-400">+{snippet.tags.length - 3} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-white/10">
        <span>{formatDate(snippet.updatedAt || snippet.createdAt)}</span>
        <div className="flex gap-2">
          <Link 
            to={`/snippet/view/${snippet._id}`} 
            className="text-cyan-300 hover:text-cyan-200 font-medium"
          >
            View
          </Link>
          <button
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
