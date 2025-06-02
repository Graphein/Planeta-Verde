import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast"; 
import "../styles/LoginPage.css";

function ReceberDoacao() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    doador: "",
    tipo_doacao: "",
    quantidade: "",
    observacoes: "",
    data: "", 
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
      toast.error("Erro ao buscar os dados!");  // Exibir erro com toast
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
      data: formData.data,
    };
  
    try {
      const metodo = editando ? "PUT" : "POST";
      const url = editando ? `/doacoes/receber/${editando.id}` : "/doacoes/receber";
  
      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...dadosFiltrados,
          tabela: "receber_doacao", // ✅ necessário para o backend saber a tabela
        }),
      });
  
      if (!response.ok) {
        // 🛡️ Protege contra resposta sem JSON
        let mensagemErro = "Erro ao enviar os dados";
        try {
          const errData = await response.json();
          mensagemErro = errData.error || mensagemErro;
        } catch (_) {}
        throw new Error(mensagemErro);
      }
  
      // ✅ Sucesso
      toast.success(editando ? "Atualizado com sucesso!" : "Cadastrado com sucesso!");
      setEditando(null);
      setFormData({
        doador: "",
        tipo_doacao: "",
        quantidade: "",
        observacoes: "",
        data: "",
      });
      await fetchData();
    } catch (error) {
      setError(error.message);
      console.error("Erro ao enviar o formulário:", error);
      toast.error("Erro ao enviar os dados!");
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
      toast.success("Registro excluído com sucesso!");  // ✅ TOAST
    } catch (error) {
      setError(error.message);
      console.error("Erro ao excluir registro:", error);
      toast.error("Erro ao excluir o registro!");  // ✅ TOAST
    }
  };

  const handleEdit = (registro) => {
    setEditando(registro);
    setFormData({
      doador: registro.doador_id,
      tipo_doacao: registro.tipo_doacao,
      quantidade: registro.quantidade,
      observacoes: registro.observacoes || "",
      data: registro.data_recebimento?.slice(0, 16) || "",
    });
    toast.info("Editando registro...");  // ✅ TOAST de Informação
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
        <Toaster position="top-center" /> {/* Toast container */}
        <h1>Receber Doação</h1>
        {error && <p className="erro">{error}</p>}

        <form onSubmit={enviarFormulario} className="form-container">
          <div className="form-row">
            <h3>Responsável Coleta:</h3>
            <input
              type="text"
              name="doador"
              placeholder="Responsável Coleta"
              value={formData.doador}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <h3>Data:</h3>
            <input
              type="datetime-local"
              name="data"
              value={formData.data}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <h3>Tipo de Doação:</h3>
            <input
              type="text"
              name="tipo_doacao"
              placeholder="Tipo de Doação"
              value={formData.tipo_doacao}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <h3>Quantidade:</h3>
            <input
              type="number"
              name="quantidade"
              placeholder="Quantidade"
              value={formData.quantidade}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <h3>Observações:</h3>
            <input
              type="text"
              name="observacoes"
              placeholder="Observações"
              value={formData.observacoes}
              onChange={handleInputChange}
            />
          </div>

          <button type="submit">{editando ? "Atualizar" : "Receber"}</button>
        </form>


        <h2>Doações Recebidas</h2>
        {recebidas.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Responsável</th>
                <th>Data</th>
                <th>Tipo</th>
                <th>Quantidade</th>
                <th>Observações</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {recebidas.map((doacao) => (
                <tr key={doacao.id}>
                  <td>{doacao.doador_id}</td>
                  <td>{new Date(doacao.data_recebimento).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  })}</td>
                  <td>{doacao.tipo_doacao}</td>
                  <td>{doacao.quantidade}</td>
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
      <Footer />
    </div>
  );
}

export default ReceberDoacao;
