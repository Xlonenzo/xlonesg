import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Legend } from 'recharts';
import KPI from './KPI';  // Certifique-se que o caminho está correto

function HomeContent({ kpis, selectedYear }) {
  // Dados simulados de KPIs
  const kpiData = [
    { name: 'Energia Renovável', value: 95, target: 80, unit: '%', category: 'Ambiental' },
    { name: 'Diversidade de Gênero', value: 48, target: 50, unit: '%', category: 'Social' },
    { name: 'Emissões de CO2', value: 120, target: 100, unit: 'kton', category: 'Ambiental', inverse: true },
    { name: 'Treinamento em Ética', value: 98, target: 95, unit: '%', category: 'Governança' },
    { name: 'Rotatividade de Funcionários', value: 15, target: 10, unit: '%', category: 'Social', inverse: true },
    { name: 'Eficiência Hídrica', value: 85, target: 75, unit: '%', category: 'Ambiental' },
    { name: 'Satisfação do Cliente', value: 88, target: 90, unit: '%', category: 'Social' },
    { name: 'Redução de Resíduos', value: 30, target: 25, unit: '%', category: 'Ambiental' },
  ];

  // Dados para o IEER (Índice ESG de Equidade Racial)
  const ieerKPI = {
    name: 'IEER (Índice ESG de Equidade Racial)',
    value: 0, // Esse valor pode ser -1, 0, ou +1 indicando a mudança no índice
    target: 0, // Meta pode ser manter o IEER em 0
    unit: '',
    category: 'Social',
  };

  // Função para definir a cor com base no desempenho
  const getPerformanceColor = (kpi) => {
    const performance = (kpi.value / kpi.target) * 100;
    if (kpi.inverse) {
      return performance <= 100 ? '#22c55e' : '#ef4444';
    }
    return performance >= 100 ? '#22c55e' : '#ef4444';
  };

  // Verifica se o KPI tem bom desempenho
  const isGoodPerformance = (kpi) => {
    const performance = (kpi.value / kpi.target) * 100;
    return kpi.inverse ? performance <= 100 : performance >= 100;
  };

  // Separar os KPIs em duas categorias
  const goodPerformanceKPIs = kpiData.filter(isGoodPerformance);
  const poorPerformanceKPIs = kpiData.filter(kpi => !isGoodPerformance(kpi));

  // Tooltip personalizada
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const kpi = kpiData.find(k => k.name === label);
      return (
        <div className="bg-white p-4 rounded shadow-md border border-gray-200">
          <p className="font-bold">{label}</p>
          <p>Valor Atual: {payload[0].value} {kpi.unit}</p>
          <p>Meta: {kpi.target} {kpi.unit}</p>
          <p>Categoria: {kpi.category}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Visão Geral {selectedYear}</h2>

      {/* KPIs de Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {kpis.slice(0, 3).map(kpi => (
          <KPI key={kpi.id} kpi={kpi} />
        ))}

        {/* Card IEER (Índice ESG de Equidade Racial) */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-2">{ieerKPI.name}</h3>
          <p className="text-md">Valor Atual: {ieerKPI.value}</p>
          <p className="text-md">Meta: {ieerKPI.target}</p>
          <p className="text-md">Categoria: {ieerKPI.category}</p>
          <div className="mt-4">
            {/* Indicador visual */}
            {ieerKPI.value === -1 && (
              <span className="text-red-600 font-bold">-1 (Regressão)</span>
            )}
            {ieerKPI.value === 0 && (
              <span className="text-yellow-500 font-bold">0 (Estável)</span>
            )}
            {ieerKPI.value === +1 && (
              <span className="text-green-600 font-bold">+1 (Progresso)</span>
            )}
          </div>
        </div>
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
            <Bar dataKey="value" fill="#8884d8">
              {goodPerformanceKPIs.map((kpi, index) => (
                <Cell key={`cell-${index}`} fill={getPerformanceColor(kpi)} />
              ))}
            </Bar>
            {goodPerformanceKPIs.map((kpi, index) => (
              <ReferenceLine
                key={`ref-${index}`}
                x={kpi.target}
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
            <Bar dataKey="value" fill="#8884d8">
              {poorPerformanceKPIs.map((kpi, index) => (
                <Cell key={`cell-${index}`} fill={getPerformanceColor(kpi)} />
              ))}
            </Bar>
            {poorPerformanceKPIs.map((kpi, index) => (
              <ReferenceLine
                key={`ref-${index}`}
                x={kpi.target}
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
