import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast";
import "../styles/LoginPage.css";

function RealizarPedido() {
  const { token, usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    data: "",
    item: "",
    quantidade: "",
    solicitante: "",
    status: "",
    observacoes: "",
  });

  const [pedidos, setPedidos] = useState([]);
  const [editando, setEditando] = useState(null);

  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    if (!token) {
      return navigate("/");
    }
    fetchPedidos();
  }, [token]);

  const fetchPedidos = async () => {
    try {
      const response = await fetch(`${API_BASE}/pedidos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Erro ao carregar pedidos");
      const data = await response.json();
      setPedidos(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editando ? `${API_BASE}/pedidos/${editando.id}` : `${API_BASE}/pedidos`;
    const metodo = editando ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Erro ao salvar pedido");

      toast.success(editando ? "Pedido atualizado!" : "Pedido realizado!");
      setFormData({
        data: "",
        item: "",
        quantidade: "",
        solicitante: "",
        status: "",
        observacoes: "",
      });
      setEditando(null);
      fetchPedidos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (pedido) => {
    setEditando(pedido);
    setFormData({
      data: pedido.data.slice(0, 16),
      item: pedido.item,
      quantidade: pedido.quantidade,
      solicitante: pedido.solicitante,
      status: pedido.status,
      observacoes: pedido.observacoes || "",
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/pedidos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Erro ao excluir pedido");

      toast.success("Pedido excluído!");
      setPedidos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="page-container">
      <Header usuario={usuario} onLogout={logout} />
      <Menu logout={logout} />
      <div className="container">
        <Toaster position="top-center" />
        <h1>Realizar Pedido</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="datetime-local"
            name="data"
            value={formData.data}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="item"
            placeholder="Item solicitado"
            value={formData.item}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="quantidade"
            placeholder="Quantidade"
            value={formData.quantidade}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="solicitante"
            placeholder="Solicitante"
            value={formData.solicitante}
            onChange={handleChange}
            required
          />
          <select name="status" value={formData.status} onChange={handleChange} required>
            <option value="">Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Rejeitado">Rejeitado</option>
          </select>
          <input
            type="text"
            name="observacoes"
            placeholder="Observações"
            value={formData.observacoes}
            onChange={handleChange}
          />
          <button type="submit">{editando ? "Atualizar" : "Enviar Pedido"}</button>
        </form>

        <h2>Pedidos Realizados</h2>
        {pedidos.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Item</th>
                <th>Qtd</th>
                <th>Solicitante</th>
                <th>Status</th>
                <th>Observações</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.data).toLocaleString("pt-BR")}</td>
                  <td>{p.item}</td>
                  <td>{p.quantidade}</td>
                  <td>{p.solicitante}</td>
                  <td>{p.status}</td>
                  <td>{p.observacoes || "-"}</td>
                  <td>
                    <button className="editar" onClick={() => handleEdit(p)}>Editar</button>
                    <button className="deletar" onClick={() => handleDelete(p.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nenhum pedido registrado.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default RealizarPedido;
