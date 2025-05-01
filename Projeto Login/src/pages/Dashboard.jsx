import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import "../styles/Dashboard.css";

import {
  Leaf,
  Gift,
  PackageCheck,
  TreeDeciduous,
  ListChecks,
  Receipt,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Activity
} from "lucide-react";
import "../styles/dashboard.css";

function Dashboard() {
  const { token, usuario, logout } = useContext(AuthContext);
  const [dados, setDados] = useState({});
  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    if (!token) return;
    fetchDados();
  }, [token]);

  const fetchDados = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao buscar dados");
      const data = await response.json();
      setDados(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const cards = [
    { label: "Doações Agendadas", key: "agendar_doacao", icon: <Calendar size={24} />, trend: 12, className: "bg-green" },
    { label: "Doações Recebidas", key: "receber_doacao", icon: <Gift size={24} />, trend: 8, className: "bg-purple" },
    { label: "Pedidos Realizados", key: "pedidos", icon: <PackageCheck size={24} />, trend: 6, className: "bg-blue" },
    { label: "Estoque Atualizado", key: "estoque", icon: <ListChecks size={24} />, trend: 3, className: "bg-emerald" },
    { label: "Projetos Iniciados", key: "iniciar_projeto", icon: <TreeDeciduous size={24} />, trend: 15, className: "bg-purple" },
    { label: "Projetos Concluídos", key: "concluir_projeto", icon: <TreeDeciduous size={24} />, trend: 7, className: "bg-blue" },
    { label: "Atividades Iniciadas", key: "iniciar_atividade", icon: <Activity size={24} />, trend: 5, className: "bg-green" },
    { label: "Atividades Concluídas", key: "concluir_atividade", icon: <Activity size={24} />, trend: 5, className: "bg-emerald" },
    { label: "Despesas Registradas", key: "despesas", icon: <Receipt size={24} />, trend: 9, className: "bg-purple" },
    { label: "Atualizações de Caixa", key: "caixa", icon: <TrendingUp size={24} />, trend: 10, className: "bg-blue" }
  ];
  

  return (
    <div className="dashboard-container">
      <Header usuario={usuario} onLogout={logout} />
      <Menu logout={logout} />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1><Leaf color="#228B22" /> Painel de Controle</h1>
          <p>Monitoramento em tempo real das atividades da ONG</p>
        </div>

        <div className="card-grid">
          {cards.map((card) => (
            <div key={card.key} className="card">
              <div className="card-top">
                <div>
                  <p className="card-title">{card.label}</p>
                  <p className="card-value">{dados[card.key] ?? "..."}</p>
                </div>
                <div className={`card-icon ${card.className}`}>{card.icon}</div>
              </div>
              <div className="card-bottom">
                {card.trend > 0 ? (
                  <ArrowUpRight size={16} color="#22c55e" />
                ) : (
                  <ArrowDownRight size={16} color="#ef4444" />
                )}
                <span style={{ color: card.trend > 0 ? "#22c55e" : "#ef4444" }}>
                  {Math.abs(card.trend)}%
                </span>
                <span className="trend-text"> desde o mês passado</span>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;
