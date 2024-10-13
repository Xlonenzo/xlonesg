import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      const response = await axios.get('http://localhost:8000/api/kpi-entries-with-templates');
      setAllKpis(response.data);
      const favorites = response.data.filter(kpi => kpi.isfavorite);
      setFavoriteKpis(favorites);
      console.log('All KPIs fetched:', response.data);
      console.log('Favorite KPIs:', favorites);
    } catch (error) {
      console.error('Erro ao buscar KPIs:', error);
      setError('Falha ao carregar os KPIs. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  function KPICard({ kpi }) {
    const performancePercentage = (kpi.actual_value / kpi.target_value) * 100;
    const isGood = performancePercentage >= 100; // Assumindo que maior é melhor para todos os KPIs
    const statusColor = isGood ? 'bg-green-500' : 'bg-red-500';

    return (
      <div className="bg-white shadow-md rounded-lg p-4 m-2">
        <h3 className="text-lg font-semibold mb-2">{kpi.template_name}</h3>
        <p className="text-sm text-gray-600 mb-2">{kpi.description}</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Atual: {kpi.actual_value} {kpi.unit}</span>
          <span className="text-sm font-medium">Meta: {kpi.target_value} {kpi.unit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${statusColor}`}
            style={{ width: `${Math.min(performancePercentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm mt-2">
          {isGood ? 'Bom desempenho' : 'Precisa de atenção'}
        </p>
        <p className="text-xs text-gray-500 mt-2">Ano: {kpi.year}, Mês: {kpi.month}</p>
      </div>
    );
  }

  const goodPerformanceKPIs = allKpis.filter(kpi => {
    const performancePercentage = (kpi.actual_value / kpi.target_value) * 100;
    return performancePercentage >= 100;
  });

  const needsAttentionKPIs = allKpis.filter(kpi => {
    const performancePercentage = (kpi.actual_value / kpi.target_value) * 100;
    return performancePercentage < 100;
  });

  const renderBarChart = (data, title, color) => (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="template_name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="actual_value" fill={color} name="Valor Atual" />
          <Bar dataKey="target_value" fill="#8884d8" name="Meta" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  if (loading) {
    return <div>Carregando KPIs...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <header className="flex items-center justify-between p-4 bg-gray-100">
        <h2 className="text-xl font-bold">Visão Geral dos KPIs</h2>
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-600">Em conformidade com o CSRD</span>
          <span className="text-sm text-gray-600">Powered by Snowflake</span>
        </div>
      </header>

      <h3 className="text-lg font-semibold mt-6 mb-4 px-4">KPIs Favoritos</h3>
      {favoriteKpis.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 px-4">
          {favoriteKpis.map(kpi => (
            <KPICard key={kpi.entry_id} kpi={kpi} />
          ))}
        </div>
      ) : (
        <p className="text-center mt-4">Nenhum KPI favorito encontrado.</p>
      )}

      <h3 className="text-lg font-semibold mt-6 mb-4 px-4">Todos os KPIs</h3>
      {renderBarChart(goodPerformanceKPIs, "KPIs com Bom Desempenho", "#22c55e")}
      {renderBarChart(needsAttentionKPIs, "KPIs que Precisam de Atenção", "#ef4444")}
    </div>
  );
}

export default HomeContent;
