// src/pages/Register.js
import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const res = register(form.username.trim(), form.password);
    if (res.ok) {
      alert("Usuario creado. Ahora inicia sesión.");
      navigate("/login", { replace: true });
    } else {
      setError(res.error || "No se pudo registrar");
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: 420 }}>
      <h2>Crear cuenta</h2>
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
          placeholder="Contraseña (mín. 4)"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirm"
          placeholder="Repetir contraseña"
          value={form.confirm}
          onChange={handleChange}
          required
        />
        {error && (
          <div style={{ color: "#c0392b", marginBottom: 8 }}>{error}</div>
        )}
        <button type="submit" className="button-primary">
          Registrar
        </button>
      </form>
      <p style={{ marginTop: 8, fontSize: 14 }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}
