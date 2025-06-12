import React, { useState, useEffect } from "react";

function Stock() {
  const empty = { warehouseId: "", articleId: "", quantity: "" };

  // Estados
  const [stocks, setStocks] = useState([]);
  const [form, setForm] = useState(empty);
  const [editIndex, setEditIndex] = useState(null);

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

      <form onSubmit={handleSubmit} className="form-grid">
        <input
          name="warehouseId"
          placeholder="ID Almacén"
          value={form.warehouseId}
          onChange={handleChange}
          required
        />
        <input
          name="articleId"
          placeholder="ID Artículo"
          value={form.articleId}
          onChange={handleChange}
          required
        />
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
