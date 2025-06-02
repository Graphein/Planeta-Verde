import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "../styles/LoginPage.css";

function RegistrarDespesas() {
  const { token, usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    data: "",
    categoria: "",
    valor: "",
    descricao: "",
  });

  const [despesas, setDespesas] = useState([]);
  const [editando, setEditando] = useState(null);

  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    if (!token) return navigate("/");
    fetchDespesas();
  }, [token]);

  const fetchDespesas = async () => {
    try {
      const response = await fetch(`${API_BASE}/despesas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setDespesas(data);
    } catch (err) {
      toast.error("Erro ao carregar despesas");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    const url = editando ? `${API_BASE}/despesas/${editando.id}` : `${API_BASE}/despesas`;
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

      if (!response.ok) throw new Error("Erro ao salvar despesa");

      toast.success(editando ? "Despesa atualizada!" : "Despesa registrada!");
      setFormData({ data: "", categoria: "", valor: "", descricao: "" });
      setEditando(null);
      fetchDespesas();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (d) => {
    setEditando(d);
    setFormData({
      data: d.data.slice(0, 16),
      categoria: d.categoria,
      valor: d.valor,
      descricao: d.descricao || "",
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/despesas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao excluir");

      toast.success("Despesa excluída");
      setDespesas((prev) => prev.filter((d) => d.id !== id));
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
        <h1>Registrar Despesas</h1>

        <form onSubmit={enviarFormulario} className="form-container">
          <div className="form-row">
            <h3>Data:</h3>
            <input
              type="datetime-local"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <h3>Categoria:</h3>
            <input
              type="text"
              name="categoria"
              placeholder="Categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <h3>Valor:</h3>
            <input
              type="number"
              name="valor"
              placeholder="Valor"
              value={formData.valor}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <h3>Descrição:</h3>
            <input
              type="text"
              name="descricao"
              placeholder="Descrição"
              value={formData.descricao}
              onChange={handleChange}
            />
          </div>

          <button type="submit">{editando ? "Atualizar" : "Registrar"}</button>
        </form>


        <h2>Histórico de Despesas</h2>
        {despesas.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {despesas.map((d) => (
                <tr key={d.id}>
                  <td>{new Date(d.data).toLocaleString("pt-BR")}</td>
                  <td>{d.categoria}</td>
                  <td>R$ {parseFloat(d.valor).toFixed(2)}</td>
                  <td>{d.descricao || "-"}</td>
                  <td>
                    <button onClick={() => handleEdit(d)}>Editar</button>
                    <button className="deletar" onClick={() => handleDelete(d.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nenhuma despesa registrada.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default RegistrarDespesas;
