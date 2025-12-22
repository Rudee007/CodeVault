// pages/ShareLinkPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

export default function ShareLinkPage() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState(null);
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.log('📄 ShareLinkPage mounted with shareId:', shareId);
    fetchSharedSnippet();
  }, [shareId]);

  const fetchSharedSnippet = async (pwd = null) => {
    try {
      console.log('🔄 Fetching shared snippet...');
      setLoading(true);
      setError(null);

      const url = new URL(`${API_BASE_URL}/api/share/${shareId}`);
      if (pwd) {
        url.searchParams.append('password', pwd);
      }

      const response = await fetch(url.toString());
      console.log('📊 Response status:', response.status);

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Response error:', data);
        
        if (data.requiresPassword) {
          setRequiresPassword(true);
          setError('This snippet is password protected');
          setLoading(false);
          return;
        }
        
        throw new Error(data.error || 'Failed to load snippet');
      }

      console.log('✅ Snippet loaded:', data.data.snippet.title);
      
      setSnippet(data.data.snippet);
      setLink(data.data.link);
      setRequiresPassword(false);
      setPassword('');
    } catch (err) {
      console.error('❌ Fetch shared snippet error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password.trim()) {
      fetchSharedSnippet(password);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Track copy event
      fetch(`${API_BASE_URL}/api/share/${shareId}/copy`, {
        method: 'POST'
      }).catch(err => console.error('Failed to track copy:', err));
    } catch (err) {
      console.error('Copy failed:', err);
      alert('❌ Failed to copy to clipboard');
    }
  };

  const handleDownload = async () => {
    try {
      const extension = snippet.language || 'txt';
      const filename = `${snippet.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`;
      
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(snippet.code));
      element.setAttribute('download', filename);
      element.style.display = 'none';
      
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      // Track download event
      fetch(`${API_BASE_URL}/api/share/${shareId}/download`, {
        method: 'POST'
      }).catch(err => console.error('Failed to track download:', err));
      
      console.log('✅ File downloaded:', filename);
    } catch (err) {
      console.error('Download failed:', err);
      alert('❌ Failed to download file');
    }
  };

  // Loading state with animation
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-transparent border-t-purple-500 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="text-gray-300 text-lg font-medium">Loading snippet</p>
          <p className="text-gray-500 text-sm mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  // Password required state with glassmorphism
  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

        <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Password Protected</h2>
            <p className="text-gray-400">Enter the password to view this snippet</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                autoFocus
              />
            </div>
            
            {error && (
              <div className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-500/50 hover:shadow-indigo-500/70"
            >
              Unlock Snippet
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 px-4 py-2 text-indigo-300 hover:text-indigo-200 transition flex items-center justify-center gap-2 group"
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Error state with better design
  if (error || !snippet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl w-full max-w-md text-center shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/50">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Snippet Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'This snippet may have expired or been deleted'}</p>
          
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-500/50"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Success state - Display snippet with improved UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-indigo-300 hover:text-indigo-200 flex items-center gap-2 mb-6 transition group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          
          {/* Snippet Info Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl">
            {/* Title and description */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                {snippet.title}
              </h1>
              
              {snippet.aiMetadata?.summary && (
                <p className="text-gray-300 text-lg leading-relaxed">{snippet.aiMetadata.summary}</p>
              )}
            </div>

            {/* Language and Tags */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {snippet.language}
              </span>
              
              {snippet.tags?.slice(0, 4).map((tag) => (
                <span key={tag} className="px-3 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl text-sm">
                  #{tag}
                </span>
              ))}
              
              {snippet.tags?.length > 4 && (
                <span className="px-3 py-2 bg-white/5 border border-white/10 text-gray-400 rounded-xl text-sm">
                  +{snippet.tags.length - 4} more
                </span>
              )}
            </div>

            {/* Stats */}
            {link && (
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{link.stats?.views || 0}</div>
                  <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Views
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{link.stats?.copies || 0}</div>
                  <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copies
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{link.stats?.downloads || 0}</div>
                  <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Downloads
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Code Editor Section */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden mb-6">
          {/* Code header */}
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-4 text-gray-400 text-sm font-mono">{snippet.title}.{snippet.language}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 px-2 py-1 bg-white/5 rounded">
                {snippet.code.split('\n').length} lines
              </span>
            </div>
          </div>

          {/* Code content */}
          <div className="bg-[#1e1e1e] relative">
            <Editor
              value={snippet.code}
              onValueChange={() => {}}
              highlight={(code) =>
                Prism.highlight(
                  code,
                  Prism.languages[snippet.language?.toLowerCase()] ||
                    Prism.languages.javascript,
                  snippet.language?.toLowerCase()
                )
              }
              padding={24}
              readOnly
              style={{
                fontFamily: "'Fira Code', 'Consolas', monospace",
                fontSize: 14,
                lineHeight: 1.7,
                minHeight: '400px',
                maxHeight: '600px',
                overflow: 'auto',
              }}
              className="code-editor-custom"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {link?.settings?.allowCopy && (
            <button
              onClick={handleCopy}
              className="group relative px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl text-white font-semibold transition shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center justify-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-700"></div>
              <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="relative z-10">{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          )}
          
          {link?.settings?.allowDownload && (
            <button
              onClick={handleDownload}
              className="group relative px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-2xl text-white font-semibold transition shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center justify-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-700"></div>
              <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3-3m3 3V8" />
              </svg>
              <span className="relative z-10">Download File</span>
            </button>
          )}
        </div>

        {/* Footer Info */}
        {link && (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {link.owner?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Shared by</p>
                  <p className="text-white font-medium">{link.owner?.name || 'Anonymous'}</p>
                </div>
              </div>
              
              {link.settings?.expiresAt && (
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">
                    Expires: {new Date(link.settings.expiresAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
