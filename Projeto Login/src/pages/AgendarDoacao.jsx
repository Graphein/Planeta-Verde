import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import "../styles/LoginPage.css";

function AgendarDoacao() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    data: "",
    doador: "",
    tipo_doacao: "",
    quantidade: "",
    descricao: "",
    responsavel: "",
    observacoes: "",
    status: "",
  });
  const [agendadas, setAgendadas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      console.log("Token enviado:", token); // Log para verificar o token
      const response = await fetch("/doacoes/agendar", { // Usando proxy
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
      console.log("Dados recebidos:", data); // Log para verificar os dados
      setAgendadas(data);
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
      doador: formData.doador,
      tipo_doacao: formData.tipo_doacao,
      quantidade: formData.quantidade,
      descricao: formData.descricao,
      responsavel: formData.responsavel,
      observacoes: formData.observacoes,
      status: formData.status,
    };

    try {
      const metodo = editando ? "PUT" : "POST";
      const url = editando
        ? `/doacoes/agendar/${editando.id}`
        : "/doacoes/agendar";

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
        doador: "",
        tipo_doacao: "",
        quantidade: "",
        descricao: "",
        responsavel: "",
        observacoes: "",
        status: "",
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
      const response = await fetch(`/doacoes/agendar/${id}`, {
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
      setAgendadas((prev) => prev.filter((item) => item.id !== id));
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
      data: registro.data_agendamento.slice(0, 16),
      doador: registro.doador_id,
      tipo_doacao: registro.tipo_doacao,
      quantidade: registro.quantidade,
      descricao: registro.descricao || "",
      responsavel: registro.responsavel_id,
      observacoes: registro.observacoes || "",
      status: registro.status,
    });
  };

  return (
    <div className="page-container">
      <Header />
      <Menu />
      <div className="container">
        <h1>Agendar Doação</h1>
        {error && <p className="erro">{error}</p>}

        <form onSubmit={enviarFormulario}>
          <input
            type="number"
            name="doador"
            placeholder="ID do Doador"
            value={formData.doador}
            onChange={handleInputChange}
            required
          />
          <input
            type="datetime-local"
            name="data"
            value={formData.data}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="tipo_doacao"
            placeholder="Tipo de Doação"
            value={formData.tipo_doacao}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="quantidade"
            placeholder="Quantidade"
            value={formData.quantidade}
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
            type="number"
            name="responsavel"
            placeholder="ID do Responsável"
            value={formData.responsavel}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="observacoes"
            placeholder="Observações"
            value={formData.observacoes}
            onChange={handleInputChange}
          />
          <select name="status" value={formData.status} onChange={handleInputChange} required>
            <option value="">Selecione o Status</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Pendente">Pendente</option>
            <option value="Cancelada">Cancelada</option>
          </select>
          <button type="submit">{editando ? "Atualizar" : "Agendar"}</button>
        </form>

        <h2>Doações Agendadas</h2>
        {agendadas.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Doador</th>
                <th>Tipo</th>
                <th>Quantidade</th>
                <th>Descrição</th>
                <th>Responsável</th>
                <th>Observações</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {agendadas.map((doacao) => (
                <tr key={doacao.id}>
                  <td>{doacao.id}</td>
                  <td>{new Date(doacao.data_agendamento).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  })}</td>
                  <td>{doacao.doador_id}</td>
                  <td>{doacao.tipo_doacao}</td>
                  <td>{doacao.quantidade}</td>
                  <td>{doacao.descricao || "-"}</td>
                  <td>{doacao.responsavel_id}</td>
                  <td>{doacao.observacoes || "-"}</td>
                  <td>{doacao.status}</td>
                  <td>
                    <button className="editar" onClick={() => handleEdit(doacao)}>
                      Editar
                    </button>
                    <button
                      className="deletar"
                      onClick={() => handleDelete(doacao.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nenhuma doação agendada encontrada.</p>
        )}
      </div>
      <Footer /> {/* Adicione o Footer */}
    </div>
  );
}

export default AgendarDoacao;