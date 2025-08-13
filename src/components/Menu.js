// src/components/Menu.js
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Menu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null; // si no hay sesión, no mostramos el menú

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar" style={{ justifyContent: "space-between" }}>
      <div>
        <NavLink
          to="/articles"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Artículos
        </NavLink>
        <NavLink
          to="/inventory-types"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Tipos Inventario
        </NavLink>
        <NavLink
          to="/warehouses"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Almacenes
        </NavLink>
        <NavLink
          to="/stock"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Existencias
        </NavLink>
        <NavLink
          to="/transactions"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Transacciones
        </NavLink>
      </div>
      <button onClick={handleLogout} className="button-primary">
        Salir
      </button>
    </nav>
  );
}

export default Menu;
