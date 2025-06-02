// Home.jsx
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import "../styles/HomePage.css";

function Home() {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="page-container">
      <Header usuario={usuario} onLogout={handleLogout} />
      <Menu onLogout={handleLogout} />
      <div className="container">
        <h1>Bem-vindo ao Planeta Verde</h1>
        <p>Gerencie suas doações e atividades de forma eficiente!</p>
        <h2>Permissões por Perfil</h2>
          <table className="permissoes-tabela">
            <thead>
              <tr>
                <th>Funcionalidade</th>
                <th>Admin</th>
                <th>Gerente</th>
                <th>Voluntário</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Agendar Doação</td>
                <td>Sim</td>
                <td>Sim</td>
                <td>Não</td>
              </tr>
              <tr>
                <td>Receber Doação</td>
                <td>Sim</td>
                <td>Sim</td>
                <td>Sim</td>
              </tr>
              <tr>
                <td>Iniciar Atividade</td>
                <td>Sim</td>
                <td>Sim</td>
                <td>Não</td>
              </tr>
              <tr>
                <td>Concluir Atividade</td>
                <td>Sim</td>
                <td>Sim</td>
                <td>Não</td>
              </tr>
              <tr>
                <td>Editar/Atualizar Registros</td>
                <td>Sim</td>
                <td>Sim</td>
                <td>Não</td>
              </tr>
              <tr>
                <td>Excluir Registros</td>
                <td>Sim</td>
                <td>Não</td>
                <td>Não</td>
              </tr>
              <tr>
                <td>Gerenciar Usuários</td>
                <td>Sim</td>
                <td>Não</td>
                <td>Não</td>
              </tr>
              <tr>
                <td>Alterar Senha Própria</td>
                <td>Sim</td>
                <td>Sim</td>
                <td>Sim</td>
              </tr>
              <tr>
                <td>Acessar Página Inicial</td>
                <td>Sim</td>
                <td>Sim</td>
                <td>Sim</td>
              </tr>
              <tr>
                <td>Acessar Página de Voluntários</td>
                <td>Sim</td>
                <td>Sim</td>
                <td>Não</td>
              </tr>
            </tbody>
          </table>
      </div>
      <Footer />
    </div>
  );
}

export default Home;