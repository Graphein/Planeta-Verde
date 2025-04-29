// Header.jsx
import React from "react";
import logo from "../assets/logo-ong.png"; // Ajuste o caminho conforme necessário
import "../styles/Header.css"; // Importe o novo CSS

function Header({ usuario, onLogout }) {
  return (
    <header>
      <img src={logo} alt="Logo Planeta Verde" id="logo-ong" />
      {usuario && (
        <div className="usuario-info">
          <span>Olá, {usuario.nome}!</span>
          <button className="botao-sair" onClick={onLogout}>
            Sair
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;