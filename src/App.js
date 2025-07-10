import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Menu from "./components/Menu";
import Articles from "./pages/Articles";
import InventoryTypes from "./pages/InventoryTypes";
import Warehouses from "./pages/Warehouses";
import Stock from "./pages/Stock";
import Transactions from "./pages/Transactions";

function App() {
  return (
    <div className="app-container">
      <Router>
        <Menu />
        <Routes>
          <Route path="/articles" element={<Articles />} />
          <Route path="/inventory-types" element={<InventoryTypes />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="*" element={<Navigate to="/articles" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
