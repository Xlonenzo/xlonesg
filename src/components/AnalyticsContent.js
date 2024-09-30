// src/components/AnalyticsContent.js

import React, { useEffect, useState } from 'react';
import KPIChart from './KPIChart';
import kpisData from '../data/kpis'; // Importa os dados dos KPIs

function AnalyticsContent({ category, selectedYear }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Filtrar os KPIs pela categoria e ano selecionados
    const filteredKPIs = kpisData.filter(
      (kpi) => kpi.category === category && kpi.year === selectedYear
    );

    // Preparar os dados para o gráfico
    const data = filteredKPIs.map((kpi) => ({
      name: kpi.name,
      target: kpi.target_value,
      actual: kpi.actual_value,
    }));

    setChartData(data);
  }, [category, selectedYear]);

  // Converter a categoria para um nome legível
  const categoryName = {
    environment: 'Meio Ambiente',
    social: 'Social',
    governance: 'Governança',
  }[category] || 'Análise';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Análise de {categoryName}</h2>
      {chartData.length > 0 ? (
        <KPIChart data={chartData} title={`KPIs de ${categoryName}`} />
      ) : (
        <p>Nenhum dado disponível para esta categoria no ano selecionado.</p>
      )}
    </div>
  );
}

export default AnalyticsContent;
