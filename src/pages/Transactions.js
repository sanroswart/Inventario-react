import React, { useState, useEffect } from "react";
import { generateCode } from "../utils/idGenerator";

function Transactions() {
  const empty = {
    id: generateCode("TX"), // TX-XXXXXX
    type: "",
    articleId: "",
    date: "",
    quantity: "",
    amount: "",
  };
  const [txs, setTxs] = useState([]);
  const [form, setForm] = useState(empty);
  const [editIndex, setEditIndex] = useState(null);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const savedArticles = localStorage.getItem("articles");
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    }
  }, []);

  // 1) Carga desde localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem("transactions");
    if (saved) setTxs(JSON.parse(saved));
  }, []);

  // 2) Guarda en localStorage cada vez que txs cambie
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(txs));
  }, [txs]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(form.quantity) < 0 || Number(form.amount) < 0) {
      alert("numero no valido.");
      return;
    }
    if (editIndex !== null) {
      const copy = [...txs];
      copy[editIndex] = form;
      setTxs(copy);
      setEditIndex(null);
    } else {
      setTxs([...txs, form]);
    }
    setForm(empty);
  };
  const handleEdit = (i) => {
    setForm(txs[i]);
    setEditIndex(i);
  };
  const handleDelete = (i) => {
    setTxs(txs.filter((_, idx) => idx !== i));
    if (editIndex === i) {
      setEditIndex(null);
      setForm(empty);
    }
  };

  return (
    <div>
      <h2>Transacciones</h2>

      <form onSubmit={handleSubmit} className="form-grid">
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
          <option value="Ajuste">Ajuste</option>
        </select>
        <select
          name="articleId"
          value={form.articleId}
          onChange={handleChange}
          required
        >
          <option value="">— Selecciona Artículo —</option>
          {articles.map((a, i) => (
            <option key={i} value={a.id}>
              {a.id} – {a.description}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="date"
          value={form.date}
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
        <input
          name="amount"
          placeholder="Monto"
          value={form.amount}
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
              <th>Tipo</th>
              <th>ID Artículo</th>
              <th>Fecha</th>
              <th>Cantidad</th>
              <th>Monto</th>
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

export default Transactions;
