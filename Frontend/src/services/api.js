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

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const attemptTokenRefresh = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const res = await fetch(getFullUrl('/api/users/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken })
    });

    if (!res.ok) throw new Error('Refresh failed');
    const data = await res.json();
    if (data.accessToken) {
      localStorage.setItem('token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      return data.accessToken;
    }
  } catch {
    // If refresh fails, clear session
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
  return null;
};

const executeWithAuth = async (requestFn, isRetry = false) => {
  try {
    return await requestFn();
  } catch (err) {
    // Check if 401 Unauthorized and not already retrying or an auth route
    if (err.status === 401 && !isRetry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (newToken) {
              resolve(requestFn());
            } else {
              reject(err);
            }
          });
        });
      }

      isRefreshing = true;
      const newToken = await attemptTokenRefresh();
      isRefreshing = false;

      if (newToken) {
        onRefreshed(newToken);
        return await requestFn();
      } else {
        onRefreshed(null);
        throw err;
      }
    }
    throw err;
  }
};

export const api = {
  async get(endpoint) {
    return executeWithAuth(async () => {
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
    });
  },

  async post(endpoint, data) {
    const isAuthRoute = endpoint.includes('/api/users/login') || endpoint.includes('/api/users/refresh');
    const call = async () => {
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
    };

    if (isAuthRoute) return call();
    return executeWithAuth(call);
  },

  async put(endpoint, data) {
    return executeWithAuth(async () => {
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
    });
  },

  async upload(endpoint, formData) {
    return executeWithAuth(async () => {
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
    });
  },

  async download(endpoint, filename = 'download.csv') {
    return executeWithAuth(async () => {
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
    });
  }
};

export default api;
