// src/components/CodeInputStep.jsx
import React from 'react';
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
// ✅ Import Feather icons as React components
import { CheckCircle, Zap, Edit3 } from 'react-feather';


export default function CodeInputStep({ 
  formData, 
  setFormData, 
  LANGUAGE_OPTIONS, 
  detectLanguage,
  aiEnabled,
  analyzing 
}) {
  const handleCodeChange = (code) => {
    setFormData(prev => ({ ...prev, content: code }));
    
    // Auto-detect language if not manually selected and AI is enabled
    if (aiEnabled && !formData.programmingLanguage && code.trim()) {
      const detected = detectLanguage(code);
      if (detected) {
        setFormData(prev => ({ ...prev, programmingLanguage: detected }));
      }
    }
  };


  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Add Your Code</h2>
        <p className="text-indigo-300">
          {aiEnabled 
            ? "Enter your code and AI will help organize it automatically" 
            : "Enter your code and fill details manually"
          }
        </p>
      </div>


      {/* Title Input */}
      <div>
        <label className="block text-sm font-medium text-indigo-200 mb-2">
          Snippet Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g., React Custom Hook for API Calls, Python Data Validation Function"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>


      {/* Language Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-indigo-200 mb-2">
            Programming Language
          </label>
          <select
            value={formData.programmingLanguage}
            onChange={(e) => setFormData(prev => ({ ...prev, programmingLanguage: e.target.value }))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{aiEnabled ? "AI will detect..." : "Select language..."}</option>
            {LANGUAGE_OPTIONS.map(lang => (
              <option key={lang} value={lang} className="text-gray-900">
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>


        {formData.programmingLanguage && (
          <div className="flex items-end">
            <div className="px-4 py-3 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-200 text-sm flex items-center gap-2">
              {/* ✅ Use React component instead of data-feather */}
              <CheckCircle size={16} />
              Language: {formData.programmingLanguage}
            </div>
          </div>
        )}
      </div>


      {/* Code Editor */}
      <div>
        <label className="block text-sm font-medium text-indigo-200 mb-2">
          Your Code *
        </label>
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <Editor
            value={formData.content}
            onValueChange={handleCodeChange}
            highlight={(code) => {
              try {
                const language = formData.programmingLanguage || 'javascript';
                const prismLanguage = Prism.languages[language] || Prism.languages.javascript;
                return Prism.highlight(code, prismLanguage, language);
              } catch (error) {
                return code;
              }
            }}
            padding={16}
            style={{
              fontFamily: '"Fira Code", "JetBrains Mono", "Courier New", monospace',
              fontSize: 14,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              minHeight: '300px',
              color: '#fff',
              lineHeight: 1.5
            }}
            placeholder="Paste your code here...


Example:
function fetchUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then(response => response.json())
    .catch(error => console.error('Error:', error));
}"
          />
        </div>
        
        {formData.content && (
          <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>{formData.content.split('\n').length} lines</span>
              <span>{formData.content.length} characters</span>
              {formData.programmingLanguage && (
                <span className="text-indigo-300">
                  {aiEnabled ? "AI Detected" : "Selected"}: {formData.programmingLanguage}
                </span>
              )}
            </div>
          </div>
        )}
      </div>


      {/* AI Status Indicator */}
      <div className={`p-4 rounded-lg border ${
        aiEnabled 
          ? 'bg-emerald-500/10 border-emerald-500/30' 
          : 'bg-gray-500/10 border-gray-500/30'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            aiEnabled ? 'bg-emerald-500/20' : 'bg-gray-500/20'
          }`}>
            {/* ✅ Use React component with conditional rendering */}
            {aiEnabled ? (
              <Zap size={20} className="text-emerald-400" />
            ) : (
              <Edit3 size={20} className="text-gray-400" />
            )}
          </div>
          <div>
            <h4 className={`text-sm font-medium ${
              aiEnabled ? 'text-emerald-200' : 'text-gray-200'
            }`}>
              {aiEnabled ? "AI Assistant Enabled" : "Manual Mode"}
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              {aiEnabled 
                ? "AI will automatically fill missing fields like tags, summary, and category" 
                : "You'll need to fill all fields manually in the next step"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
