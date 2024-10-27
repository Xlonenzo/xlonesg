import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ComparacaoKPI() {
  const [kpis, setKpis] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCNPJ, setSelectedCNPJ] = useState('');
  const [selectedKpi, setSelectedKpi] = useState('');

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/kpi-entries-with-templates`);
      setKpis(response.data);
    } catch (error) {
      console.error('Erro ao buscar KPIs:', error);
    }
  };

  // Obter categorias e CNPJs únicos dos dados
  const categories = [...new Set(kpis.map(kpi => kpi.company_category))];
  const cnpjs = [...new Set(kpis.map(kpi => kpi.cnpj))];

  // Filtrar KPIs com base nas seleções
  const kpisCategory = kpis.filter(kpi => kpi.company_category === selectedCategory);
  const kpisCNPJ = kpis.filter(kpi => kpi.cnpj === selectedCNPJ);

  // Função para obter os KPIs filtrados por categoria ou CNPJ
  const getKpisOptions = () => {
    const kpisCategoryNames = kpisCategory.map(kpi => kpi.template_name);
    const kpisCNPJNames = kpisCNPJ.map(kpi => kpi.template_name);
    return [...new Set([...kpisCategoryNames, ...kpisCNPJNames])];
  };

  // Preparar os dados para o gráfico
  const getDataForChart = () => {
    const categoryKpi = kpisCategory.find(kpi => kpi.template_name === selectedKpi);
    const cnpjKpi = kpisCNPJ.find(kpi => kpi.template_name === selectedKpi);

    return [
      {
        name: selectedKpi || 'Todos os KPIs',
        category_value: categoryKpi ? categoryKpi.actual_value : 0,
        category_meta: categoryKpi ? categoryKpi.target_value : 0,
        cnpj_value: cnpjKpi ? cnpjKpi.actual_value : 0,
        cnpj_meta: cnpjKpi ? cnpjKpi.target_value : 0,
      },
    ];
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Comparação de KPI</h2>

      {/* Seleção de categoria e CNPJ */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700">Selecione a Categoria da Empresa:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700">Selecione o CNPJ:</label>
          <select
            value={selectedCNPJ}
            onChange={(e) => setSelectedCNPJ(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Todos os CNPJs</option>
            {cnpjs.map((cnpj, index) => (
              <option key={index} value={cnpj}>{cnpj || 'Sem CNPJ'}</option>
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
            margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="category_value" fill="#8884d8" name="Valor Atual Categoria" />
            <Bar dataKey="category_meta" fill="#ADD8E6" name="Meta Categoria" />
            <Bar dataKey="cnpj_value" fill="#ff7f50" name="Valor Atual CNPJ" />
            <Bar dataKey="cnpj_meta" fill="#ffbb28" name="Meta CNPJ" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ComparacaoKPI;
