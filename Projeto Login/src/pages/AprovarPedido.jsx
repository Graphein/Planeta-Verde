import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

function AprovarPedido() {
  const { token, usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);

  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    if (!token) return navigate("/");
    fetchPedidos();
  }, [token]);

  const fetchPedidos = async () => {
    try {
      const response = await fetch(`${API_BASE}/pedidos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPedidos(data.filter(p => p.status.toLowerCase() === "pendente"));
    } catch (err) {
      toast.error("Erro ao carregar pedidos");
    }
  };

  const aprovarPedido = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/pedidos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Aprovado" }),
      });

      if (!response.ok) throw new Error("Erro ao aprovar pedido");

      toast.success("Pedido aprovado!");
      fetchPedidos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const recusarPedido = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/pedidos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Recusado" }),
      });

      if (!response.ok) throw new Error("Erro ao recusar pedido");

      toast.success("Pedido recusado.");
      fetchPedidos();
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
        <h1>Aprovar Pedidos</h1>
        {pedidos.length === 0 ? (
          <p>Nenhum pedido pendente.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Item</th>
                <th>Quantidade</th>
                <th>Solicitante</th>
                <th>Observações</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td>{new Date(pedido.data).toLocaleString("pt-BR")}</td>
                  <td>{pedido.item}</td>
                  <td>{pedido.quantidade}</td>
                  <td>{pedido.solicitante}</td>
                  <td>{pedido.observacoes || "-"}</td>
                  <td>
                    <button className="deletar" onClick={() => handleDelete(p.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default AprovarPedido;
