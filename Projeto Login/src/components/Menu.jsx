import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Gift,
  Calendar,
  PlayCircle,
  CheckCircle,
  Lock,
  FilePlus,
  CheckSquare,
  Boxes,
  PiggyBank,
  ShoppingCart,
  ThumbsUp,
  Banknote,
  LayoutDashboard
} from "lucide-react";
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
            <Link to="/home">
              <Gift size={20} /> Planeta Verde
            </Link>
          </li>

          {/* Acesso restrito */}
          {["admin", "gerente"].includes(usuario?.nivel_acesso) && (
            <>
              <li>
                <Link to="/agendar-doacao">
                  <Calendar size={20} /> Agendar Doação
                </Link>
              </li>
              <li>
              <Link to="/dashboard">
                <LayoutDashboard size={20} /> Dashboard
              </Link>
              </li>
              <li>
                <Link to="/realizar-pedido">
                  <ShoppingCart size={20} /> Realizar Pedido
                </Link>
              </li>
              <li>
                <Link to="/aprovar-pedido">
                  <ThumbsUp size={20} /> Aprovar Pedido
                </Link>
              </li>
              <li>
                <Link to="/atualizar-estoque">
                  <Boxes size={20} /> Atualizar Estoque
                </Link>
              </li>

              <li>
                <Link to="/iniciar-projeto">
                  <FilePlus size={20} /> Iniciar Projeto
                </Link>
              </li>
              <li>
                <Link to="/concluir-projeto">
                  <CheckSquare size={20} /> Concluir Projeto
                </Link>
              </li>
              <li>
                <Link to="/iniciar-atividade">
                  <PlayCircle size={20} /> Iniciar Atividade
                </Link>
              </li>
              <li>
                <Link to="/concluir-atividade">
                  <CheckCircle size={20} /> Concluir Atividade
                </Link>
              </li>

              <li>
                <Link to="/registrar-despesas">
                  <Banknote size={20} /> Registrar Despesas
                </Link>
              </li>
              <li>
                <Link to="/atualizar-caixa">
                  <PiggyBank size={20} /> Atualizar Caixa
                </Link>
              </li>
            </>
          )}
          <li>
            <Link to="/receber-doacao">
              <Gift size={20} /> Receber Doação
            </Link>
          </li>

          <li>
            <Link to="/trocar-senha">
              <Lock size={20} /> Trocar Senha
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Menu;
