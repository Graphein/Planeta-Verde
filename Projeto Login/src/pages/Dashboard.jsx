import React, { useContext, useState } from "react"; // ✅ React incluso
import { AuthContext } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, BarChart,Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
} from 'recharts';
import Header from '../components/Header';
import Menu from '../components/Menu';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

import {
  Leaf, Gift, PackageCheck, TreeDeciduous, ListChecks,
  Receipt, Calendar, Activity, ArrowUpRight, ArrowDownRight,
  TrendingUp
} from 'lucide-react';

import '../styles/Dashboard.css';

const API_BASE = 'http://localhost:5000';

function Dashboard() {
  const { token, usuario, logout } = useContext(AuthContext);
  const [periodo, setPeriodo] = useState('ultimo_mes');

  const fetchDados = async (periodo) => {
    const response = await fetch(`${API_BASE}/dashboard?periodo=${periodo}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      console.error('Erro na API:', response.status, response.statusText);
      throw new Error('Erro ao buscar dados');
    }

    return response.json();
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', token, periodo],
    queryFn: () => fetchDados(periodo),
    enabled: !!token && token.length > 0,
  });

  if (isLoading) return <div style={{ padding: 20 }}>Carregando...</div>;
  if (error) {
    toast.error(error.message);
    return <div style={{ padding: 20 }}>Erro ao carregar o dashboard</div>;
  }

  const kpis = data?.kpis || {};
  const graficos = data?.graficos || {};
  const doacoesMensais = graficos?.doacoes_mensais || [];
  const despesasPorCategoria = graficos?.despesas_por_categoria || [];
  const atividadesRecentes = data?.atividades_recentes || [];

  const cards = [
    { label: 'Doações Agendadas', key: 'agendar_doacao', icon: <Calendar size={24} />, trend: 12, className: 'bg-green' },
    { label: 'Doações Recebidas', key: 'receber_doacao', icon: <Gift size={24} />, trend: 8, className: 'bg-purple' },
    { label: 'Pedidos Realizados', key: 'pedidos', icon: <PackageCheck size={24} />, trend: 6, className: 'bg-blue' },
    { label: 'Estoque Atualizado', key: 'estoque', icon: <ListChecks size={24} />, trend: 3, className: 'bg-emerald' },
    { label: 'Projetos Iniciados', key: 'iniciar_projeto', icon: <TreeDeciduous size={24} />, trend: 15, className: 'bg-purple' },
    { label: 'Projetos Concluídos', key: 'concluir_projeto', icon: <TreeDeciduous size={24} />, trend: 7, className: 'bg-blue' },
    { label: 'Atividades Iniciadas', key: 'iniciar_atividade', icon: <Activity size={24} />, trend: 5, className: 'bg-green' },
    { label: 'Atividades Concluídas', key: 'concluir_atividade', icon: <Activity size={24} />, trend: 5, className: 'bg-emerald' },
    { label: 'Despesas Registradas', key: 'despesas', icon: <Receipt size={24} />, trend: 9, className: 'bg-purple' },
    { label: 'Atualizações de Caixa', key: 'caixa', icon: <TrendingUp size={24} />, trend: 10, className: 'bg-blue' },
  ];

  const COLORS = ['#22c55e', '#7e22ce', '#2563eb', '#10b981', '#ef4444'];
  
  return (
    <div className="dashboard-container">
      <Header usuario={usuario} onLogout={logout} />
      <Menu logout={logout} />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1><Leaf color="#228B22" /> Painel de Controle</h1>
          <p>Monitoramento em tempo real das atividades da ONG</p>
        </div>
        <div className="filtro-container">
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option value="ultimo_mes">Último Mês</option>
            <option value="ultimo_trimestre">Último Trimestre</option>
            <option value="ultimo_ano">Último Ano</option>
          </select>
        </div>

        <div className="card-grid">
          {cards.map((card) => (
            <motion.div
              key={card.key}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card-top">
                <div>
                  <p className="card-title">{card.label}</p>
                  <p className="card-value">{kpis[card.key] ?? 0}</p>
                </div>
                <div className={`card-icon ${card.className}`}>{card.icon}</div>
              </div>
              <div className="card-bottom">
                {card.trend > 0
                  ? <ArrowUpRight size={16} color="#22c55e" />
                  : <ArrowDownRight size={16} color="#ef4444" />}
                <span style={{ color: card.trend > 0 ? '#22c55e' : '#ef4444' }}>
                  {Math.abs(card.trend)}%
                </span>
                <span className="trend-text"> desde o mês passado</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="charts-container">
          <div className="chart-container">
            <h3>Doações Mensais</h3>
            {doacoesMensais.length > 0 ? (
              <div className="grafico-linha">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={doacoesMensais} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" tick={{ fontSize: 14, fill: "#334155" }} />
                  <YAxis tick={{ fontSize: 14, fill: "#334155" }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 14 }} />
                  <Line type="monotone" dataKey="total" stroke="#16a34a" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <p>Sem dados para exibir</p>
            )}
          </div>

          <div className="chart-container">
            <h3>Despesas por Categoria</h3>
            {despesasPorCategoria.length > 0 ? (
              <div className="grafico-barra">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  layout="vertical"
                  data={despesasPorCategoria}
                  margin={{ top: 20, right: 30, left: 120, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 14, fill: "#334155" }} />
                  <YAxis
                    type="category"
                    dataKey="categoria"
                    tick={{ fontSize: 16, fill: "#0f172a" }}
                    width={150}
                  />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 14 }} />
                  <Bar dataKey="total" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <p>Sem dados para exibir</p>
            )}
          </div>
        </div>

        <div className="atividades-container">
          <h3>Atividades Recentes</h3>
          {atividadesRecentes.length > 0 ? (
            <table className="atividades-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                {atividadesRecentes.map((atividade, index) => (
                  <tr key={index}>
                    <td>{new Date(atividade.data).toLocaleDateString('pt-BR')}</td>
                    <td>{atividade.tipo}</td>
                    <td>{atividade.descricao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Sem atividades recentes</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;
