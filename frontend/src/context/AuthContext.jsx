// src/context/AuthContext.jsx
// Gerencia o estado de autenticação globalmente

import { createContext, useContext, useState, useCallback } from "react";
import { authAPI } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Inicializa do localStorage (persiste o login entre recarregamentos)
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("@buscape:user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async ({ email, password }) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem("@buscape:token", data.token);
    localStorage.setItem("@buscape:user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const { data } = await authAPI.register({ name, email, password });
    localStorage.setItem("@buscape:token", data.token);
    localStorage.setItem("@buscape:user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("@buscape:token");
    localStorage.removeItem("@buscape:user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto facilmente
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve estar dentro de AuthProvider");
  return ctx;
}
