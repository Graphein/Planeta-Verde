import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import "../styles/LoginPage.css";

function ReceberDoacao() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    doador: "",
    tipo_doacao: "",
    quantidade: "",
    observacoes: "",
  });
  const [recebidas, setRecebidas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:5000/doacoes/receber", {
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
      setRecebidas(data);
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
      doador: formData.doador,
      tipo_doacao: formData.tipo_doacao,
      quantidade: formData.quantidade,
      observacoes: formData.observacoes,
    };

    try {
      const metodo = editando ? "PUT" : "POST";
      const url = editando
      ? `/doacoes/receber/${editando.id}`
      : "/doacoes/receber";

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
        doador: "",
        tipo_doacao: "",
        quantidade: "",
        observacoes: "",
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
      const response = await fetch(`/doacoes/receber/${id}`, {
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
      setRecebidas((prev) => prev.filter((item) => item.id !== id));
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
      doador: registro.doador_id,
      tipo_doacao: registro.tipo_doacao,
      quantidade: registro.quantidade,
      observacoes: registro.observacoes || "",
    });
  };

  return (
    <div className="page-container">
      <Header />
      <Menu />
      <div className="container">
        <h1>Receber Doação</h1>
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
            name="observacoes"
            placeholder="Observações"
            value={formData.observacoes}
            onChange={handleInputChange}
          />
          <button type="submit">{editando ? "Atualizar" : "Receber"}</button>
        </form>

        <h2>Doações Recebidas</h2>
        {recebidas.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Doador</th>
                <th>Tipo</th>
                <th>Quantidade</th>
                <th>Responsável</th>
                <th>Observações</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {recebidas.map((doacao) => (
                <tr key={doacao.id}>
                  <td>{doacao.id}</td>
                  <td>{new Date(doacao.data_recebimento).toLocaleString("pt-BR")}</td>
                  <td>{doacao.doador_id}</td>
                  <td>{doacao.tipo_doacao}</td>
                  <td>{doacao.quantidade}</td>
                  <td>{doacao.responsavel_id}</td>
                  <td>{doacao.observacoes || "-"}</td>
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
          <p>Nenhuma doação recebida encontrada.</p>
        )}
      </div>
      <Footer /> {/* Adicione o Footer */}
    </div>
  );
}

export default ReceberDoacao;