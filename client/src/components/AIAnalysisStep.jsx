// src/components/AIAnalysisStep.jsx
import React, { useState } from 'react';

export default function AIAnalysisStep({ 
  analyzing, 
  aiSuggestions, 
  formData, 
  useAISuggestions, 
  applyAISuggestion, 
  setFormData 
}) {
  const [showManualOverride, setShowManualOverride] = useState(false);

  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i data-feather="zap" className="w-8 h-8 text-indigo-400"></i>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Analyzing Your Code</h3>
        <p className="text-indigo-300 text-center max-w-md">
          Our AI is examining your code to generate descriptions, tags, and categorization suggestions...
        </p>
        <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
          This usually takes 2-3 seconds
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">AI Analysis Complete</h2>
        <p className="text-indigo-300">
          Review and customize the AI-generated suggestions below
        </p>
      </div>

      {/* AI Suggestions Cards */}
      <div className="grid gap-6">
        
        {/* Description Suggestion */}
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <i data-feather="file-text" className="w-5 h-5 text-indigo-400"></i>
              </div>
              <div>
                <h3 className="font-semibold text-white">Description</h3>
                <p className="text-sm text-gray-400">AI-generated explanation</p>
              </div>
            </div>
            <button
              onClick={() => applyAISuggestion('description')}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <i data-feather="check" className="w-4 h-4"></i>
              Use This
            </button>
          </div>
          <div className="bg-black/20 rounded-lg p-4">
            <p className="text-gray-200 text-sm leading-relaxed">
              {aiSuggestions.description || 'No description generated'}
            </p>
          </div>
        </div>

        {/* Tags Suggestion */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <i data-feather="hash" className="w-5 h-5 text-cyan-400"></i>
              </div>
              <div>
                <h3 className="font-semibold text-white">Tags</h3>
                <p className="text-sm text-gray-400">Relevant keywords</p>
              </div>
            </div>
            <button
              onClick={() => applyAISuggestion('tags')}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <i data-feather="check" className="w-4 h-4"></i>
              Use These
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {aiSuggestions.tags?.length > 0 ? aiSuggestions.tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 bg-cyan-500/20 text-cyan-200 rounded-full text-sm">
                {tag}
              </span>
            )) : (
              <span className="text-gray-400 text-sm">No tags generated</span>
            )}
          </div>
        </div>

        {/* Category & Complexity */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <i data-feather="folder" className="w-5 h-5 text-emerald-400"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Category</h3>
                  <p className="text-sm text-gray-400">Code classification</p>
                </div>
              </div>
              <button
                onClick={() => applyAISuggestion('category')}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded transition-colors"
              >
                Use
              </button>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <span className="text-emerald-200 font-medium capitalize">
                {aiSuggestions.category || 'other'}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <i data-feather="bar-chart-2" className="w-5 h-5 text-orange-400"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Complexity</h3>
                  <p className="text-sm text-gray-400">Difficulty level</p>
                </div>
              </div>
              <button
                onClick={() => applyAISuggestion('complexity')}
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded transition-colors"
              >
                Use
              </button>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <span className="text-orange-200 font-medium capitalize">
                {aiSuggestions.complexity || 'beginner'}
              </span>
            </div>
          </div>
        </div>

        {/* Frameworks & Libraries */}
        {(aiSuggestions.frameworks?.length > 0 || aiSuggestions.libraries?.length > 0) && (
          <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <i data-feather="layers" className="w-5 h-5 text-violet-400"></i>
              </div>
              <div>
                <h3 className="font-semibold text-white">Detected Technologies</h3>
                <p className="text-sm text-gray-400">Frameworks and libraries found</p>
              </div>
            </div>
            <div className="space-y-3">
              {aiSuggestions.frameworks?.length > 0 && (
                <div>
                  <span className="text-sm text-violet-300 font-medium">Frameworks:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {aiSuggestions.frameworks.map((fw, idx) => (
                      <span key={idx} className="px-2 py-1 bg-violet-500/20 text-violet-200 rounded text-xs">
                        {fw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {aiSuggestions.libraries?.length > 0 && (
                <div>
                  <span className="text-sm text-violet-300 font-medium">Libraries:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {aiSuggestions.libraries.map((lib, idx) => (
                      <span key={idx} className="px-2 py-1 bg-violet-500/20 text-violet-200 rounded text-xs">
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

      {/* Manual Override Option */}
      <div className="border-t border-white/10 pt-6">
        <button
          onClick={() => setShowManualOverride(!showManualOverride)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <i data-feather={showManualOverride ? "chevron-up" : "chevron-down"} className="w-4 h-4"></i>
          Prefer manual entry? Skip AI suggestions
        </button>
        
        {showManualOverride && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-200 text-sm mb-3">
              You can skip these suggestions and add your own information in the next step.
            </p>
            <button
              onClick={() => {
                // Clear AI suggestions and move to next step
                setFormData(prev => ({ ...prev, description: '', tags: [], category: 'other', complexity: 'beginner' }));
              }}
              className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 text-sm rounded-lg transition-colors"
            >
              Skip AI, Enter Manually
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <button
          onClick={() => {
            // Apply all AI suggestions at once
            ['description', 'tags', 'category', 'complexity'].forEach(field => {
              if (aiSuggestions[field]) {
                applyAISuggestion(field);
              }
            });
          }}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all flex items-center gap-2"
        >
          <i data-feather="zap" className="w-4 h-4"></i>
          Apply All Suggestions
        </button>
      </div>
    </div>
  );
}
