import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import kpisData from '../data/kpis';  // Certifique-se que o caminho está correto

function ComparacaoKPI() {
  const [selectedSetor, setSelectedSetor] = useState('');
  const [selectedCompanhia, setSelectedCompanhia] = useState('');
  const [selectedKpi, setSelectedKpi] = useState('');

  // Obter setores e companhias únicos dos dados
  const setores = [...new Set(kpisData.map(kpi => kpi.setor))];
  const companhias = [...new Set(kpisData.map(kpi => kpi.companhia))];

  // Filtrar KPIs com base nas seleções
  const kpisSetor = kpisData.filter(kpi => kpi.setor === selectedSetor);
  const kpisCompanhia = kpisData.filter(kpi => kpi.companhia === selectedCompanhia);

  // Função para obter os KPIs filtrados por setor ou companhia
  const getKpisOptions = () => {
    const kpisSetorNames = kpisSetor.map(kpi => kpi.name);
    const kpisCompanhiaNames = kpisCompanhia.map(kpi => kpi.name);
    return [...new Set([...kpisSetorNames, ...kpisCompanhiaNames])];
  };

  // Preparar os dados para o gráfico
  const getDataForChart = () => {
    const setorKpi = kpisSetor.find(kpi => kpi.name === selectedKpi);
    const companhiaKpi = kpisCompanhia.find(kpi => kpi.name === selectedKpi);

    return [
      {
        name: selectedKpi,
        setor_value: setorKpi ? setorKpi.actual_value : 0,
        setor_meta: setorKpi ? setorKpi.target_value : 0,
        companhia_value: companhiaKpi ? companhiaKpi.actual_value : 0,
        companhia_meta: companhiaKpi ? companhiaKpi.target_value : 0,
      },
    ];
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Comparação de KPI</h2>

      {/* Seleção de setor e companhia */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700">Selecione o Setor:</label>
          <select
            value={selectedSetor}
            onChange={(e) => setSelectedSetor(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Todos os Setores</option>
            {setores.map((setor, index) => (
              <option key={index} value={setor}>{setor}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700">Selecione a Companhia:</label>
          <select
            value={selectedCompanhia}
            onChange={(e) => setSelectedCompanhia(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Todas as Companhias</option>
            {companhias.map((companhia, index) => (
              <option key={index} value={companhia}>{companhia || 'Sem Companhia'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Seleção de KPI */}
      <div className="mb-6">
        <label className="block text-gray-700">Selecione o KPI:</label>
        <select
          value={selectedKpi}
          onChange={(e) => setSelectedKpi(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Todos os KPIs</option>
          {getKpisOptions().map((kpi, index) => (
            <option key={index} value={kpi}>{kpi}</option>
          ))}
        </select>
      </div>

      {/* Gráfico de comparação */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-bold mb-4">KPIs Comparados</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={getDataForChart()}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="setor_value" fill="#8884d8" name="Valor Atual Setor" />
            <Bar dataKey="setor_meta" fill="#82ca9d" name="Meta Setor" />
            <Bar dataKey="companhia_value" fill="#ff7f50" name="Valor Atual Companhia" />
            <Bar dataKey="companhia_meta" fill="#ffbb28" name="Meta Companhia" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ComparacaoKPI;
