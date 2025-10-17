// src/components/MetadataStep.jsx
import React, { useState } from 'react';

export default function MetadataStep({ 
  formData, 
  setFormData, 
  CATEGORIES, 
  COMPLEXITIES 
}) {
  const [newTag, setNewTag] = useState('');
  const [newFramework, setNewFramework] = useState('');
  const [newLibrary, setNewLibrary] = useState('');

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addFramework = (framework) => {
    if (framework && !formData.frameworks.includes(framework)) {
      setFormData(prev => ({ ...prev, frameworks: [...prev.frameworks, framework] }));
      setNewFramework('');
    }
  };

  const removeFramework = (framework) => {
    setFormData(prev => ({
      ...prev,
      frameworks: prev.frameworks.filter(fw => fw !== framework)
    }));
  };

  const addLibrary = (library) => {
    if (library && !formData.libraries.includes(library)) {
      setFormData(prev => ({ ...prev, libraries: [...prev.libraries, library] }));
      setNewLibrary('');
    }
  };

  const removeLibrary = (library) => {
    setFormData(prev => ({
      ...prev,
      libraries: prev.libraries.filter(lib => lib !== library)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Add Metadata</h2>
        <p className="text-indigo-300">
          Customize the details to make your snippet easier to find and understand
        </p>
      </div>

      {/* Summary */}
      <div>
        <label className="block text-sm font-medium text-indigo-200 mb-2">
          Summary
        </label>
        <textarea
          value={formData.summary}
          onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
          placeholder="Brief one-line summary of what this code does..."
          rows={2}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <div className="text-xs text-gray-400 mt-1">
          Keep it concise - this appears in search results
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-indigo-200 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-indigo-500/20 text-indigo-200 rounded-full text-sm flex items-center gap-2 group hover:bg-indigo-500/30 transition-colors"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:text-white opacity-70 hover:opacity-100"
              >
                <i data-feather="x" className="w-3 h-3"></i>
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(newTag.trim());
              }
            }}
            placeholder="Add tags (press Enter)"
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => addTag(newTag.trim())}
            disabled={!newTag.trim()}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Category and Complexity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-indigo-200 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="text-gray-900">
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-indigo-200 mb-2">
            Complexity Level
          </label>
          <select
            value={formData.complexity}
            onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value }))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {COMPLEXITIES.map(comp => (
              <option key={comp} value={comp} className="text-gray-900">
                {comp.charAt(0).toUpperCase() + comp.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Frameworks */}
      <div>
        <label className="block text-sm font-medium text-indigo-200 mb-2">
          Frameworks
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.frameworks.map((framework, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm flex items-center gap-2 group hover:bg-green-500/30 transition-colors"
            >
              {framework}
              <button
                onClick={() => removeFramework(framework)}
                className="hover:text-white opacity-70 hover:opacity-100"
              >
                <i data-feather="x" className="w-3 h-3"></i>
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newFramework}
            onChange={(e) => setNewFramework(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addFramework(newFramework.trim());
              }
            }}
            placeholder="e.g., React, Vue, Express, Django"
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={() => addFramework(newFramework.trim())}
            disabled={!newFramework.trim()}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Libraries */}
      <div>
        <label className="block text-sm font-medium text-indigo-200 mb-2">
          Libraries
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.libraries.map((library, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-cyan-500/20 text-cyan-200 rounded-full text-sm flex items-center gap-2 group hover:bg-cyan-500/30 transition-colors"
            >
              {library}
              <button
                onClick={() => removeLibrary(library)}
                className="hover:text-white opacity-70 hover:opacity-100"
              >
                <i data-feather="x" className="w-3 h-3"></i>
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newLibrary}
            onChange={(e) => setNewLibrary(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLibrary(newLibrary.trim());
              }
            }}
            placeholder="e.g., lodash, axios, pandas, numpy"
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={() => addLibrary(newLibrary.trim())}
            disabled={!newLibrary.trim()}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-indigo-200 mb-2">
          Visibility
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-center p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={formData.visibility === 'private'}
              onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
              className="mr-3 text-indigo-500"
            />
            <div>
              <div className="text-white font-medium">Private</div>
              <div className="text-gray-400 text-sm">Only you can see this snippet</div>
            </div>
          </label>
          <label className="flex items-center p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={formData.visibility === 'public'}
              onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
              className="mr-3 text-indigo-500"
            />
            <div>
              <div className="text-white font-medium">Public</div>
              <div className="text-gray-400 text-sm">Others can discover and view</div>
            </div>
          </label>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-indigo-200 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional context, usage examples, or notes about this code..."
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>
    </div>
  );
}
