// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Ajuste o caminho se necessário

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);

  // Se não houver token, redireciona para o login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Se autenticado, renderiza os filhos (a página protegida)
  return children;
};

export default ProtectedRoute;