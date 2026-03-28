import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

// Generate session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('uuai_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('uuai_session_id', sessionId);
  }
  return sessionId;
};

// Search API
export const searchAPI = async (question) => {
  try {
    const response = await axios.post(`${API}/search`, {
      question,
      sessionId: getSessionId()
    });
    return response.data;
  } catch (error) {
    console.error('Search API error:', error);
    throw new Error(
      error.response?.data?.detail || 'Arama sırasında bir hata oluştu'
    );
  }
};

// Get recent searches
export const getRecentSearches = async (limit = 5) => {
  try {
    const response = await axios.get(`${API}/search/recent/${getSessionId()}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Recent searches API error:', error);
    return [];
  }
};

// Get popular searches
export const getPopularSearches = async (limit = 10) => {
  try {
    const response = await axios.get(`${API}/search/popular?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Popular searches API error:', error);
    return [];
  }
};

export default {
  searchAPI,
  getRecentSearches,
  getPopularSearches,
  getSessionId
};