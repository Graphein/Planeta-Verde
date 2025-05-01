import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast"; // 🔥 Importando Toast
import "../styles/LoginPage.css";

function IniciarAtividade() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    data: "",
    atividade: "",
    responsavel: "",
    descricao: "",
    voluntarios: "",
    status: "",
  });
  const [iniciadas, setIniciadas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:5000/atividades/iniciar", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.text();
        console.error("Resposta do servidor:", errData);
        try {
          const jsonErr = JSON.parse(errData);
          throw new Error(jsonErr.error || `Erro ${response.status}: ${response.statusText}`);
        } catch (e) {
          throw new Error(`Erro ${response.status}: Resposta não é JSON válida - ${errData}`);
        }
      }

      const data = await response.json();
      setIniciadas(data);
      setError("");
    } catch (error) {
      setError(error.message);
      console.error("Erro ao buscar os dados:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setError("Usuário não autenticado. Faça login novamente.");
      navigate("/");
    }
  }, [token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const enviarFormulario = async (evento) => {
    evento.preventDefault();

    const dadosFiltrados = {
      data: formData.data,
      atividade: formData.atividade,
      responsavel: formData.responsavel,
      descricao: formData.descricao,
      voluntarios: formData.voluntarios,
      status: formData.status,
    };

    try {
      const metodo = editando ? "PUT" : "POST";
      const url = editando
        ? `http://localhost:5000/atividades/iniciar/${editando.id}`
        : "http://localhost:5000/atividades/iniciar";

      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dadosFiltrados),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao enviar os dados");
      }

      toast.success(editando ? "Atualizado com sucesso!" : "Cadastrado com sucesso!"); // ✅ TOAST
      setEditando(null);
      setFormData({
        data: "",
        atividade: "",
        responsavel: "",
        descricao: "",
        voluntarios: "",
        status: "",
      });
      await fetchData();
    } catch (error) {
      setError(error.message);
      console.error("Erro ao enviar o formulário:", error);
      toast.error("Erro ao enviar os dados!"); // ✅ TOAST
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/atividades/iniciar/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao excluir o registro");
      }
      setIniciadas((prev) => prev.filter((item) => item.id !== id));
      toast.success("Registro excluído com sucesso!"); // ✅ TOAST
    } catch (error) {
      setError(error.message);
      console.error("Erro ao excluir registro:", error);
      toast.error("Erro ao excluir o registro!"); // ✅ TOAST
    }
  };

  const handleEdit = (registro) => {
    setEditando(registro);
    setFormData({
      data: registro.data_inicio.slice(0, 16),
      atividade: registro.atividade_id,
      responsavel: registro.responsavel_id,
      descricao: registro.descricao || "",
      voluntarios: registro.voluntarios || "",
      status: registro.status,
    });
    toast.info("Edição iniciada!"); // ✅ TOAST
  };

  const { usuario, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="page-container">
      <Header usuario={usuario} onLogout={handleLogout} />
      <Menu onLogout={handleLogout} />
      <div className="container">
        <Toaster position="top-center" /> {/* Configurando Toast */}
        <h1>Iniciar Atividade</h1>
        {error && <p className="erro">{error}</p>}

        <form onSubmit={enviarFormulario}>
          <input
            type="datetime-local"
            name="data"
            value={formData.data}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="atividade"
            placeholder="Atividade"
            value={formData.atividade}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="responsavel"
            placeholder="Responsável"
            value={formData.responsavel}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="descricao"
            placeholder="Descrição"
            value={formData.descricao}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="voluntarios"
            placeholder="Voluntários (separados por vírgula)"
            value={formData.voluntarios}
            onChange={handleInputChange}
          />
          <select name="status" value={formData.status} onChange={handleInputChange} required>
            <option value="">Selecione o Status</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Planejada">Planejada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
          <button type="submit">{editando ? "Atualizar" : "Iniciar"}</button>
        </form>

        <h2>Atividades Iniciadas</h2>
        {iniciadas.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Atividade</th>
                <th>Responsável</th>
                <th>Descrição</th>
                <th>Voluntários</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {iniciadas.map((atividade) => (
                <tr key={atividade.id}>
                  <td>{new Date(atividade.data_inicio).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  })}</td>
                  <td>{atividade.atividade_id}</td>
                  <td>{atividade.responsavel_id}</td>
                  <td>{atividade.descricao || "-"}</td>
                  <td>{atividade.voluntarios || "-"}</td>
                  <td>{atividade.status}</td>
                  <td>
                    <button className="editar" onClick={() => handleEdit(atividade)}>
                      Editar
                    </button>
                    <button className="deletar" onClick={() => handleDelete(atividade.id)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nenhuma atividade iniciada encontrada.</p>
        )}
      </div>
      <Footer /> 
    </div>
  );
}

export default IniciarAtividade;
