// src/components/TagManager.jsx
import React, { useState } from "react";
import feather from "feather-icons";

export default function TagManager({ 
  label, 
  tags, 
  onChange, 
  placeholder, 
  maxTags = 20,
  suggestions = [] 
}) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  React.useEffect(() => {
    feather.replace();
  }, [tags]);

  const addTag = (tag) => {
    const cleanTag = tag.toLowerCase().trim();
    if (cleanTag && !tags.includes(cleanTag) && tags.length < maxTags) {
      onChange([...tags, cleanTag]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      !tags.includes(suggestion) && 
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} ({tags.length}/{maxTags})
      </label>
      
      {/* Tag Display */}
      <div className="flex flex-wrap gap-2 mb-3 min-h-[2rem]">
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm rounded-md"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-red-400 transition-colors"
            >
              <i data-feather="x" className="w-3 h-3"></i>
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400"
          placeholder={tags.length >= maxTags ? `Maximum ${maxTags} tags reached` : placeholder}
          disabled={tags.length >= maxTags}
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/10 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {filteredSuggestions.slice(0, 8).map(suggestion => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="w-full px-3 py-2 text-left text-gray-300 hover:bg-white/10 transition-colors"
              >
                #{suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {tags.length >= maxTags && (
        <div className="text-xs text-amber-400 mt-1">
          Maximum tags reached. Remove some tags to add new ones.
        </div>
      )}
    </div>
  );
}
