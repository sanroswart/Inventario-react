// src/pages/Articles.js
import React, { useState, useEffect } from "react";
function Articles() {
  const empty = {
    id: "",
    description: "",
    stock: "",
    typeId: "",
    cost: "",
    status: "",
  };
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("articles");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("articles", JSON.stringify(items));
  }, [items]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editIndex !== null) {
      const copy = [...items];
      copy[editIndex] = form;
      setItems(copy);
      setEditIndex(null);
    } else {
      setItems([...items, form]);
    }
    setForm(empty);
  };

  const handleEdit = (i) => {
    setForm(items[i]);
    setEditIndex(i);
  };

  const handleDelete = (i) => {
    setItems(items.filter((_, idx) => idx !== i));
    if (editIndex === i) {
      setEditIndex(null);
      setForm(empty);
    }
  };

  return (
    <div>
      <h2>Artículos</h2>

      {/* Formulario en grid */}
      <form onSubmit={handleSubmit} className="form-grid">
        <input
          name="id"
          placeholder="Identificador"
          value={form.id}
          onChange={handleChange}
          required
        />
        <input
          name="description"
          placeholder="Descripción"
          value={form.description}
          onChange={handleChange}
          required
        />
        <input
          name="stock"
          placeholder="Existencia"
          value={form.stock}
          onChange={handleChange}
          required
        />
        <input
          name="typeId"
          placeholder="Tipo Inventario ID"
          value={form.typeId}
          onChange={handleChange}
          required
        />
        <input
          name="cost"
          placeholder="Costo Unitario"
          value={form.cost}
          onChange={handleChange}
          required
        />
        <input
          name="status"
          placeholder="Estado"
          value={form.status}
          onChange={handleChange}
          required
        />
        <button type="submit" className="button-primary">
          {editIndex !== null ? "Guardar" : "Agregar"}
        </button>
      </form>

      {/* Tabla con scroll horizontal */}
      <div className="table-container">
        <table className="elegant-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Descripción</th>
              <th>Existencia</th>
              <th>Tipo ID</th>
              <th>Costo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td>{it.id}</td>
                <td>{it.description}</td>
                <td>{it.stock}</td>
                <td>{it.typeId}</td>
                <td>{it.cost}</td>
                <td>{it.status}</td>
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

export default Articles;
