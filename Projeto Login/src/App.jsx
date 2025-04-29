// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./components/LoginPage";
import HomePage from "./pages/HomePage";
import AgendarDoacao from "./pages/AgendarDoacao";
import ReceberDoacao from "./pages/ReceberDoacao";
import IniciarAtividade from "./pages/IniciarAtividade";
import ConcluirAtividade from "./pages/ConcluirAtividade";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import TrocarSenha from "./pages/TrocarSenha";
import "./styles/LoginPage.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Rotas protegidas */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agendar-doacao"
            element={
              <ProtectedRoute>
                <AgendarDoacao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receber-doacao"
            element={
              <ProtectedRoute>
                <ReceberDoacao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/iniciar-atividade"
            element={
              <ProtectedRoute>
                <IniciarAtividade />
              </ProtectedRoute>
            }
          />
          <Route
            path="/concluir-atividade"
            element={
              <ProtectedRoute>
                <ConcluirAtividade />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trocar-senha"
            element={
              <ProtectedRoute>
                <TrocarSenha />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;