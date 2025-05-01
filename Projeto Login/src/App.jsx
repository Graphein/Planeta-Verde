import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // ✅ React Query

// Páginas
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
import IniciarProjeto from "./pages/IniciarProjeto";
import ConcluirProjeto from "./pages/ConcluirProjeto";
import AtualizarEstoque from "./pages/AtualizarEstoque";
import AtualizarCaixa from "./pages/AtualizarCaixa";
import RealizarPedido from "./pages/RealizarPedido";
import AprovarPedido from "./pages/AprovarPedido";
import RegistrarDespesas from "./pages/RegistrarDespesas";
import Dashboard from "./pages/Dashboard";

import "./styles/LoginPage.css";

// ✅ Instância do cliente React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}> {/* Envoltório obrigatório */}
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
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/iniciar-projeto"
              element={
                <ProtectedRoute>
                  <IniciarProjeto />
                </ProtectedRoute>
              }
            />
            <Route
              path="/aprovar-pedido"
              element={
                <ProtectedRoute>
                  <AprovarPedido />
                </ProtectedRoute>
              }
            />
            <Route
              path="/registrar-despesas"
              element={
                <ProtectedRoute>
                  <RegistrarDespesas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/realizar-pedido"
              element={
                <ProtectedRoute>
                  <RealizarPedido />
                </ProtectedRoute>
              }
            />
            <Route
              path="/concluir-projeto"
              element={
                <ProtectedRoute>
                  <ConcluirProjeto />
                </ProtectedRoute>
              }
            />
            <Route
              path="/atualizar-estoque"
              element={
                <ProtectedRoute>
                  <AtualizarEstoque />
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
              path="/atualizar-caixa"
              element={
                <ProtectedRoute>
                  <AtualizarCaixa />
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
    </QueryClientProvider>
  );
}

export default App;
