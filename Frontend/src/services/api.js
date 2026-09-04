// Central API Service Client
export const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const getFullUrl = (endpoint) => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${BASE_URL}${cleanEndpoint}`;
};

const getAuthHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  async get(endpoint) {
    const res = await fetch(getFullUrl(endpoint), {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const error = new Error(errData.message || `HTTP error ${res.status}`);
      error.status = res.status;
      error.data = errData;
      throw error;
    }
    return res.json();
  },

  async post(endpoint, data) {
    const res = await fetch(getFullUrl(endpoint), {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const error = new Error(errData.message || `HTTP error ${res.status}`);
      error.status = res.status;
      error.data = errData;
      throw error;
    }
    return res.json();
  },

  async put(endpoint, data) {
    const res = await fetch(getFullUrl(endpoint), {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const error = new Error(errData.message || `HTTP error ${res.status}`);
      error.status = res.status;
      error.data = errData;
      throw error;
    }
    return res.json();
  },

  async upload(endpoint, formData) {
    const res = await fetch(getFullUrl(endpoint), {
      method: 'POST',
      headers: getAuthHeaders(true),
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const error = new Error(errData.message || `HTTP error ${res.status}`);
      error.status = res.status;
      error.data = errData;
      throw error;
    }
    return res.json();
  },

  async download(endpoint, filename = 'download.csv') {
    const res = await fetch(getFullUrl(endpoint), {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
};

export default api;
