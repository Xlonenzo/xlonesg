import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { FaStar } from 'react-icons/fa';
import { PieChart, Pie } from 'recharts';
import IEERComparativoChart from './IEERComparativoChart';
import { API_URL } from '../config';

function HomeContent() {
  const [allKpis, setAllKpis] = useState([]);
  const [favoriteKpis, setFavoriteKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      console.log('API URL:', API_URL); // Log para debug
      const response = await axios.get(`${API_URL}/kpi-entries-with-templates?limit=1000`);
      console.log('Response:', response); // Log para debug
      setAllKpis(response.data);
      const favorites = response.data.filter(kpi => kpi.isfavorite);
      setFavoriteKpis(favorites);
      console.log('Total KPIs:', response.data.length);
      console.log('Favorite KPIs:', favorites.length);
    } catch (error) {
      console.error('Erro ao buscar KPIs:', error);
      console.error('Erro detalhado:', error.response); // Log para mais detalhes do erro
      setError('Falha ao carregar os KPIs. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

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

    console.log(`Dados do gráfico para ${title}:`, chartData);

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
      console.log(`KPIs filtrados para ${type}:`, filteredKPIs);
      return renderBarChart(filteredKPIs, `Comparação de Estados - ${type}`, "#1E90FF");
    });
  };

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

  // Adicione estes dados para o gráfico de Diversidade Racial
  const diversidadeRacialData = [
    { name: 'Branco', value: 2661, color: '#0088FE' },
    { name: 'Pardo', value: 1086, color: '#00C49F' },
    { name: 'Preto', value: 298, color: '#FFBB28' },
    { name: 'Amarelo', value: 114, color: '#FF8042' },
    { name: 'Indígena', value: 11, color: '#8884D8' },
    { name: 'Outros', value: 49, color: '#82CA9D' }
  ];

  // Adicione esta função para renderizar o gráfico de Diversidade Racial
  const renderDiversidadeRacialChart = () => {
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
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

  if (loading) {
    return <div>Carregando KPIs...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <header className="flex items-center justify-between p-4 bg-gray-100">
        <h2 className="text-xl font-bold">Dashboard de KPIs</h2>
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-600">Em conformidade com o CSRD</span>
          <span className="text-sm text-gray-600">Powered by Snowflake</span>
        </div>
      </header>

      {renderFavoriteKPIs()}

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
}

export default HomeContent;
