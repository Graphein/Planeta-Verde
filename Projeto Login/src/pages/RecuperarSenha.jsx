// src/pages/RecuperarSenha.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/LoginPage.css";

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setCarregando(true);
    try {
      const response = await fetch("http://localhost:5000/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao solicitar recuperação de senha");
      }

      setMensagem("Um email com o link de recuperação foi enviado para o seu endereço!");
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
        <h1>Recuperar Senha</h1>
        {mensagem && <p className="mensagem">{mensagem}</p>}
        {erro && <p className="erro">{erro}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
              disabled={carregando}
            />
          </div>
          <button type="submit" disabled={carregando}>
            {carregando ? "Enviando..." : "Enviar"}
          </button>
        </form>
        <div className="recuperar-senha">
          <Link to="/">Voltar ao Login</Link>
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;