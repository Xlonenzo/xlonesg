// src/components/AnalyticsContent.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import KPICard from './KPICard';

// Adicione esta importação no topo do arquivo
import { API_URL } from '../config';

function AnalyticsContent({ pageTitle }) {
  const [kpis, setKpis] = useState([]);
  const [filteredKpis, setFilteredKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  const categoryMap = useMemo(() => ({
    'Meio Ambiente': 'environment',
    'Social': 'social',
    'Governança': 'governance'
  }), []);

  // Definindo as opções de filtro usando useMemo
  const years = useMemo(() => [...new Set(kpis.map(kpi => kpi.year))].sort((a, b) => b - a), [kpis]);
  const months = useMemo(() => [...new Set(kpis.map(kpi => kpi.month))].sort((a, b) => a - b), [kpis]);
  const states = useMemo(() => [...new Set(kpis.map(kpi => kpi.state))], [kpis]);
  const units = useMemo(() => [...new Set(kpis.map(kpi => kpi.unit))], [kpis]);

  useEffect(() => {
    const fetchKPIs = async () => {
      setLoading(true);
      try {
        const category = categoryMap[pageTitle];
        console.log(`Buscando KPIs para a categoria: ${category}`);
        // Use API_URL aqui
        const response = await axios.get(`${API_URL}/kpi-entries-with-templates`, {
          params: { category: category, limit: 1000000 }  // Aumentando o limite
        });
        console.log('Número de KPIs recebidos:', response.data.length);
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
  }, [pageTitle, categoryMap]);

  useEffect(() => {
    let filtered = kpis;
    if (selectedYear) {
      filtered = filtered.filter(kpi => kpi.year === parseInt(selectedYear));
    }
    if (selectedMonth) {
      filtered = filtered.filter(kpi => kpi.month === parseInt(selectedMonth));
    }
    if (selectedState) {
      filtered = filtered.filter(kpi => kpi.state === selectedState);
    }
    if (selectedUnit) {
      filtered = filtered.filter(kpi => kpi.unit === selectedUnit);
    }
    setFilteredKpis(filtered);
  }, [kpis, selectedYear, selectedMonth, selectedState, selectedUnit]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Análise de {pageTitle}</h2>
      <div className="mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(e.target.value)}
          className="p-2 border rounded"
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
        <select 
          value={selectedState} 
          onChange={(e) => setSelectedState(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Todos os estados</option>
          {states.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        <select 
          value={selectedUnit} 
          onChange={(e) => setSelectedUnit(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Todas as unidades</option>
          {units.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>
      <p>Total de KPIs: {filteredKpis.length}</p>
      {filteredKpis.length === 0 ? (
        <p>Nenhum KPI encontrado para esta categoria.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredKpis.map(kpi => (
            <KPICard key={kpi.entry_id} kpi={kpi} />
          ))}
        </div>
      )}
    </div>
  );
}

export default AnalyticsContent;
