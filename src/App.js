// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthProvider from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Menu from "./components/Menu";
import Articles from "./pages/Articles";
import InventoryTypes from "./pages/InventoryTypes";
import Warehouses from "./pages/Warehouses";
import Stock from "./pages/Stock";
import Transactions from "./pages/Transactions";
import Login from "./pages/Login";
import Register from "./pages/Register"; // 👈 NUEVO

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Router>
          <Menu />
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} /> {/* 👈 NUEVO */}
            {/* Rutas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/articles" element={<Articles />} />
              <Route path="/inventory-types" element={<InventoryTypes />} />
              <Route path="/warehouses" element={<Warehouses />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/transactions" element={<Transactions />} />
            </Route>
            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/articles" replace />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
