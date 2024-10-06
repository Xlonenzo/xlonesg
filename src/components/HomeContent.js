import React from 'react'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Legend } from 'recharts';
import KPI from './KPI';  // Certifique-se que o caminho está correto
import kpisData from '../data/kpis'; // Certifique-se que o caminho para kpisData está correto

function HomeContent({ selectedYear }) {
  // Filtrar KPIs para o ano selecionado
  const kpis = kpisData.filter(kpi => kpi.year === selectedYear);

  // Função para definir a cor com base no desempenho
  const getPerformanceColor = (kpi) => {
    const performance = (kpi.actual_value / kpi.target_value) * 100;
    if (kpi.inverse) {
      return performance <= 100 ? '#22c55e' : '#ef4444';
    }
    return performance >= 100 ? '#22c55e' : '#ef4444';
  };

  // Verifica se o KPI tem bom desempenho
  const isGoodPerformance = (kpi) => {
    const performance = (kpi.actual_value / kpi.target_value) * 100;
    return kpi.inverse ? performance <= 100 : performance >= 100;
  };

  // Separar os KPIs em duas categorias
  const goodPerformanceKPIs = kpis.filter(isGoodPerformance);
  const poorPerformanceKPIs = kpis.filter(kpi => !isGoodPerformance(kpi));

  // Tooltip personalizada
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const kpi = kpis.find(k => k.name === label);
      return (
        <div className="bg-white p-4 rounded shadow-md border border-gray-200">
          <p className="font-bold">{label}</p>
          <p>Valor Atual: {payload[0].value} {kpi.unit}</p>
          <p>Meta: {kpi.target_value} {kpi.unit}</p>
          <p>Categoria: {kpi.category}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Cabeçalho modificado com "Em conformidade com o CSRD" e "Powered by Snowflake" no lado direito */}
      <header className="flex items-center justify-between p-4 bg-gray-100">
        <h2 className="text-xl font-bold">Visão Geral {selectedYear}</h2>
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-600">Em conformidade com o CSRD</span>
          <span className="text-sm text-gray-600">Powered by Snowflake</span>
        </div>
      </header>

      {/* KPIs de Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {kpis
          .filter(kpi => kpi.is_favorite)  // Filtra apenas os KPIs com is_favorite: true
          .map(kpi => (
            <KPI key={kpi.id} kpi={kpi} />
          ))
        }
      </div>

      {/* Gráfico de Bom Desempenho */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-bold mb-4">KPIs com Bom Desempenho</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={goodPerformanceKPIs}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 'dataMax']} />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="actual_value" fill="#8884d8">
              {goodPerformanceKPIs.map((kpi, index) => (
                <Cell key={`cell-${index}`} fill={getPerformanceColor(kpi)} />
              ))}
            </Bar>
            {goodPerformanceKPIs.map((kpi, index) => (
              <ReferenceLine
                key={`ref-${index}`}
                x={kpi.target_value}
                stroke="#888888"
                strokeDasharray="3 3"
                isFront={true}
                label={{ value: 'Meta', position: 'insideTopRight', fill: '#888888', fontSize: 12 }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de KPIs que Precisam de Atenção */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-bold mb-4">KPIs que Precisam de Atenção</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={poorPerformanceKPIs}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 'dataMax']} />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="actual_value" fill="#8884d8">
              {poorPerformanceKPIs.map((kpi, index) => (
                <Cell key={`cell-${index}`} fill={getPerformanceColor(kpi)} />
              ))}
            </Bar>
            {poorPerformanceKPIs.map((kpi, index) => (
              <ReferenceLine
                key={`ref-${index}`}
                x={kpi.target_value}
                stroke="#888888"
                strokeDasharray="3 3"
                isFront={true}
                label={{ value: 'Meta', position: 'insideTopRight', fill: '#888888', fontSize: 12 }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default HomeContent;