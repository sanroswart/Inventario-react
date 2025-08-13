import React, { useState, useEffect } from "react";
import { generateCode } from "../utils/idGenerator";
import { exportToExcel, exportToPDF } from "../utils/exporters";

function Stock() {
  const empty = {
    id: generateCode("STK"), // opcional
    warehouseId: "",
    articleId: "",
    quantity: "",
  };

  // Estados
  const [stocks, setStocks] = useState([]);
  const [form, setForm] = useState(empty);
  const [editIndex, setEditIndex] = useState(null);
  const [articles, setArticles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    const savedArticles = localStorage.getItem("articles");
    const savedWarehouses = localStorage.getItem("warehouses");
    if (savedArticles) setArticles(JSON.parse(savedArticles));
    if (savedWarehouses) setWarehouses(JSON.parse(savedWarehouses));
  }, []);

  // 1. Al montar, carga de localStorage
  useEffect(() => {
    const saved = localStorage.getItem("stocks");
    if (saved) {
      setStocks(JSON.parse(saved));
    }
  }, []);

  // 2. Cada vez que `stocks` cambie, guarda en localStorage
  useEffect(() => {
    localStorage.setItem("stocks", JSON.stringify(stocks));
  }, [stocks]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(form.quantity) < 0) {
      alert("numero no valido.");
      return;
    }
    if (editIndex !== null) {
      const copy = [...stocks];
      copy[editIndex] = form;
      setStocks(copy);
      setEditIndex(null);
    } else {
      setStocks([...stocks, form]);
    }
    setForm(empty);
  };

  const handleEdit = (i) => {
    setForm(stocks[i]);
    setEditIndex(i);
  };

  const handleDelete = (i) => {
    setStocks(stocks.filter((_, idx) => idx !== i));
    if (editIndex === i) {
      setEditIndex(null);
      setForm(empty);
    }
  };

  return (
    <div>
      <h2>Existencias por Almacén</h2>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button
          type="button"
          className="button-primary"
          onClick={() => exportToExcel(stocks, "existencias")}
        >
          Exportar Excel
        </button>
        <button
          type="button"
          className="button-primary"
          onClick={() => {
            const columns = [
              { header: "ID Almacén", dataKey: "warehouseId" },
              { header: "ID Artículo", dataKey: "articleId" },
              { header: "Cantidad", dataKey: "quantity" },
            ];
            exportToPDF(
              columns,
              stocks,
              "existencias",
              "Existencias por Almacén"
            );
          }}
        >
          Exportar PDF
        </button>
      </div>
      <form onSubmit={handleSubmit} className="form-grid">
        <select
          name="warehouseId"
          value={form.warehouseId}
          onChange={handleChange}
          required
        >
          <option value="">Elige un almacén</option>
          {warehouses.map((w, i) => (
            <option key={i} value={w.id}>
              {w.id} – {w.description}
            </option>
          ))}
        </select>

        <select
          name="articleId"
          value={form.articleId}
          onChange={handleChange}
          required
        >
          <option value="">Elige un artículo</option>
          {articles.map((a, i) => (
            <option key={i} value={a.id}>
              {a.id} – {a.description}
            </option>
          ))}
        </select>
        <input
          name="quantity"
          placeholder="Cantidad"
          value={form.quantity}
          onChange={handleChange}
          required
        />
        <button type="submit" className="button-primary">
          {editIndex !== null ? "Guardar" : "Agregar"}
        </button>
      </form>

      <div className="table-container">
        <table className="elegant-table">
          <thead>
            <tr>
              <th>ID Almacén</th>
              <th>ID Artículo</th>
              <th>Cantidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((s, i) => (
              <tr key={i}>
                <td>{s.warehouseId}</td>
                <td>{s.articleId}</td>
                <td>{s.quantity}</td>
                <td>
                  <button
                    onClick={() => handleEdit(i)}
                    className="action-btn action-edit"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(i)}
                    className="action-btn action-delete"
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Stock;
