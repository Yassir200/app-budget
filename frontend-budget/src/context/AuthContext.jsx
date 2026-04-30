import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // verifier si un token existe au chargement de l'application
  useEffect(() => {
    if (token) {
      setUser({ authenticated: true }); 
    }
  }, [token]);

  // fct pour connecter l'utilisateur et sauvegarder le token
  const login = (newToken) => {
    localStorage.setItem('token', newToken); 
    setToken(newToken);
    setUser({ authenticated: true });
  };

  // fct pour deconnecter l'utilisateur et vider le cache
  const logout = () => {
    localStorage.removeItem('token'); 
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};