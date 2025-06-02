import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast";
import "../styles/LoginPage.css";

function IniciarProjeto() {
  const { token, usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome_projeto: "",
    data_inicio: "",
    responsavel_id: "",
    descricao: "",
    status: "",
  });
  const [projetos, setProjetos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE}/projetos/iniciar`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao buscar projetos");

      const data = await response.json();
      setProjetos(data);
      setError("");
    } catch (error) {
      setError(error.message);
      toast.error("Erro ao carregar dados!");
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Usuário não autenticado.");
      return navigate("/");
    }
    fetchData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();

    const url = editando
      ? `${API_BASE}/projetos/iniciar/${editando.id}`
      : `${API_BASE}/projetos/iniciar`;

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
        const err = await response.json();
        throw new Error(err.error || "Erro ao enviar dados");
      }

      toast.success(editando ? "Projeto atualizado!" : "Projeto cadastrado!");
      setFormData({
        nome_projeto: "",
        data_inicio: "",
        responsavel_id: "",
        descricao: "",
        status: "",
      });
      setEditando(null);
      fetchData();
    } catch (error) {
      setError(error.message);
      toast.error("Erro ao salvar projeto");
    }
  };

  const handleEdit = (projeto) => {
    setEditando(projeto);
    setFormData({
      nome_projeto: projeto.nome_projeto,
      data_inicio: projeto.data_inicio.slice(0, 16),
      responsavel_id: projeto.responsavel_id,
      descricao: projeto.descricao || "",
      status: projeto.status,
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/projetos/iniciar/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao excluir projeto");

      toast.success("Projeto excluído!");
      setProjetos((prev) => prev.filter((proj) => proj.id !== id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="page-container">
      <Header usuario={usuario} onLogout={handleLogout} />
      <Menu onLogout={handleLogout} />
      <div className="container">
        <Toaster position="top-center" />
        <h1>Iniciar Projeto</h1>

        {error && <p className="erro">{error}</p>}

        <form onSubmit={enviarFormulario} className="form-container">
          <div className="form-row">
            <h3>Nome do Projeto:</h3>
            <input
              type="text"
              name="nome_projeto"
              placeholder="Nome do Projeto"
              value={formData.nome_projeto}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <h3>Data de Início:</h3>
            <input
              type="datetime-local"
              name="data_inicio"
              value={formData.data_inicio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <h3>Responsável:</h3>
            <input
              type="text"
              name="responsavel_id"
              placeholder="Responsável (nome ou email)"
              value={formData.responsavel_id}
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

          <div className="form-row">
            <h3>Status:</h3>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="">Selecione o Status</option>
              <option value="Planejado">Planejado</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>

          <button type="submit">{editando ? "Atualizar" : "Iniciar"}</button>
        </form>

        <h2>Projetos Iniciados</h2>
        {projetos.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Data Início</th>
                <th>Responsável</th>
                <th>Descrição</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {projetos.map((proj) => (
                <tr key={proj.id}>
                  <td>{proj.nome_projeto}</td>
                  <td>{new Date(proj.data_inicio).toLocaleString("pt-BR")}</td>
                  <td>{proj.responsavel_id}</td>
                  <td>{proj.descricao || "-"}</td>
                  <td>{proj.status}</td>
                  <td>
                    <button className="editar" onClick={() => handleEdit(proj)}>
                      Editar
                    </button>
                    <button className="deletar" onClick={() => handleDelete(proj.id)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nenhum projeto iniciado encontrado.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default IniciarProjeto;