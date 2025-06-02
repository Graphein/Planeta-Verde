import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast";
import "../styles/LoginPage.css";

function AtualizarCaixa() {
  const { token, usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    data: "",
    tipo: "",
    valor: "",
    descricao: "",
  });

  const [registros, setRegistros] = useState([]);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    if (!token) {
      setError("Usuário não autenticado.");
      return navigate("/");
    }
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE}/caixa`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Erro ao carregar");
      const data = await response.json();
      setRegistros(data);
    } catch (err) {
      toast.error("Erro ao buscar dados do caixa");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    const url = editando ? `${API_BASE}/caixa/${editando.id}` : `${API_BASE}/caixa`;
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

      if (!response.ok) throw new Error("Erro ao salvar dados");

      toast.success(editando ? "Caixa atualizado!" : "Movimento registrado!");
      setFormData({ data: "", tipo: "", valor: "", descricao: "" });
      setEditando(null);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (registro) => {
    setEditando(registro);
    setFormData({
      data: registro.data.slice(0, 16),
      tipo: registro.tipo,
      valor: registro.valor,
      descricao: registro.descricao || "",
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/caixa/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao excluir");

      toast.success("Registro excluído");
      setRegistros((prev) => prev.filter((r) => r.id !== id));
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
        <h1>Atualizar Caixa</h1>

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
            <h3>Tipo:</h3>
            <select name="tipo" value={formData.tipo} onChange={handleChange} required>
              <option value="">Tipo de Movimento</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
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


        <h2>Movimentações</h2>
        {registros.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.data).toLocaleString("pt-BR")}</td>
                  <td>{r.tipo}</td>
                  <td>R$ {parseFloat(r.valor).toFixed(2)}</td>
                  <td>{r.descricao || "-"}</td>
                  <td>
                    <button className="editar" onClick={() => handleEdit(r)}>
                      Editar
                    </button>
                    <button className="deletar" onClick={() => handleDelete(r.id)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nenhum registro encontrado.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default AtualizarCaixa;
