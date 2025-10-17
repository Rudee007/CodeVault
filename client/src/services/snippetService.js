// src/services/snippetService.js
import api from './api';

export const snippetService = {
  // Enhanced search with all filters
  searchSnippets: (params = {}) => {
    const searchParams = new URLSearchParams();
    
    // Add all search parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(','));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    
    return api.get(`/snippets/search?${searchParams.toString()}`);
  },

  // Get trending snippets  
  getTrending: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/snippets/trending?${searchParams.toString()}`);
  },

  // AI generation - matches your backend controller
  generateAI: (data) => {
    return api.post('/snippets/ai/generate', data);
  },

  // Standard CRUD operations
  createSnippet: (data) => {
    console.log('🔧 snippetService.createSnippet called with:', data);
    return api.post('/snippets', data);
  },

  getSnippets: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    return api.get(`/snippets?${searchParams.toString()}`);
  },

  getSnippet: (id) => {
    return api.get(`/snippets/${id}`);
  },

  updateSnippet: (id, data) => {
    console.log('🔧 snippetService.updateSnippet called with:', id, data);
    return api.put(`/snippets/${id}`, data);
  },

  deleteSnippet: (id) => {
    return api.delete(`/snippets/${id}`);
  },

  copySnippet: (id) => {
    return api.post(`/snippets/${id}/copy`);
  },

  getMySnippets: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/snippets/user/me?${searchParams.toString()}`);
  }
};

export default snippetService;
