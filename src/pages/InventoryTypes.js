import React, { useState, useEffect } from "react";

function InventoryTypes() {
  const empty = { id: "", description: "", account: "", status: "" };

  // Estados
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState(empty);
  const [editIndex, setEditIndex] = useState(null);

  // 1. Al montar, carga de localStorage
  useEffect(() => {
    const saved = localStorage.getItem("inventoryTypes");
    if (saved) {
      setTypes(JSON.parse(saved));
    }
  }, []);

  // 2. Cada vez que `types` cambie, guarda en localStorage
  useEffect(() => {
    localStorage.setItem("inventoryTypes", JSON.stringify(types));
  }, [types]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editIndex !== null) {
      const copy = [...types];
      copy[editIndex] = form;
      setTypes(copy);
      setEditIndex(null);
    } else {
      setTypes([...types, form]);
    }
    setForm(empty);
  };

  const handleEdit = (i) => {
    setForm(types[i]);
    setEditIndex(i);
  };

  const handleDelete = (i) => {
    setTypes(types.filter((_, idx) => idx !== i));
    if (editIndex === i) {
      setEditIndex(null);
      setForm(empty);
    }
  };

  return (
    <div>
      <h2>Tipos de Inventario</h2>

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
          name="account"
          placeholder="Cuenta Contable"
          value={form.account}
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

      <div className="table-container">
        <table className="elegant-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Descripción</th>
              <th>Cuenta</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {types.map((t, i) => (
              <tr key={i}>
                <td>{t.id}</td>
                <td>{t.description}</td>
                <td>{t.account}</td>
                <td>{t.status}</td>
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

export default InventoryTypes;
