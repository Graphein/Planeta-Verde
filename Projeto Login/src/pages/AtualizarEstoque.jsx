import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast";
import "../styles/LoginPage.css";

function AtualizarEstoque() {
  const { token, usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    item: "",
    quantidade: "",
    tipo: "", // entrada ou saída
    observacoes: "",
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
      const response = await fetch(`${API_BASE}/estoque`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Erro ao buscar dados");
      const data = await response.json();
      setRegistros(data);
    } catch (err) {
      toast.error("Erro ao carregar estoque");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    const url = editando ? `${API_BASE}/estoque/${editando.id}` : `${API_BASE}/estoque`;
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

      if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.error || "Erro ao salvar dados");
      }

      toast.success(editando ? "Estoque atualizado!" : "Movimentação registrada!");
      setFormData({ item: "", quantidade: "", tipo: "", observacoes: "" });
      setEditando(null);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (registro) => {
    setEditando(registro);
    setFormData({
      item: registro.item,
      quantidade: registro.quantidade,
      tipo: registro.tipo,
      observacoes: registro.observacoes || "",
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/estoque/${id}`, {
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
        <h1>Atualizar Estoque</h1>

        <form onSubmit={enviarFormulario}>
          <input
            type="text"
            name="item"
            placeholder="Item"
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
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
          >
            <option value="">Tipo de Movimento</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          <input
            type="text"
            name="observacoes"
            placeholder="Observações"
            value={formData.observacoes}
            onChange={handleChange}
          />
          <button type="submit">{editando ? "Atualizar" : "Registrar"}</button>
        </form>

        <h2>Movimentações</h2>
        {registros.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantidade</th>
                <th>Tipo</th>
                <th>Observações</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id}>
                  <td>{r.item}</td>
                  <td>{r.quantidade}</td>
                  <td>{r.tipo}</td>
                  <td>{r.observacoes || "-"}</td>
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

export default AtualizarEstoque;
