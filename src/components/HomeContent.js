// src/components/HomeContent.js

import React, { useEffect, useState } from 'react';
import kpisData from '../data/kpis'; // Importa os dados dos KPIs

function HomeContent({ selectedYear }) {
  const [kpis, setKpis] = useState([]);

  useEffect(() => {
    // Filtrar os KPIs pelo ano selecionado
    const filteredKPIs = kpisData.filter((kpi) => kpi.year === selectedYear);
    setKpis(filteredKPIs);
  }, [selectedYear]);

  if (!Array.isArray(kpis)) {
    return <p>Dados de KPIs não disponíveis.</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Painel de KPIs - {selectedYear}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold">{kpi.name}</h3>
            <p className="text-gray-600">{kpi.description}</p>
            <p>
              <strong>Valor Alvo:</strong> {kpi.target_value} {kpi.unit}
            </p>
            <p>
              <strong>Valor Atual:</strong> {kpi.actual_value} {kpi.unit}
            </p>
            <p>
              <strong>Status:</strong> {kpi.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeContent;
