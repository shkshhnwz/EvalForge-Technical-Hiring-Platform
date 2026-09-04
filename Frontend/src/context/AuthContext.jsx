import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && user) {
      setLoading(false);
    } else {
      // Clear inconsistent storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      setLoading(false);
    }
  }, []);

  const setSession = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const login = async (email, password) => {
    const data = await api.post('/api/users/login', { email, password });
    if (data.accessToken && data.user) {
      setSession(data.accessToken, data.user);
    }
    return data;
  };

  const registerCandidate = async ({ name, email, password }) => {
    const data = await api.post('/api/users/register', {
      name,
      email,
      passwordHash: password,
    });
    return data;
  };

  const registerOrg = async ({ name, email, password, Orgname, domain }) => {
    const data = await api.post('/api/organization/signup', {
      name,
      email,
      password,
      Orgname,
      domain: domain || undefined,
    });
    if (data.accessToken && data.user) {
      setSession(data.accessToken, data.user);
    }
    return data;
  };

  const logout = () => {
    api.post('/api/users/logout', {}).catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        registerCandidate,
        registerOrg,
        setSession,
        logout,
        isAuthenticated: !!token && !!user,
        isRecruiter: user?.role === 'recruiter' || user?.role === 'admin',
        isCandidate: user?.role === 'candidate',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
