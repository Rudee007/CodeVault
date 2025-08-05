// src/pages/SnippetManagement.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import feather from "feather-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-json";
import Navbar from "../components/Navbar";

const languageOptions = [
  "JavaScript", "Python", "SQL", "HTML", "JSON", "Other"
];

// Dummy snippet loading function (replace with API)
const demoSnippet = {
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
  encrypted: false,
};
const getSnippetById = (id) => (id === "new" ? null : demoSnippet);

export default function SnippetManagement({ showToast }) {
  const { id } = useParams(); // "new" or actual ID
  const navigate = useNavigate();

  const isEditMode = id !== "new";
  const [themeDark, setThemeDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== "light";
  });

  const [form, setForm] = useState({
    title: "",
    code: "",
    language: "JavaScript",
    tags: [],
    tagInput: "",
    summary: "",
    visibility: "Private",
    encrypted: false,
  });

  // Load existing snippet data in edit mode
  useEffect(() => {
    if (isEditMode) {
      const snip = getSnippetById(id); // Replace with API/DB fetch!
      if (snip) setForm({ ...snip, tagInput: "" });
    }
  }, [id, isEditMode]);

  const toggleTheme = () => {
    setThemeDark((prev) => {
      const t = !prev;
      localStorage.setItem("theme", t ? "dark" : "light");
      return t;
    });
  };

  useEffect(() => {
    feather.replace();
    AOS.init({ once: true });
  }, [themeDark]);

  // Tag handling
  const handleTagInput = (e) => {
    setForm({ ...form, tagInput: e.target.value });
  };
  const handleTagAdd = (e) => {
    e.preventDefault();
    const tag = form.tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag], tagInput: "" });
    }
  };
  const handleTagRemove = (tagToRemove) => {
    setForm({ ...form, tags: form.tags.filter(tag => tag !== tagToRemove) });
  };

  // AI summary (simulated)
  const handleAISummary = () => {
    if (!form.code.trim()) {
      showToast("Write some code to generate summary", true);
      return;
    }
    // Simulate OpenAI response (replace with real API for production)
    setForm({ ...form, summary: "This is an AI-generated summary!" });
    showToast("AI summary generated");
  };

  // Handle Save
  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.code.trim()) {
      showToast("Title and code are required", true);
      return;
    }
    // Simulate saving
    showToast(isEditMode ? "Snippet updated!" : "Snippet added!");
    setTimeout(() => navigate("/dashboard"), 1350);
  };

  // Delete
  const handleDelete = () => {
    if (window.confirm("Delete this snippet? This cannot be undone.")) {
      showToast("Snippet deleted.");
      setTimeout(() => navigate("/dashboard"), 1250);
    }
  };

  return (
    <>
     

      <main className={`min-h-screen py-8 ${themeDark ? "text-white" : "text-gray-900"} bg-gradient-to-br from-indigo-950 to-cyan-900`}>
        <div className="container mx-auto max-w-2xl px-4">
          <div className="mb-7 flex items-center gap-2">
            <Link to="/dashboard" className="text-indigo-300 hover:underline flex items-center gap-1 text-sm">
              <i data-feather="arrow-left" className="w-4 h-4"></i>Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent ml-3 select-none">
              {isEditMode ? "Edit Snippet" : "Add New Snippet"}
            </h1>
          </div>

          <form className="space-y-6 bg-[#1a1d27] p-6 rounded-2xl shadow-xl feature-card" onSubmit={handleSave} data-aos="zoom-in">
            {/* TITLE */}
            <div>
              <label htmlFor="title" className="font-semibold text-indigo-200 flex items-center gap-2">
                <i data-feather="file-text"></i> Title
              </label>
              <input
                id="title"
                type="text"
                className="w-full mt-1 px-4 py-2 bg-white/10 rounded focus:outline-indigo-300 transition"
                placeholder="Snippet Title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            {/* CODE EDITOR */}
            <div>
              <label htmlFor="code" className="font-semibold text-indigo-200 flex items-center gap-2">
                <i data-feather="code"></i> Code
              </label>
              <Editor
                value={form.code}
                onValueChange={code => setForm({ ...form, code })}
                highlight={code => Prism.highlight(code, Prism.languages[form.language.toLowerCase()] || Prism.languages.javascript, form.language.toLowerCase())}
                padding={12}
                className="w-full min-h-[130px] bg-neutral-950 rounded-md mt-2 font-mono text-sm"
                textareaId="code"
                placeholder="Paste or write your code here..."
                style={{
                  background: "#171923",
                  color: "#d1d5db",
                  borderRadius: "8px",
                  minHeight: "120px",
                  outline: "none"
                }}
              />
            </div>
            {/* LANGUAGE */}
            <div>
              <label htmlFor="language" className="font-semibold text-indigo-200 flex items-center gap-2">
                <i data-feather="terminal"></i> Language
              </label>
              <select
                id="language"
                value={form.language}
                onChange={e => setForm({ ...form, language: e.target.value })}
                className="bg-white/10 rounded-md px-3 py-2 mt-1 text-indigo-200 focus:outline-none transition"
                required
              >
                {languageOptions.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            {/* TAGS */}
            <div>
              <label className="font-semibold text-indigo-200 flex items-center gap-2">
                <i data-feather="hash"></i> Tags
              </label>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {form.tags.map(tag => (
                  <span key={tag} className="bg-white/10 text-indigo-200 px-2 py-1 rounded text-xs flex items-center gap-1">
                    #{tag}
                    <button type="button" onClick={() => handleTagRemove(tag)} className="ml-1 hover:text-red-400"><i data-feather="x" className="w-[12px] h-[12px]"></i></button>
                  </span>
                ))}
                <form onSubmit={handleTagAdd}>
                  <input
                    type="text"
                    className="bg-transparent px-2 py-1 text-indigo-100 border-none focus:outline-none"
                    placeholder="Add tag"
                    value={form.tagInput}
                    onChange={handleTagInput}
                    maxLength={18}
                  />
                  <button type="submit" style={{display:'none'}} tabIndex={-1}></button>
                </form>
              </div>
            </div>
            {/* AI SUMMARY */}
            <div>
              <label className="font-semibold text-indigo-200 flex items-center gap-2">
                <i data-feather="zap"></i> Summary
                <button
                  type="button"
                  className="ml-3 px-3 py-1 rounded bg-gradient-to-r from-cyan-600 to-indigo-500 text-white text-xs font-semibold hover:scale-105 transition"
                  onClick={handleAISummary}
                >
                  Generate by AI
                </button>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 mt-1 bg-white/10 rounded focus:outline-indigo-300 transition placeholder-gray-400 text-white"
                placeholder="Short summary for this snippet"
                value={form.summary}
                onChange={e => setForm({ ...form, summary: e.target.value })}
              />
            </div>
            {/* VISIBILITY / ENCRYPTION */}
            <div className="flex gap-4 flex-wrap items-center">
              <div>
                <label className="text-indigo-200 text-sm mr-2">
                  <input
                    type="radio"
                    name="visibility"
                    value="Private"
                    checked={form.visibility === "Private"}
                    onChange={() => setForm({ ...form, visibility: "Private" })}
                    className="accent-indigo-400 mr-1"
                  />
                  Private
                </label>
                <label className="text-indigo-200 text-sm">
                  <input
                    type="radio"
                    name="visibility"
                    value="Public"
                    checked={form.visibility === "Public"}
                    onChange={() => setForm({ ...form, visibility: "Public" })}
                    className="accent-cyan-400 ml-2 mr-1"
                  />
                  Public
                </label>
              </div>
              <label className="flex items-center text-indigo-200 text-sm">
                <input
                  type="checkbox"
                  checked={form.encrypted}
                  onChange={e => setForm({ ...form, encrypted: e.target.checked })}
                  className="accent-indigo-400 mr-2"
                />
                Encrypt with AES-256
              </label>
            </div>
            {/* FORM ACTION BUTTONS */}
            <div className="flex flex-wrap justify-end gap-3 pt-3">
              {isEditMode && (
                <button
                  type="button"
                  className="bg-red-600 px-4 py-2 rounded text-white font-semibold hover:bg-red-700 transition"
                  onClick={handleDelete}
                >Delete</button>
              )}
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="bg-white/10 px-4 py-2 rounded text-indigo-200 font-semibold hover:bg-white/20 transition"
              >Cancel</button>
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-2 rounded-lg text-white font-bold hover:scale-105 transition"
              >{isEditMode ? "Update" : "Save"} Snippet</button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
