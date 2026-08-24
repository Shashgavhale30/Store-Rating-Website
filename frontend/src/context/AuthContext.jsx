import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would verify the token with the backend here.
    // For now, if we have a token and role in localStorage, we assume logged in.
    if (token && role) {
      setUser({ role }); // Simplified user object
    }
    setLoading(false);
  }, [token, role]);

  const login = (newToken, newUserInfo) => {
    setToken(newToken);
    setRole(newUserInfo.role);
    setUser(newUserInfo);
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newUserInfo.role);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
