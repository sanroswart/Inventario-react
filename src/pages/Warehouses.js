// src/pages/Warehouses.js
import React, { useState, useEffect } from "react";
import { exportToExcelSheets, exportToPDFTables } from "../utils/exporters";

function Warehouses() {
  const empty = { id: "", description: "", status: "" };

  // CRUD almacenes
  const [whs, setWhs] = useState([]);
  const [form, setForm] = useState(empty);
  const [editIndex, setEditIndex] = useState(null);

  // NUEVO: datos para visualizar movimientos y existencias
  const [txs, setTxs] = useState([]); // transacciones
  const [stocks, setStocks] = useState([]); // existencias x almacén
  const [articles, setArticles] = useState([]); // para mostrar descripción de artículos
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");

  // ===== CARGA INICIAL =====
  useEffect(() => {
    const savedWhs = localStorage.getItem("warehouses");
    if (savedWhs) setWhs(JSON.parse(savedWhs));

    const savedTxs = localStorage.getItem("transactions");
    if (savedTxs) setTxs(JSON.parse(savedTxs));

    const savedStocks = localStorage.getItem("stocks");
    if (savedStocks) setStocks(JSON.parse(savedStocks));

    const savedArticles = localStorage.getItem("articles");
    if (savedArticles) setArticles(JSON.parse(savedArticles));
  }, []);

  // Persistencia almacenes
  useEffect(() => {
    localStorage.setItem("warehouses", JSON.stringify(whs));
  }, [whs]);

  // ===== CRUD HANDLERS =====
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
    // Si se borra el almacén seleccionado, limpia la vista
    if (selectedWarehouseId && whs[i]?.id === selectedWarehouseId) {
      setSelectedWarehouseId("");
    }
  };

  // ===== HELPERS VISUALES =====
  const articleDesc = (articleId) => {
    const a = articles.find((x) => x.id === articleId);
    return a ? a.description : "";
  };

  // Movimientos que afectan a un almacén
  const getWarehouseMovements = (warehouseId) => {
    if (!warehouseId) return [];
    const list = [];

    for (const tx of txs) {
      if (!tx.type || !tx.articleId || !tx.quantity) continue;
      const qty = Number(tx.quantity);

      if (tx.type === "Entrada" && tx.warehouseId === warehouseId) {
        list.push({
          id: tx.id,
          date: tx.date,
          articleId: tx.articleId,
          articleDesc: articleDesc(tx.articleId),
          type: "Entrada",
          sign: "+",
          quantity: qty,
        });
      } else if (tx.type === "Salida" && tx.warehouseId === warehouseId) {
        list.push({
          id: tx.id,
          date: tx.date,
          articleId: tx.articleId,
          articleDesc: articleDesc(tx.articleId),
          type: "Salida",
          sign: "−",
          quantity: qty,
        });
      } else if (tx.type === "Traslado") {
        if (tx.fromWarehouseId === warehouseId) {
          list.push({
            id: tx.id,
            date: tx.date,
            articleId: tx.articleId,
            articleDesc: articleDesc(tx.articleId),
            type: "Traslado (origen)",
            sign: "−",
            quantity: qty,
          });
        }
        if (tx.toWarehouseId === warehouseId) {
          list.push({
            id: tx.id,
            date: tx.date,
            articleId: tx.articleId,
            articleDesc: articleDesc(tx.articleId),
            type: "Traslado (destino)",
            sign: "+",
            quantity: qty,
          });
        }
      }
    }

    // Orden opcional por fecha (si existe)
    return list.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  };

  // Existencias actuales en el almacén (según stocks)
  const getWarehouseStocks = (warehouseId) => {
    if (!warehouseId) return [];
    return stocks
      .filter((s) => s.warehouseId === warehouseId)
      .map((s) => ({
        articleId: s.articleId,
        articleDesc: articleDesc(s.articleId),
        quantity: s.quantity,
      }))
      .sort((a, b) => a.articleId.localeCompare(b.articleId));
  };

  const movements = getWarehouseMovements(selectedWarehouseId);
  const whStocks = getWarehouseStocks(selectedWarehouseId);

  return (
    <div>
      <h2>Almacenes</h2>

      {/* Formulario */}
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

      {/* Tabla de almacenes */}
      <div className="table-container">
        <table className="elegant-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th style={{ minWidth: 260 }}>Acciones</th>
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
                  <button
                    onClick={() => setSelectedWarehouseId(w.id)}
                    className="action-btn action-edit"
                    style={{ marginLeft: 8 }}
                  >
                    Ver movimientos
                  </button>
                </td>
              </tr>
            ))}
            {whs.length === 0 && (
              <tr>
                <td colSpan={4}>No hay almacenes registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Panel de detalle del almacén seleccionado */}
      {selectedWarehouseId && (
        <>
          <h3 style={{ marginTop: 18 }}>
            Detalle de almacén:{" "}
            <span style={{ color: "#2c3e50" }}>{selectedWarehouseId}</span>
          </h3>
          <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
            {/* Excel: una hoja con existencias y otra con movimientos */}
            <button
              type="button"
              className="button-primary"
              onClick={() =>
                exportToExcelSheets(
                  [
                    { name: `Stocks_${selectedWarehouseId}`, data: whStocks },
                    { name: `Movs_${selectedWarehouseId}`, data: movements },
                  ],
                  `almacen_${selectedWarehouseId}`
                )
              }
            >
              Exportar Excel (detalle)
            </button>

            {/* PDF: dos tablas en el mismo PDF */}
            <button
              type="button"
              className="button-primary"
              onClick={() => {
                const tables = [
                  {
                    title: `Existencias actuales (${selectedWarehouseId})`,
                    columns: [
                      { header: "Artículo", dataKey: "articleId" },
                      { header: "Descripción", dataKey: "articleDesc" },
                      { header: "Cantidad", dataKey: "quantity" },
                    ],
                    rows: whStocks,
                  },
                  {
                    title: `Movimientos (${selectedWarehouseId})`,
                    columns: [
                      { header: "Fecha", dataKey: "date" },
                      { header: "ID Tx", dataKey: "id" },
                      { header: "Tipo", dataKey: "type" },
                      { header: "Artículo", dataKey: "articleId" },
                      { header: "Descripción", dataKey: "articleDesc" },
                      { header: "Signo", dataKey: "sign" },
                      { header: "Cantidad", dataKey: "quantity" },
                    ],
                    rows: movements,
                  },
                ];
                exportToPDFTables({
                  filename: `almacen_${selectedWarehouseId}`,
                  reportTitle: `Detalle de Almacén ${selectedWarehouseId}`,
                  tables,
                });
              }}
            >
              Exportar PDF (detalle)
            </button>
          </div>

          {/* Existencias actuales en este almacén */}
          <div className="table-container" style={{ marginTop: 8 }}>
            <table className="elegant-table">
              <thead>
                <tr>
                  <th>Artículo</th>
                  <th>Descripción</th>
                  <th>Cantidad actual</th>
                </tr>
              </thead>
              <tbody>
                {whStocks.map((s, i) => (
                  <tr key={i}>
                    <td>{s.articleId}</td>
                    <td>{s.articleDesc}</td>
                    <td>{s.quantity}</td>
                  </tr>
                ))}
                {whStocks.length === 0 && (
                  <tr>
                    <td colSpan={3}>
                      Este almacén no tiene existencias registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Movimientos que afectaron a este almacén */}
          <h4 style={{ marginTop: 16 }}>Movimientos</h4>
          <div className="table-container">
            <table className="elegant-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>ID Tx</th>
                  <th>Tipo</th>
                  <th>Artículo</th>
                  <th>Descripción</th>
                  <th>Signo</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m, i) => (
                  <tr key={i}>
                    <td>{m.date}</td>
                    <td>{m.id}</td>
                    <td>{m.type}</td>
                    <td>{m.articleId}</td>
                    <td>{m.articleDesc}</td>
                    <td style={{ fontWeight: 700 }}>{m.sign}</td>
                    <td>{m.quantity}</td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={7}>No hay movimientos para este almacén.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button
            className="action-btn action-delete"
            style={{ marginTop: 10 }}
            onClick={() => setSelectedWarehouseId("")}
          >
            Cerrar detalle
          </button>
        </>
      )}
    </div>
  );
}

export default Warehouses;
