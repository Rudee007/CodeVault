// src/pages/SnippetView.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Copy, 
  Edit, 
  Trash2, 
  Star, 
  Bookmark,
  Eye,
  Download,
  Share2,
  Check,
  Calendar,
  Code as CodeIcon,
  Tag,
  Globe,
  Lock
} from "react-feather";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { snippetService } from "../services/snippetService";
import AOS from "aos";

export default function SnippetView({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Fetch snippet
  useEffect(() => {
    fetchSnippet();
    AOS.init({ once: true, duration: 600 });
  }, [id]);

  const fetchSnippet = async () => {
    try {
      setLoading(true);
      const response = await snippetService.getSnippet(id);
      console.log('📦 Fetched snippet:', response.data);
      setSnippet(response.data.snippet);
    } catch (error) {
      console.error('Failed to fetch snippet:', error);
      showToast('Failed to load snippet', true);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      showToast('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast('Failed to copy code', true);
    }
  };

  // Download snippet
  const handleDownload = () => {
    const fileExtensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      csharp: 'cs',
      cpp: 'cpp',
      c: 'c',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      sql: 'sql',
      html: 'html',
      css: 'css',
      json: 'json',
      yaml: 'yaml',
      xml: 'xml'
    };

    const extension = fileExtensions[snippet.language] || 'txt';
    const fileName = `${snippet.title.replace(/[^a-z0-9]/gi, '_')}.${extension}`;
    
    const blob = new Blob([snippet.code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
    
    showToast('Snippet downloaded!');
  };

  // Share snippet
  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: snippet.title,
          text: snippet.documentation || 'Check out this code snippet',
          url: shareUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyShareUrl(shareUrl);
        }
      }
    } else {
      copyShareUrl(shareUrl);
    }
  };

  const copyShareUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast('Share link copied to clipboard!');
    } catch (error) {
      showToast('Failed to copy share link', true);
    }
  };

  // Toggle favorite
  const toggleFavorite = async () => {
    try {
      await snippetService.updateSnippet(id, { favorite: !snippet.favorite });
      setSnippet(prev => ({ ...prev, favorite: !prev.favorite }));
      showToast(snippet.favorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      showToast('Failed to update favorite status', true);
    }
  };

  // Toggle pin
  const togglePin = async () => {
    try {
      await snippetService.updateSnippet(id, { pinned: !snippet.pinned });
      setSnippet(prev => ({ ...prev, pinned: !prev.pinned }));
      showToast(snippet.pinned ? 'Unpinned snippet' : 'Pinned snippet');
    } catch (error) {
      showToast('Failed to update pin status', true);
    }
  };

  // Delete snippet
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this snippet? This action cannot be undone.')) {
      return;
    }

    try {
      await snippetService.deleteSnippet(id);
      showToast('Snippet deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      showToast('Failed to delete snippet', true);
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-indigo-950 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin mb-4"></div>
          <p className="text-indigo-300">Loading snippet...</p>
        </div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-indigo-950 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <CodeIcon className="w-20 h-20 mx-auto text-indigo-300/50 mb-4" />
          <p className="text-xl text-indigo-300 mb-4">Snippet not found</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 rounded-lg font-semibold transition-all text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-indigo-950 to-cyan-900">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6" data-aos="fade-down">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={togglePin}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              title={snippet.pinned ? "Unpin" : "Pin"}
            >
              <Bookmark className={`w-5 h-5 ${snippet.pinned ? 'text-pink-400 fill-pink-400' : 'text-indigo-300'}`} />
            </button>
            
            <button
              onClick={toggleFavorite}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              title={snippet.favorite ? "Unfavorite" : "Favorite"}
            >
              <Star className={`w-5 h-5 ${snippet.favorite ? 'text-yellow-300 fill-yellow-300' : 'text-indigo-300'}`} />
            </button>

            <Link
              to={`/snippet/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all text-white"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>

            <button
              onClick={handleDelete}
              className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-all"
              title="Delete"
            >
              <Trash2 className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>

        {/* Title Section */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-6" data-aos="fade-up">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-3">{snippet.title}</h1>
              
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-2 px-3 py-1 bg-indigo-500/30 rounded-lg text-indigo-200">
                  <CodeIcon className="w-4 h-4" />
                  {snippet.language}
                </span>
                
                <span className="flex items-center gap-2 px-3 py-1 bg-cyan-500/30 rounded-lg text-cyan-200">
                  {snippet.complexity || 'beginner'}
                </span>

                <span className="flex items-center gap-2 px-3 py-1 bg-purple-500/30 rounded-lg text-purple-200">
                  {snippet.category || 'other'}
                </span>

                {snippet.visibility === 'public' ? (
                  <span className="flex items-center gap-2 px-3 py-1 bg-green-500/30 rounded-lg text-green-200">
                    <Globe className="w-4 h-4" />
                    Public
                  </span>
                ) : (
                  <span className="flex items-center gap-2 px-3 py-1 bg-gray-500/30 rounded-lg text-gray-200">
                    <Lock className="w-4 h-4" />
                    Private
                  </span>
                )}
              </div>
            </div>
          </div>

          {snippet.documentation && (
            <p className="text-gray-300 leading-relaxed">{snippet.documentation}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/10 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {snippet.engagement?.views || 0} views
            </span>
            <span className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              {snippet.engagement?.copies || 0} copies
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Updated {formatDate(snippet.updatedAt)}
            </span>
          </div>
        </div>

        {/* Code Section */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden mb-6" data-aos="fade-up" data-aos-delay="100">
          <div className="flex items-center justify-between px-6 py-4 bg-black/30 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CodeIcon className="w-5 h-5" />
              Code
            </h2>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all text-white text-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-all text-white text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all text-white text-sm"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          <div className="relative">
            <SyntaxHighlighter
              language={snippet.language || 'javascript'}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '1.5rem',
                background: 'rgba(0, 0, 0, 0.3)',
                fontSize: '14px',
                lineHeight: '1.6'
              }}
              showLineNumbers={true}
              wrapLines={true}
            >
              {snippet.code}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* Tags Section */}
        {snippet.tags && snippet.tags.length > 0 && (
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6" data-aos="fade-up" data-aos-delay="200">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {snippet.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg text-indigo-200 text-sm transition-all cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Frameworks & Libraries */}
        {((snippet.frameworks && snippet.frameworks.length > 0) || (snippet.libraries && snippet.libraries.length > 0)) && (
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6" data-aos="fade-up" data-aos-delay="300">
            <div className="grid md:grid-cols-2 gap-6">
              {snippet.frameworks && snippet.frameworks.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-white mb-3">Frameworks</h3>
                  <div className="flex flex-wrap gap-2">
                    {snippet.frameworks.map(fw => (
                      <span
                        key={fw}
                        className="px-3 py-1 bg-cyan-500/20 rounded-lg text-cyan-200 text-sm"
                      >
                        {fw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {snippet.libraries && snippet.libraries.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-white mb-3">Libraries</h3>
                  <div className="flex flex-wrap gap-2">
                    {snippet.libraries.map(lib => (
                      <span
                        key={lib}
                        className="px-3 py-1 bg-purple-500/20 rounded-lg text-purple-200 text-sm"
                      >
                        {lib}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
