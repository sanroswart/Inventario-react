// src/auth/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { username }
  const [loading, setLoading] = useState(true);

  // Mantener sesión entre recargas
  useEffect(() => {
    const saved = localStorage.getItem("auth_user");
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  // ✅ Registrar usuario en localStorage
  const register = (username, password) => {
    if (!username || !password) {
      return { ok: false, error: "Completa usuario y contraseña" };
    }
    if (password.length < 4) {
      return {
        ok: false,
        error: "La contraseña debe tener al menos 4 caracteres",
      };
    }

    const existing = JSON.parse(localStorage.getItem("registeredUser"));
    if (existing && existing.username === username) {
      return { ok: false, error: "Ese usuario ya existe" };
    }

    localStorage.setItem(
      "registeredUser",
      JSON.stringify({ username, password })
    );
    return { ok: true };
  };

  // ✅ Login validando contra lo registrado
  const login = (username, password) => {
    const saved = JSON.parse(localStorage.getItem("registeredUser"));
    if (saved && saved.username === username && saved.password === password) {
      const u = { username };
      setUser(u);
      localStorage.setItem("auth_user", JSON.stringify(u)); // “sesión iniciada”
      return { ok: true };
    }
    return { ok: false, error: "Usuario o contraseña incorrectos" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
