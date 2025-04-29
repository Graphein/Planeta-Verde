// src/components/Menu.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Menu.css";

function Menu({ logout }) {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="menu">
      <nav>
        <ul>
          <li>
            <Link to="/home">Planeta Verde</Link>
          </li>
          {["admin", "gerente"].includes(usuario?.nivel_acesso) && (
            <li>
              <Link to="/agendar-doacao">Agendar Doação</Link>
            </li>
          )}
          <li>
            <Link to="/receber-doacao">Receber Doação</Link>
          </li>
          {["admin", "gerente"].includes(usuario?.nivel_acesso) && (
            <>
              <li>
                <Link to="/iniciar-atividade">Iniciar Atividade</Link>
              </li>
              <li>
                <Link to="/concluir-atividade">Concluir Atividade</Link>
              </li>
            </>
          )}
          <li>
            <Link to="/trocar-senha">Trocar Senha</Link>
          </li>
          <li>
            <Link to="#" onClick={handleLogout}>
              Sair
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Menu;