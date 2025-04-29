import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import "../styles/LoginPage.css";

function ConcluirAtividade() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    data: "",
    atividade: "",
    responsavel: "",
    resultado: "",
    feedback: "",
  });
  const [concluidas, setConcluidas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:5000/atividades/concluir", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao buscar os dados");
      }
      const data = await response.json();
      setConcluidas(data);
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
      resultado: formData.resultado,
      feedback: formData.feedback,
    };

    try {
      const metodo = editando ? "PUT" : "POST";
      const url = editando
        ? `/atividades/concluir/${editando.id}`
        : "/atividades/concluir";

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

      alert(editando ? "Atualizado com sucesso!" : "Cadastrado com sucesso!");
      setEditando(null);
      setFormData({
        data: "",
        atividade: "",
        responsavel: "",
        resultado: "",
        feedback: "",
      });
      await fetchData();
    } catch (error) {
      setError(error.message);
      console.error("Erro ao enviar o formulário:", error);
      alert("Erro ao enviar os dados!");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/atividades/concluir/${id}`, {
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
      setConcluidas((prev) => prev.filter((item) => item.id !== id));
      alert("Registro excluído com sucesso!");
    } catch (error) {
      setError(error.message);
      console.error("Erro ao excluir registro:", error);
      alert("Erro ao excluir o registro!");
    }
  };

  const handleEdit = (registro) => {
    setEditando(registro);
    setFormData({
      data: registro.data_conclusao.slice(0, 16),
      atividade: registro.atividade_id,
      responsavel: registro.responsavel_id,
      resultado: registro.resultado,
      feedback: registro.feedback || "",
    });
  };

  return (
    <div className="page-container">
      <Header />
      <Menu />
      <div className="container">
        <h1>Concluir Atividade</h1>
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
            type="number"
            name="atividade"
            placeholder="ID da Atividade"
            value={formData.atividade}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="responsavel"
            placeholder="ID do Responsável"
            value={formData.responsavel}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="resultado"
            placeholder="Resultado"
            value={formData.resultado}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="feedback"
            placeholder="Feedback"
            value={formData.feedback}
            onChange={handleInputChange}
          />
          <button type="submit">{editando ? "Atualizar" : "Concluir"}</button>
        </form>

        <h2>Atividades Concluídas</h2>
        {concluidas.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Atividade</th>
                <th>Responsável</th>
                <th>Resultado</th>
                <th>Feedback</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {concluidas.map((atividade) => (
                <tr key={atividade.id}>
                  <td>{atividade.id}</td>
                  <td>{new Date(atividade.data_conclusao).toLocaleString("pt-BR")}</td>
                  <td>{atividade.atividade_id}</td>
                  <td>{atividade.responsavel_id}</td>
                  <td>{atividade.resultado}</td>
                  <td>{atividade.feedback || "-"}</td>
                  <td>
                    <button className="editar" onClick={() => handleEdit(atividade)}>
                      Editar
                    </button>
                    <button
                      className="deletar"
                      onClick={() => handleDelete(atividade.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nenhuma atividade concluída encontrada.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default ConcluirAtividade;