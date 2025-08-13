// src/pages/Transactions.js
import React, { useEffect, useState } from "react";
import { generateCode } from "../utils/idGenerator";
import { exportToExcel, exportToPDF } from "../utils/exporters";

function Transactions() {
  const empty = {
    id: generateCode("TX"),
    type: "",
    articleId: "",
    date: "",
    quantity: "",
    amount: "",
    warehouseId: "", // para Entrada/Salida
    fromWarehouseId: "", // para Traslado
    toWarehouseId: "", // para Traslado
  };

  const [txs, setTxs] = useState([]);
  const [form, setForm] = useState(empty);
  const [editIndex, setEditIndex] = useState(null);

  // Listas auxiliares para selects
  const [articles, setArticles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stocks, setStocks] = useState([]); // existencias x almacén

  // ====== Carga inicial ======
  useEffect(() => {
    const savedTxs = localStorage.getItem("transactions");
    if (savedTxs) setTxs(JSON.parse(savedTxs));

    const savedArticles = localStorage.getItem("articles");
    if (savedArticles) setArticles(JSON.parse(savedArticles));

    const savedWarehouses = localStorage.getItem("warehouses");
    if (savedWarehouses) setWarehouses(JSON.parse(savedWarehouses));

    const savedStocks = localStorage.getItem("stocks");
    if (savedStocks) setStocks(JSON.parse(savedStocks));
  }, []);

  // ====== Persistencias ======
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(txs));
  }, [txs]);

  useEffect(() => {
    localStorage.setItem("articles", JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem("stocks", JSON.stringify(stocks));
  }, [stocks]);

  // ====== Helpers de inventario ======
  const findArticleIndex = (articleId) =>
    articles.findIndex((a) => a.id === articleId);

  const upsertWarehouseStock = (warehouseId, articleId, deltaQty) => {
    // Busca registro de existencias por almacén; si no existe, lo crea
    const i = stocks.findIndex(
      (s) => s.warehouseId === warehouseId && s.articleId === articleId
    );
    if (i === -1) {
      // si delta es negativo y no existe, no se puede crear negativo
      if (deltaQty < 0) return false;
      const newRow = { warehouseId, articleId, quantity: String(deltaQty) };
      setStocks((prev) => [...prev, newRow]);
      return true;
    } else {
      const current = Number(stocks[i].quantity || 0);
      const next = current + Number(deltaQty);
      if (next < 0) return false; // no permitir negativo
      const copy = [...stocks];
      copy[i] = { ...copy[i], quantity: String(next) };
      setStocks(copy);
      return true;
    }
  };

  const adjustArticleStock = (articleId, deltaQty) => {
    const idx = findArticleIndex(articleId);
    if (idx === -1) return false;
    const current = Number(articles[idx].stock || 0);
    const next = current + Number(deltaQty);
    if (next < 0) return false;
    const copy = [...articles];
    copy[idx] = { ...copy[idx], stock: String(next) };
    setArticles(copy);
    return true;
  };

  // ====== Handlers ======
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      ...empty,
      id: generateCode("TX"), // nuevo ID al resetear
    });
    setEditIndex(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones básicas
    const qty = Number(form.quantity);
    const amt = Number(form.amount || 0);
    if (qty < 0 || amt < 0) {
      alert("numero no valido.");
      return;
    }
    if (!form.type) {
      alert("Selecciona el tipo de transacción.");
      return;
    }
    if (!form.articleId) {
      alert("Selecciona un artículo.");
      return;
    }

    // Clonar listas para poder revertir ante error
    const prevArticles = [...articles];
    const prevStocks = [...stocks];

    // Lógica por tipo
    let ok = true;

    if (form.type === "Entrada") {
      // Debe venir a un almacén específico
      if (!form.warehouseId) {
        alert("Selecciona el almacén de entrada.");
        return;
      }
      // 1) Sumar al artículo
      ok = adjustArticleStock(form.articleId, qty);
      // 2) Sumar al almacén
      if (ok) ok = upsertWarehouseStock(form.warehouseId, form.articleId, qty);
    } else if (form.type === "Salida") {
      if (!form.warehouseId) {
        alert("Selecciona el almacén de salida.");
        return;
      }
      // 1) Restar del artículo (no negativo)
      ok = adjustArticleStock(form.articleId, -qty);
      // 2) Restar del almacén (no negativo)
      if (ok) ok = upsertWarehouseStock(form.warehouseId, form.articleId, -qty);
    } else if (form.type === "Traslado") {
      // Traslado entre almacenes: no cambia el stock total del artículo
      if (!form.fromWarehouseId || !form.toWarehouseId) {
        alert("Selecciona almacén origen y destino.");
        return;
      }
      if (form.fromWarehouseId === form.toWarehouseId) {
        alert("El almacén origen y destino no pueden ser el mismo.");
        return;
      }
      // 1) Restar del origen (no negativo)
      ok = upsertWarehouseStock(form.fromWarehouseId, form.articleId, -qty);
      // 2) Sumar al destino
      if (ok)
        ok = upsertWarehouseStock(form.toWarehouseId, form.articleId, qty);
      // NOTA: no tocamos articles.stock porque el total no cambia
    } else {
      // (Opcional) Ajuste u otros tipos
      alert("Tipo de transacción no soportado en esta lógica.");
      return;
    }

    if (!ok) {
      // Revertir cambios si algo salió mal (por ejemplo, saldo insuficiente)
      setArticles(prevArticles);
      setStocks(prevStocks);
      alert("Operación inválida: stock insuficiente o datos incorrectos.");
      return;
    }

    // Guardar / actualizar transacción
    if (editIndex !== null) {
      const copy = [...txs];
      copy[editIndex] = form;
      setTxs(copy);
      setEditIndex(null);
    } else {
      setTxs((prev) => [...prev, form]);
    }

    resetForm();
  };

  const handleEdit = (i) => {
    setForm(txs[i]);
    setEditIndex(i);
  };

  const handleDelete = (i) => {
    // Importante: eliminar una transacción NO revierte existencias en este ejemplo.
    // (Podrías implementar reversión leyendo el tipo y deshaciendo sus efectos)
    setTxs(txs.filter((_, idx) => idx !== i));
    if (editIndex === i) {
      resetForm();
    }
  };

  // ====== UI auxiliar según tipo ======
  const isEntrada = form.type === "Entrada";
  const isSalida = form.type === "Salida";
  const isTraslado = form.type === "Traslado";

  return (
    <div>
      <h2>Transacciones</h2>

      <form
        onSubmit={handleSubmit}
        className="form-grid"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
          <button
            type="button"
            className="button-primary"
            onClick={() => exportToExcel(txs, "transacciones")}
          >
            Exportar Excel
          </button>
          <button
            type="button"
            className="button-primary"
            onClick={() => {
              const columns = [
                { header: "ID", dataKey: "id" },
                { header: "Tipo", dataKey: "type" },
                { header: "Artículo", dataKey: "articleId" },
                { header: "Fecha", dataKey: "date" },
                { header: "Cantidad", dataKey: "quantity" },
                { header: "Monto", dataKey: "amount" },
                { header: "Almacén", dataKey: "warehouseId" },
                { header: "Origen", dataKey: "fromWarehouseId" },
                { header: "Destino", dataKey: "toWarehouseId" },
              ];
              exportToPDF(columns, txs, "transacciones", "Transacciones");
            }}
          >
            Exportar PDF
          </button>
        </div>
        <input
          name="id"
          placeholder="ID Transacción"
          value={form.id}
          onChange={handleChange}
          required
        />

        <select name="type" value={form.type} onChange={handleChange} required>
          <option value="">Tipo Transacción</option>
          <option value="Entrada">Entrada</option>
          <option value="Salida">Salida</option>
          <option value="Traslado">Traslado</option>
        </select>

        {/* Artículo */}
        <select
          name="articleId"
          value={form.articleId}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona Artículo</option>
          {articles.map((a, i) => (
            <option key={i} value={a.id}>
              {a.id} – {a.description}
            </option>
          ))}
        </select>

        {/* Fecha */}
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />

        {/* Cantidad y Monto */}
        <input
          type="number"
          name="quantity"
          placeholder="Cantidad"
          value={form.quantity}
          onChange={handleChange}
          min="0"
          required
        />
        <input
          type="number"
          name="amount"
          placeholder="Monto"
          value={form.amount}
          onChange={handleChange}
          min="0"
          step="0.01"
        />

        {/* Campos condicionales */}
        {(isEntrada || isSalida) && (
          <select
            name="warehouseId"
            value={form.warehouseId}
            onChange={handleChange}
            required
          >
            <option value="">
              {isEntrada ? "Almacén de entrada" : "Almacén de salida"}
            </option>
            {warehouses.map((w, i) => (
              <option key={i} value={w.id}>
                {w.id} – {w.description}
              </option>
            ))}
          </select>
        )}

        {isTraslado && (
          <>
            <select
              name="fromWarehouseId"
              value={form.fromWarehouseId}
              onChange={handleChange}
              required
            >
              <option value="">Almacén ORIGEN</option>
              {warehouses.map((w, i) => (
                <option key={i} value={w.id}>
                  {w.id} – {w.description}
                </option>
              ))}
            </select>

            <select
              name="toWarehouseId"
              value={form.toWarehouseId}
              onChange={handleChange}
              required
            >
              <option value="">Almacén DESTINO</option>
              {warehouses.map((w, i) => (
                <option key={i} value={w.id}>
                  {w.id} – {w.description}
                </option>
              ))}
            </select>
          </>
        )}

        <button
          type="submit"
          className="button-primary"
          style={{ gridColumn: "1 / -1" }}
        >
          {editIndex !== null ? "Guardar" : "Agregar"}
        </button>
      </form>

      <div className="table-container" style={{ marginTop: 12 }}>
        <table className="elegant-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Artículo</th>
              <th>Fecha</th>
              <th>Cantidad</th>
              <th>Monto</th>
              <th>Almacén</th>
              <th>Origen</th>
              <th>Destino</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((tx, i) => (
              <tr key={i}>
                <td>{tx.id}</td>
                <td>{tx.type}</td>
                <td>{tx.articleId}</td>
                <td>{tx.date}</td>
                <td>{tx.quantity}</td>
                <td>{tx.amount}</td>
                <td>{tx.warehouseId || ""}</td>
                <td>{tx.fromWarehouseId || ""}</td>
                <td>{tx.toWarehouseId || ""}</td>
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

      <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
        * Nota: borrar/editar transacciones no ajusta automáticamente
        existencias pasadas en este ejemplo. Para un control contable estricto,
        implementa reversión al editar/eliminar.
      </p>
    </div>
  );
}

export default Transactions;
