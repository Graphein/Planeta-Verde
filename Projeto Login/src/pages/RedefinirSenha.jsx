// src/pages/RedefinirSenha.jsx
import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "../styles/LoginPage.css";

const RedefinirSenha = () => {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams(); // Pegar o token da URL

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem!");
      return;
    }

    setCarregando(true);
    try {
      const response = await fetch("http://localhost:5000/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao redefinir a senha");
      }

      setMensagem("Senha redefinida com sucesso! Redirecionando para o login...");
      setErro("");
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      setErro(error.message);
      setMensagem("");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <header>
        <img src="logo-ong.png" alt="Logo da ONG" id="logo-ong" />
      </header>
      <div className="login-form">
        <h1>Redefinir Senha</h1>
        {mensagem && <p className="mensagem">{mensagem}</p>}
        {erro && <p className="erro">{erro}</p>}
        <form onSubmit={handleSubmit}>
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
            <label htmlFor="confirmarSenha">Confirmar Senha</label>
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
            {carregando ? "Redefinindo..." : "Redefinir"}
          </button>
        </form>
        <div className="recuperar-senha">
          <Link to="/">Voltar ao Login</Link>
        </div>
      </div>
    </div>
  );
};

export default RedefinirSenha;