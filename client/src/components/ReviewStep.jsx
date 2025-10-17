// src/components/ReviewStep.jsx
import React from 'react';
import Prism from "prismjs";

export default function ReviewStep({ formData, setFormData, isEditMode }) {
  const formatCode = (code, language) => {
    try {
      const prismLanguage = Prism.languages[language] || Prism.languages.javascript;
      return Prism.highlight(code, prismLanguage, language);
    } catch (error) {
      return code;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isEditMode ? "Review Changes" : "Review Your Snippet"}
        </h2>
        <p className="text-indigo-300">
          Everything looks good? {isEditMode ? "Update" : "Create"} your snippet below.
        </p>
      </div>

      {/* Snippet Preview Card */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">{formData.title}</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-200 rounded-full">
                  {formData.programmingLanguage || 'Unknown'}
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-200 rounded-full capitalize">
                  {formData.category}
                </span>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-200 rounded-full capitalize">
                  {formData.complexity}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  formData.visibility === 'public' 
                    ? 'bg-green-500/20 text-green-200' 
                    : 'bg-gray-500/20 text-gray-200'
                }`}>
                  {formData.visibility}
                </span>
              </div>
            </div>
            <button
              onClick={() => setFormData(prev => ({ ...prev, title: prompt('Edit title:', prev.title) || prev.title }))}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
              title="Edit title"
            >
              <i data-feather="edit-2" className="w-4 h-4 text-gray-400 group-hover:text-white"></i>
            </button>
          </div>
          
          {formData.summary && (
            <p className="text-gray-300 mt-3 text-sm leading-relaxed">
              {formData.summary}
            </p>
          )}
        </div>

        {/* Code Preview */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-white flex items-center gap-2">
              <i data-feather="code" className="w-4 h-4"></i>
              Code Preview
            </h4>
            <div className="text-xs text-gray-400">
              {formData.content.split('\n').length} lines • {formData.content.length} characters
            </div>
          </div>
          
          <div className="bg-black/40 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-white/5">
              <span className="text-xs text-gray-400 font-medium">
                {formData.programmingLanguage || 'plaintext'}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </div>
            <pre className="p-4 overflow-x-auto text-sm">
              <code
                className={`language-${formData.programmingLanguage}`}
                dangerouslySetInnerHTML={{
                  __html: formatCode(formData.content, formData.programmingLanguage)
                }}
              />
            </pre>
          </div>
        </div>

        {/* Metadata */}
        <div className="p-6 border-t border-white/10 space-y-4">
          
          {/* Tags */}
          {formData.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-indigo-200 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-indigo-500/20 text-indigo-200 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Frameworks */}
          {formData.frameworks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-green-200 mb-2">Frameworks</h4>
              <div className="flex flex-wrap gap-2">
                {formData.frameworks.map((fw, idx) => (
                  <span key={idx} className="px-2 py-1 bg-green-500/20 text-green-200 rounded text-xs">
                    {fw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Libraries */}
          {formData.libraries.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-cyan-200 mb-2">Libraries</h4>
              <div className="flex flex-wrap gap-2">
                {formData.libraries.map((lib, idx) => (
                  <span key={idx} className="px-2 py-1 bg-cyan-500/20 text-cyan-200 rounded text-xs">
                    {lib}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {formData.notes && (
            <div>
              <h4 className="text-sm font-medium text-yellow-200 mb-2">Notes</h4>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-yellow-100 text-sm leading-relaxed">
                  {formData.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Edit Actions */}
      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <i data-feather="settings" className="w-4 h-4"></i>
          Quick Edits
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => {
              const newSummary = prompt('Edit summary:', formData.summary);
              if (newSummary !== null) {
                setFormData(prev => ({ ...prev, summary: newSummary }));
              }
            }}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors text-left"
          >
            Edit Summary
          </button>
          <button
            onClick={() => {
              const newTag = prompt('Add tag:');
              if (newTag && !formData.tags.includes(newTag)) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
              }
            }}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors text-left"
          >
            Add Tag
          </button>
          <button
            onClick={() => {
              const categories = ['algorithm', 'function', 'class', 'component', 'utility', 'api', 'database', 'frontend', 'backend', 'data-science', 'mobile', 'devops', 'other'];
              const newCategory = prompt(`Change category (${categories.join(', ')}):`, formData.category);
              if (newCategory && categories.includes(newCategory)) {
                setFormData(prev => ({ ...prev, category: newCategory }));
              }
            }}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors text-left"
          >
            Change Category
          </button>
          <button
            onClick={() => {
              const newVisibility = formData.visibility === 'public' ? 'private' : 'public';
              setFormData(prev => ({ ...prev, visibility: newVisibility }));
            }}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors text-left"
          >
            Toggle Visibility
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-indigo-500/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-indigo-400">{formData.tags.length}</div>
          <div className="text-sm text-indigo-200">Tags</div>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{formData.frameworks.length}</div>
          <div className="text-sm text-green-200">Frameworks</div>
        </div>
        <div className="bg-cyan-500/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-cyan-400">{formData.libraries.length}</div>
          <div className="text-sm text-cyan-200">Libraries</div>
        </div>
        <div className="bg-purple-500/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">{formData.content.split('\n').length}</div>
          <div className="text-sm text-purple-200">Lines</div>
        </div>
      </div>
    </div>
  );
}
