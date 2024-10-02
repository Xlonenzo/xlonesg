import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import kpisData from '../data/kpis';  // Certifique-se que o caminho está correto

function ComparacaoKPI() {
  // Estados para armazenar as seleções do usuário
  const [selectedSetor1, setSelectedSetor1] = useState('');
  const [selectedCompanhia1, setSelectedCompanhia1] = useState('');
  const [selectedKpi1, setSelectedKpi1] = useState('');

  const [selectedSetor2, setSelectedSetor2] = useState('');
  const [selectedCompanhia2, setSelectedCompanhia2] = useState('');
  const [selectedKpi2, setSelectedKpi2] = useState('');

  // Obter setores e companhias únicas dos dados
  const setores = [...new Set(kpisData.map(kpi => kpi.setor))];
  const companhias = [...new Set(kpisData.map(kpi => kpi.companhia))];

  // Filtrar KPIs com base nas seleções
  const kpisSetorCompanhia1 = kpisData.filter(kpi =>
    (kpi.setor === selectedSetor1 || !selectedSetor1) &&
    (kpi.companhia === selectedCompanhia1 || !selectedCompanhia1)
  );

  const kpisSetorCompanhia2 = kpisData.filter(kpi =>
    (kpi.setor === selectedSetor2 || !selectedSetor2) &&
    (kpi.companhia === selectedCompanhia2 || !selectedCompanhia2)
  );

  // Função para obter os KPIs filtrados por setor e companhia
  const getKpisOptions = (filteredKpis) => {
    return [...new Set(filteredKpis.map(kpi => kpi.name))];
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Comparação de KPI</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Seção de seleção do primeiro setor e companhia */}
        <div>
          <label className="block text-gray-700">Selecione o Setor 1:</label>
          <select
            value={selectedSetor1}
            onChange={(e) => setSelectedSetor1(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Todos os Setores</option>
            {setores.map((setor, index) => (
              <option key={index} value={setor}>{setor}</option>
            ))}
          </select>

          <label className="block text-gray-700 mt-4">Selecione a Companhia 1:</label>
          <select
            value={selectedCompanhia1}
            onChange={(e) => setSelectedCompanhia1(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Todas as Companhias</option>
            {companhias.map((companhia, index) => (
              <option key={index} value={companhia}>{companhia || 'Sem Companhia'}</option>
            ))}
          </select>

          {/* Filtro de KPI 1 */}
          <label className="block text-gray-700 mt-4">Selecione o KPI 1:</label>
          <select
            value={selectedKpi1}
            onChange={(e) => setSelectedKpi1(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Todos os KPIs</option>
            {getKpisOptions(kpisSetorCompanhia1).map((kpi, index) => (
              <option key={index} value={kpi}>{kpi}</option>
            ))}
          </select>
        </div>

        {/* Seção de seleção do segundo setor e companhia */}
        <div>
          <label className="block text-gray-700">Selecione o Setor 2:</label>
          <select
            value={selectedSetor2}
            onChange={(e) => setSelectedSetor2(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Todos os Setores</option>
            {setores.map((setor, index) => (
              <option key={index} value={setor}>{setor}</option>
            ))}
          </select>

          <label className="block text-gray-700 mt-4">Selecione a Companhia 2:</label>
          <select
            value={selectedCompanhia2}
            onChange={(e) => setSelectedCompanhia2(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Todas as Companhias</option>
            {companhias.map((companhia, index) => (
              <option key={index} value={companhia}>{companhia || 'Sem Companhia'}</option>
            ))}
          </select>

          {/* Filtro de KPI 2 */}
          <label className="block text-gray-700 mt-4">Selecione o KPI 2:</label>
          <select
            value={selectedKpi2}
            onChange={(e) => setSelectedKpi2(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Todos os KPIs</option>
            {getKpisOptions(kpisSetorCompanhia2).map((kpi, index) => (
              <option key={index} value={kpi}>{kpi}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Gráfico de comparação */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-bold mb-4">KPIs Comparados</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={[
              ...kpisSetorCompanhia1.filter(kpi => kpi.name === selectedKpi1),
              ...kpisSetorCompanhia2.filter(kpi => kpi.name === selectedKpi2)
            ]}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="actual_value" fill="#8884d8" name="Valor Atual Setor/Companhia 1" />
            <Bar dataKey="target_value" fill="#82ca9d" name="Meta Setor/Companhia 2" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ComparacaoKPI;
