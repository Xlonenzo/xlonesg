// src/components/GovernancaAnalytics.js

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

function KPICard({ kpi }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-2">
      <h3 className="text-lg font-bold mb-1">{kpi.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{kpi.description}</p>
      <p className="text-xs text-gray-600 mb-1">Ano: {kpi.year}</p>
      <p className="text-xs text-gray-600 mb-1">Mês: {kpi.month}</p>
      <p className="text-xs text-gray-600 mb-1">Unidade: {kpi.unit}</p>
      <p className="text-sm text-green-600 font-bold">Atual: {kpi.actual_value}</p>
      <p className="text-sm text-blue-600 font-bold">Alvo: {kpi.target_value}</p>
    </div>
  );
}

function GovernancaAnalytics() {
  const [kpis, setKpis] = useState([]);
  const [filteredKpis, setFilteredKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const years = useMemo(() => [...new Set(kpis.map(kpi => kpi.year))].sort((a, b) => b - a), [kpis]);
  const months = useMemo(() => [...new Set(kpis.map(kpi => kpi.month))].sort((a, b) => a - b), [kpis]);

  useEffect(() => {
    const fetchKPIs = async () => {
      setLoading(true);
      try {
        console.log('Buscando KPIs para a categoria: governance');
        const response = await axios.get('http://localhost:8000/api/kpis/category/governance');
        console.log('Resposta da API:', response.data);
        setKpis(response.data);
        setFilteredKpis(response.data);
        setError(null);
      } catch (error) {
        console.error('Erro ao buscar KPIs:', error);
        setError(`Falha ao carregar os KPIs. Erro: ${error.message}`);
        setKpis([]);
        setFilteredKpis([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  useEffect(() => {
    let filtered = kpis;
    if (selectedYear) {
      filtered = filtered.filter(kpi => kpi.year === parseInt(selectedYear));
    }
    if (selectedMonth) {
      filtered = filtered.filter(kpi => kpi.month === parseInt(selectedMonth));
    }
    setFilteredKpis(filtered);
  }, [kpis, selectedYear, selectedMonth]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Análise de Governança</h2>
      <div className="mb-4">
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(e.target.value)}
          className="mr-2 p-2 border rounded"
        >
          <option value="">Todos os anos</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Todos os meses</option>
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>
      <p>Total de KPIs: {filteredKpis.length}</p>
      {filteredKpis.length === 0 ? (
        <p>Nenhum KPI encontrado para esta categoria.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredKpis.map(kpi => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </div>
  );
}

export default GovernancaAnalytics;
