import React from "react";
import { NavLink } from "react-router-dom";

function Menu() {
  return (
    <nav className="navbar">
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
    </nav>
  );
}

export default Menu;
