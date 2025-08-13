// src/pages/Login.js
import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useLocation, useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/articles";

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = login(form.username.trim(), form.password);
    if (res.ok) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || "Error al iniciar sesión");
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: 420 }}>
      <h2>Iniciar Sesión</h2>
      <form
        onSubmit={handleSubmit}
        className="form-grid"
        style={{ gridTemplateColumns: "1fr" }}
      >
        <input
          name="username"
          placeholder="Usuario"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
        />
        {error && (
          <div style={{ color: "#c0392b", marginBottom: 8 }}>{error}</div>
        )}
        <button type="submit" className="button-primary">
          Entrar
        </button>
      </form>
      <p style={{ marginTop: 8, fontSize: 14 }}>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
}
