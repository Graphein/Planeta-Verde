// src/pages/LoginPage.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom"; // Importar o Link
import { AuthContext } from "../context/AuthContext";
import Footer from "../components/Footer";
import "../styles/Page.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer login");
      }

      login(data.token, data.usuario);
      navigate("/home");
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <div className="login-container">
      <header>
        <img src="logo-ong.png" alt="Logo da ONG" id="logo-ong" />
      </header>
        {erro && <p className="erro">{erro}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <h1 className="BemVindo">Bem-vindo</h1>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>
          <button type="submit">Entrar</button>
        <div className="recuperar-senha">
          <Link to="/recuperar-senha">Esqueceu sua senha?</Link>
        </div>
        </form>
      <Footer />
    </div>
  );
  
};

export default LoginPage;