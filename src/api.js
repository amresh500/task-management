// src/api.js
const API_BASE = 'http://localhost:5217'; // Or import from config

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Unauthorized: clear auth and reload to login
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
    throw new Error('Unauthorized - please login again.');
  }

  return response;
}
