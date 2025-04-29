import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/LoginPage.css";

function GerenciarAtividades() {
  const { token } = useContext(AuthContext); // Obter o token do contexto
  const [secaoAberta, setSecaoAberta] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    data: "",
    doador: "",
    tipo_doacao: "",
    quantidade: "",
    descricao: "",
    responsavel: "",
    observacoes: "",
    atividade: "",
    voluntarios: "",
    status: "",
    resultado: "",
    feedback: "",
  });
  const [agendadas, setAgendadas] = useState([]);
  const [recebidas, setRecebidas] = useState([]);
  const [iniciadas, setIniciadas] = useState([]);
  const [concluidas, setConcluidas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState(""); // Estado para mensagens de erro

  // Função para buscar registros de cada tipo
  const fetchData = async (url, setState) => {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Enviar o token no cabeçalho
        },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao buscar os dados");
      }
      const data = await response.json();
      setState(data);
      setError(""); // Limpar mensagem de erro em caso de sucesso
    } catch (error) {
      setError(error.message);
      console.error("Erro ao buscar os dados:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData("http://localhost:5000/doacoes/agendar", setAgendadas);
      fetchData("http://localhost:5000/doacoes/receber", setRecebidas);
      fetchData("http://localhost:5000/atividades/iniciar", setIniciadas);
      fetchData("http://localhost:5000/atividades/concluir", setConcluidas);
    } else {
      setError("Usuário não autenticado. Faça login novamente.");
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const enviarFormulario = async (evento, url, atualizarEstado, rota) => {
    evento.preventDefault();

    let dadosFiltrados = {};
    if (rota === "agendar_doacao") {
      dadosFiltrados = {
        data: formData.data,
        doador: formData.doador,
        tipo_doacao: formData.tipo_doacao,
        quantidade: formData.quantidade,
        descricao: formData.descricao,
        responsavel: formData.responsavel,
        observacoes: formData.observacoes,
        status: formData.status,
      };
    } else if (rota === "receber_doacao") {
      dadosFiltrados = {
        doador: formData.doador,
        tipo_doacao: formData.tipo_doacao,
        quantidade: formData.quantidade,
        observacoes: formData.observacoes,
      };
    } else if (rota === "iniciar_atividade") {
      dadosFiltrados = {
        data: formData.data,
        atividade: formData.atividade,
        responsavel: formData.responsavel,
        descricao: formData.descricao,
        voluntarios: formData.voluntarios,
        status: formData.status,
      };
    } else if (rota === "concluir_atividade") {
      dadosFiltrados = {
        data: formData.data,
        atividade: formData.atividade,
        responsavel: formData.responsavel,
        resultado: formData.resultado,
        feedback: formData.feedback,
      };
    }

    try {
      const metodo = editando ? "PUT" : "POST";
      const finalUrl = editando ? `http://localhost:5000/${rota}/${editando.id}` : url;

      const response = await fetch(finalUrl, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Enviar o token no cabeçalho
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
        atividade: "",
        voluntarios: "",
        status: "",
        resultado: "",
        feedback: "",
        id: "",
      });

      let fetchUrl;
      if (rota === "agendar_doacao") {
        fetchUrl = "http://localhost:5000/doacoes/agendar";
      } else if (rota === "receber_doacao") {
        fetchUrl = "http://localhost:5000/doacoes/receber";
      } else if (rota === "iniciar_atividade") {
        fetchUrl = "http://localhost:5000/atividades/iniciar";
      } else if (rota === "concluir_atividade") {
        fetchUrl = "http://localhost:5000/atividades/concluir";
      }

      await fetchData(fetchUrl, atualizarEstado);
    } catch (error) {
      setError(error.message);
      console.error("Erro ao enviar o formulário:", error);
      alert("Erro ao enviar os dados!");
    }
  };

  const handleDelete = async (url, id, setState) => {
    try {
      const response = await fetch(`${url}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Enviar o token no cabeçalho
        },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao excluir o registro");
      }
      setState((prev) => prev.filter((item) => item.id !== id));
      alert("Registro excluído com sucesso!");
    } catch (error) {
      setError(error.message);
      console.error("Erro ao excluir registro:", error);
      alert("Erro ao excluir o registro!");
    }
  };

  const handleEdit = (registro, tipo) => {
    setSecaoAberta(tipo);
    setEditando(registro);

    if (tipo === "agendar") {
      setFormData({
        ...formData,
        data: registro.data_agendamento.slice(0, 16),
        doador: registro.doador_id,
        tipo_doacao: registro.tipo_doacao,
        quantidade: registro.quantidade,
        descricao: registro.descricao || "",
        responsavel: registro.responsavel_id,
        observacoes: registro.observacoes || "",
        status: registro.status,
      });
    } else if (tipo === "receber") {
      setFormData({
        ...formData,
        doador: registro.doador_id,
        tipo_doacao: registro.tipo_doacao,
        quantidade: registro.quantidade,
        observacoes: registro.observacoes || "",
      });
    } else if (tipo === "iniciar") {
      setFormData({
        ...formData,
        data: registro.data_inicio.slice(0, 16),
        atividade: registro.atividade_id,
        responsavel: registro.responsavel_id,
        descricao: registro.descricao || "",
        voluntarios: registro.voluntarios || "",
        status: registro.status,
      });
    } else if (tipo === "concluir") {
      setFormData({
        ...formData,
        data: registro.data_conclusao.slice(0, 16),
        atividade: registro.atividade_id,
        responsavel: registro.responsavel_id,
        resultado: registro.resultado,
        feedback: registro.feedback || "",
      });
    }
  };

  const toggleSecao = (secao) => {
    setSecaoAberta(secaoAberta === secao ? null : secao);
    setEditando(null);
    setFormData({
      id: "",
      data: "",
      doador: "",
      tipo_doacao: "",
      quantidade: "",
      descricao: "",
      responsavel: "",
      observacoes: "",
      atividade: "",
      voluntarios: "",
      status: "",
      resultado: "",
      feedback: "",
    });
  };

  return (
    <div>
      <header>
        <img src="logo-ong.png" alt="Logo da ONG" id="logo-ong" />
      </header>
      <div className="menu">
        <nav>
          <ul>
            <li>
              <Link to="/home">Planeta Verde</Link>
            </li>
            <li>
              <Link to="#">Doador</Link>
            </li>
            <li>
              <Link to="#">Doação</Link>
            </li>
            <li>
              <Link to="#">Projeto</Link>
            </li>
            <li>
              <Link to="/atividades">Atividade</Link>
            </li>
            <li>
              <Link to="#">Pedido</Link>
            </li>
            <li>
              <Link to="#">Registro de Despesas</Link>
            </li>
            <li>
              <Link to="#">Sobre Nós</Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="container">
        <h1>Atividades e Doação</h1>
        {error && <p className="erro">{error}</p>}
        <div className="buttons">
          <button onClick={() => toggleSecao("agendar")}>
            {secaoAberta === "agendar" ? "Fechar" : "Agendar Doação"}
          </button>
          <button onClick={() => toggleSecao("receber")}>
            {secaoAberta === "receber" ? "Fechar" : "Receber Doação"}
          </button>
          <button onClick={() => toggleSecao("iniciar")}>
            {secaoAberta === "iniciar" ? "Fechar" : "Iniciar Atividade"}
          </button>
          <button onClick={() => toggleSecao("concluir")}>
            {secaoAberta === "concluir" ? "Fechar" : "Concluir Atividade"}
          </button>
        </div>

        {/* Formulário para Agendar Doação */}
        {secaoAberta === "agendar" && (
          <div>
            <form
              onSubmit={(e) =>
                enviarFormulario(e, "http://localhost:5000/doacoes/agendar", setAgendadas, "agendar_doacao")
              }
            >
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
                    <th>Doador</th>
                    <th>Data</th>
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
                      <td>{new Date(doacao.data_agendamento).toLocaleString("pt-BR")}</td>
                      <td>{doacao.doador_id}</td>
                      <td>{doacao.tipo_doacao}</td>
                      <td>{doacao.quantidade}</td>
                      <td>{doacao.descricao || "-"}</td>
                      <td>{doacao.responsavel_id}</td>
                      <td>{doacao.observacoes || "-"}</td>
                      <td>{doacao.status}</td>
                      <td>
                        <button className="editar" onClick={() => handleEdit(doacao, "agendar")}>
                          Editar
                        </button>
                        <button
                          className="deletar"
                          onClick={() =>
                            handleDelete("http://localhost:5000/agendar_doacao", doacao.id, setAgendadas)
                          }
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
        )}

        {/* Formulário para Receber Doação */}
        {secaoAberta === "receber" && (
          <div>
            <form
              onSubmit={(e) =>
                enviarFormulario(e, "http://localhost:5000/doacoes/receber", setRecebidas, "receber_doacao")
              }
            >
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
                        <button className="editar" onClick={() => handleEdit(doacao, "receber")}>
                          Editar
                        </button>
                        <button
                          className="deletar"
                          onClick={() =>
                            handleDelete("http://localhost:5000/receber_doacao", doacao.id, setRecebidas)
                          }
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
        )}

        {/* Formulário para Iniciar Atividade */}
        {secaoAberta === "iniciar" && (
          <div>
            <form
              onSubmit={(e) =>
                enviarFormulario(e, "http://localhost:5000/atividades/iniciar", setIniciadas, "iniciar_atividade")
              }
            >
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
                    <th>ID</th>
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
                      <td>{atividade.id}</td>
                      <td>{new Date(atividade.data_inicio).toLocaleString("pt-BR")}</td>
                      <td>{atividade.atividade_id}</td>
                      <td>{atividade.responsavel_id}</td>
                      <td>{atividade.descricao || "-"}</td>
                      <td>{atividade.voluntarios || "-"}</td>
                      <td>{atividade.status}</td>
                      <td>
                        <button className="editar" onClick={() => handleEdit(atividade, "iniciar")}>
                          Editar
                        </button>
                        <button
                          className="deletar"
                          onClick={() =>
                            handleDelete("http://localhost:5000/iniciar_atividade", atividade.id, setIniciadas)
                          }
                        >
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
        )}

        {/* Formulário para Concluir Atividade */}
        {secaoAberta === "concluir" && (
          <div>
            <form
              onSubmit={(e) =>
                enviarFormulario(e, "http://localhost:5000/atividades/concluir", setConcluidas, "concluir_atividade")
              }
            >
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
                        <button className="editar" onClick={() => handleEdit(atividade, "concluir")}>
                          Editar
                        </button>
                        <button
                          className="deletar"
                          onClick={() =>
                            handleDelete("http://localhost:5000/concluir_atividade", atividade.id, setConcluidas)
                          }
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
        )}
      </div>
    </div>
  );
}

export default GerenciarAtividades;