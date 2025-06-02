import React from "react";
import Header from "../components/Header";
import Menu from "../components/Menu";
import "../styles/HomePage.css"; 

function UnauthorizedPage() {
  return (
    <div>
      <Header />
      <Menu />
      <div className="container">
        <h1>Acesso Não Autorizado</h1>
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    </div>
  );
}

export default UnauthorizedPage;