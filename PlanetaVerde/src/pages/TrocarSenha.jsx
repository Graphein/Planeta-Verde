// src/pages/TrocarSenha.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import "../styles/LoginPage.css";

const TrocarSenha = () => {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const { token, usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (novaSenha !== confirmarSenha) {
      setErro("As novas senhas não coincidem!");
      return;
    }

    setCarregando(true);
    try {
      const response = await fetch("http://localhost:5000/trocar-senha", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao trocar a senha");
      }

      setMensagem("Senha trocada com sucesso! Faça login novamente.");
      setErro("");
      logout(); // Deslogar o usuário após trocar a senha
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      setErro(error.message);
      setMensagem("");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="page-container">
      <Header usuario={usuario} logout={logout} />
      <Menu logout={logout} />
      <div className="container">
        <h1>Trocar Senha</h1>
        {mensagem && <p className="mensagem">{mensagem}</p>}
        {erro && <p className="erro">{erro}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="senhaAtual">Senha Atual</label>
            <input
              type="password"
              id="senhaAtual"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="Digite sua senha atual"
              required
              disabled={carregando}
            />
          </div>
          <div className="input-group">
            <label htmlFor="novaSenha">Nova Senha</label>
            <input
              type="password"
              id="novaSenha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite sua nova senha"
              required
              disabled={carregando}
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirmarSenha">Confirmar Nova Senha</label>
            <input
              type="password"
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirme sua nova senha"
              required
              disabled={carregando}
            />
          </div>
          <button type="submit" disabled={carregando}>
            {carregando ? "Trocando..." : "Trocar Senha"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default TrocarSenha;