import React from "react";
import { LogOut } from "lucide-react";
import "../styles/Header.css";

function Header({ usuario, onLogout }) {
  return (
    <header>
      {usuario && (
        <div className="usuario-info">
          <span>Olá, {usuario.nome}!</span>
          <button className="botao-sair" onClick={onLogout}>
            <LogOut size={20} />
            Sair
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;