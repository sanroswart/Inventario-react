import React, { useState, useEffect } from "react";
import { generateCode } from "../utils/idGenerator";
import { exportToExcel, exportToPDF } from "../utils/exporters";

function Warehouses() {
  const empty = {
    id: generateCode("WH"), // prefijo WH para almacén
    description: "",
    status: "",
  };

  // Estados
  const [whs, setWhs] = useState([]);
  const [form, setForm] = useState(empty);
  const [editIndex, setEditIndex] = useState(null);

  // 1. Al montar, carga de localStorage
  useEffect(() => {
    const saved = localStorage.getItem("warehouses");
    if (saved) {
      setWhs(JSON.parse(saved));
    }
  }, []);

  // 2. Cada vez que `whs` cambie, guarda en localStorage
  useEffect(() => {
    localStorage.setItem("warehouses", JSON.stringify(whs));
  }, [whs]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editIndex !== null) {
      const copy = [...whs];
      copy[editIndex] = form;
      setWhs(copy);
      setEditIndex(null);
    } else {
      setWhs([...whs, form]);
    }
    setForm(empty);
  };

  const handleEdit = (i) => {
    setForm(whs[i]);
    setEditIndex(i);
  };

  const handleDelete = (i) => {
    setWhs(whs.filter((_, idx) => idx !== i));
    if (editIndex === i) {
      setEditIndex(null);
      setForm(empty);
    }
  };

  return (
    <div>
      <h2>Almacenes</h2>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button
          type="button"
          className="button-primary"
          onClick={() => exportToExcel(whs, "almacenes")}
        >
          Exportar Excel
        </button>
        <button
          type="button"
          className="button-primary"
          onClick={() => {
            const columns = [
              { header: "ID", dataKey: "id" },
              { header: "Descripción", dataKey: "description" },
              { header: "Estado", dataKey: "status" },
            ];
            exportToPDF(columns, whs, "almacenes", "Almacenes");
          }}
        >
          Exportar PDF
        </button>
      </div>
      <form onSubmit={handleSubmit} className="form-grid">
        <input
          name="id"
          placeholder="ID Almacén"
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
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          required
        >
          <option value="">— Selecciona Estado —</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
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
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {whs.map((w, i) => (
              <tr key={i}>
                <td>{w.id}</td>
                <td>{w.description}</td>
                <td>{w.status}</td>
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

export default Warehouses;
