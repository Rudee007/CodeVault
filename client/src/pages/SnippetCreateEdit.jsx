import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const languageOptions = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "ruby",
  "php",
  "shell",
  "json",
  "markdown",
  "plaintext",
];

export default function SnippetCreateEdit() {
  const { id } = useParams(); // For editing existing snippet; undefined when creating new
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [tags, setTags] = useState("");
  const [encrypt, setEncrypt] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    AOS.init();
    feather.replace();

    if (id) {
      // TODO: Load snippet data by id from API and populate fields for editing
      // Mock load example:
      const mockSnippet = {
        title: "Example snippet",
        code: "// your code here",
        language: "javascript",
        tags: ["example", "mock"],
        encrypt: false,
      };
      setTitle(mockSnippet.title);
      setCode(mockSnippet.code);
      setLanguage(mockSnippet.language);
      setTags(mockSnippet.tags.join(", "));
      setEncrypt(mockSnippet.encrypt);
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (!title.trim()) {
      setErrorMsg("Title is required");
      return;
    }
    if (!code.trim()) {
      setErrorMsg("Code cannot be empty");
      return;
    }

    setSaving(true);
    
    // TODO: Replace with API calls for create or update snippet
    setTimeout(() => {
      setSaving(false);
      alert(`Snippet ${id ? "updated" : "created"} successfully!`);
      navigate("/dashboard");
    }, 1400);
  };

  // Helper to handle tag input change: sanitizes and normalizes tags list
  const handleTagsChange = useCallback((e) => {
    setTags(e.target.value);
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br fromColorDark1 toColorDark2 text-white p-6 md:p-12">
        <div
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-4xl mx-auto shadow-lg"
          data-aos="fade-up"
        >
          <h2 className="text-3xl font-extrabold mb-6 text-indigo-300">
            {id ? "Edit Snippet" : "Create New Snippet"}
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="title" className="block mb-1 text-gray-300 font-medium">
                Title
              </label>
              <input
                id="title"
                type="text"
                className="w-full px-4 py-2 rounded bg-white/20 text-white focus:outline-indigo-400"
                placeholder="Snippet title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                aria-required="true"
                aria-label="Snippet title"
              />
            </div>

            <div className="md:flex md:gap-4">
              <div className="flex-1">
                <label htmlFor="language" className="block mb-1 text-gray-300 font-medium">
                  Language
                </label>
                <select
                  id="language"
                  className="w-full px-4 py-2 rounded bg-white/20 text-white focus:outline-indigo-400"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  aria-label="Select programming language"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 mt-4 md:mt-0">
                <label htmlFor="tags" className="block mb-1 text-gray-300 font-medium">
                  Tags (comma separated)
                </label>
                <input
                  id="tags"
                  type="text"
                  className="w-full px-4 py-2 rounded bg-white/20 text-white focus:outline-indigo-400"
                  placeholder="e.g. react, hooks, encryption"
                  value={tags}
                  onChange={handleTagsChange}
                  aria-label="Snippet tags"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="encrypt"
                checked={encrypt}
                onChange={() => setEncrypt((prev) => !prev)}
                className="accent-indigo-400"
                aria-checked={encrypt}
              />
              <label htmlFor="encrypt" className="text-gray-300 text-sm cursor-pointer select-none">
                Encrypt this snippet (AES-256)
              </label>
            </div>

            <div className="h-[400px] rounded overflow-hidden border border-indigo-400">
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  automaticLayout: true,
                }}
                aria-label="Code editor"
              />
            </div>

            {errorMsg && (
              <div className="text-red-400 mt-2" role="alert">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 py-3 rounded-lg font-semibold hover:scale-105 transition-transform shadow-lg mt-4"
              aria-busy={saving}
            >
              {saving ? (id ? "Saving changes..." : "Creating snippet...") : id ? "Save Changes" : "Create Snippet"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
