import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ODSRadarChart from './ODSRadarChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { FaStar } from 'react-icons/fa';
import { PieChart, Pie } from 'recharts';
import IEERComparativoChart from './IEERComparativoChart';
import { API_URL } from '../config';

const HomeContent = ({ projectData: existingProjectData, bondsData }) => {
  const [projectData, setProjectData] = useState([]);
  const [allKpis, setAllKpis] = useState([]);
  const [favoriteKpis, setFavoriteKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ws = new WebSocket('ws://seu-servidor/ws');

  // Função para buscar dados
  const fetchData = async () => {
    try {
      // Buscar dados de projetos
      const projectResponse = await axios.get(`${API_URL}/project-tracking`);
      setProjectData(projectResponse.data);

      // Buscar KPIs
      const kpiResponse = await axios.get(`${API_URL}/kpi-entries-with-templates?limit=1000`);
      setAllKpis(kpiResponse.data);
      setFavoriteKpis(kpiResponse.data.filter(kpi => kpi.isfavorite));
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Falha ao carregar dados');
      setLoading(false);
    }
  };

  // Efeito inicial para carregar dados
  useEffect(() => {
    fetchData();

    // Configurar polling para atualização a cada 30 segundos
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    // Limpar intervalo quando componente for desmontado
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'project_update') {
        fetchData();
      }
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/project-updates`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        fetchData();
      }
    };

    return () => eventSource.close();
  }, []);

  // Função para atualizar manualmente os dados
  const handleRefresh = async () => {
    setLoading(true);
    await fetchData();
  };

  // Função para renderizar KPIs favoritos
  const renderFavoriteKPIs = () => {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">KPIs Favoritos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteKpis.map(kpi => (
            <div key={kpi.entry_id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold">{kpi.template_name}</h4>
                <FaStar className="text-yellow-400" />
              </div>
              <p>Atual: {kpi.actual_value.toFixed(2)}</p>
              <p>Meta: {kpi.target_value.toFixed(2)}</p>
              <p>Estado: {kpi.state || 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Funções para os novos gráficos
  const renderBarChart = (data, title, color) => {
    if (data.length === 0) {
      return (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">{title}</h3>
          <p>Não há dados disponíveis para este gráfico.</p>
        </div>
      );
    }

    const chartData = data.map(kpi => ({
      ...kpi,
      value: kpi.actual_value,
      target: kpi.target_value
    }));

    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="state" />
            <YAxis />
            <Tooltip
              formatter={(value, name, props) => {
                const percentage = ((value / props.payload.target) * 100).toFixed(2);
                return [
                  `Atual: ${value.toFixed(2)}`,
                  `Meta: ${props.payload.target.toFixed(2)}`,
                  `Desempenho: ${percentage}%`,
                  `Estado: ${props.payload.state || 'N/A'}`
                ];
              }}
            />
            <Legend />
            <ReferenceLine y={0} stroke="#000" />
            <Bar dataKey="value" fill={color} name="Valor Atual">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.value >= entry.target ? '#4CAF50' : '#FF5252'} />
              ))}
            </Bar>
            <Bar dataKey="target" fill="#8884d8" name="Meta" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderComparisonCharts = () => {
    const ieerTypes = [
      "IEER N1 - Gerência",
      "IEER N1 - Não Liderança",
      "IEER N1 - Diretoria",
      "IEER N1 - Ponderado"
    ];

    return ieerTypes.map(type => {
      const filteredKPIs = allKpis.filter(kpi => 
        kpi.template_name.toLowerCase().includes(type.toLowerCase().replace("IEER N1 - ", ""))
      );
      return renderBarChart(filteredKPIs, `Comparação de Estados - ${type}`, "#1E90FF");
    });
  };

  // Dados e função para o gráfico de Diversidade Racial
  const diversidadeRacialData = [
    { name: 'Branco', value: 2661, color: '#0088FE' },
    { name: 'Pardo', value: 1086, color: '#00C49F' },
    { name: 'Preto', value: 298, color: '#FFBB28' },
    { name: 'Amarelo', value: 114, color: '#FF8042' },
    { name: 'Indígena', value: 11, color: '#8884D8' },
    { name: 'Outros', value: 49, color: '#82CA9D' }
  ];

  const renderDiversidadeRacialChart = () => {
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={diversidadeRacialData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {diversidadeRacialData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="dashboard-container">
      <header className="flex items-center justify-between p-4 bg-gray-100">
        <h2 className="text-xl font-bold">Dashboard de KPIs</h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Atualizando...' : 'Atualizar Dados'}
          </button>
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-600">Em conformidade com o CSRD</span>
            <span className="text-sm text-gray-600">Powered by Snowflake</span>
          </div>
        </div>
      </header>

      {/* KPIs Favoritos */}
      {renderFavoriteKPIs()}

      {/* Análise ODS em linha única */}
      <div className="mt-8">
        <div className="chart-section w-full">
          <h2 className="text-xl font-bold mb-4">Análise ODS</h2>
          <ODSRadarChart projectData={projectData} />
        </div>
      </div>

      {/* Progresso dos Projetos */}
      <div className="mt-8">
        <div className="chart-section">
          <h2 className="text-xl font-bold mb-4">Progresso dos Projetos</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={projectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="progress_percentage" fill="#82ca9d" name="Progresso (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Novos gráficos */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">Diversidade Racial - Visão Geral</h3>
          {renderDiversidadeRacialChart()}
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">IEER Comparativo</h3>
          <IEERComparativoChart />
        </div>
      </div>

      <h3 className="text-xl font-bold mt-12 mb-4">Comparação de Estados</h3>
      {renderComparisonCharts()}
    </div>
  );
};

export default HomeContent;
