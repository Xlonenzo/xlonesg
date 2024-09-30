// src/components/GovernancaAnalytics.js

import React from 'react';
import AnalyticsContent from './AnalyticsContent';
import FornecedoresAvaliados from './FornecedoresAvaliados';
import DiversidadeEtnicaIBGEBarras from './DiversidadeEtnicaIBGEBarras'; // Importação correta

function GovernancaAnalytics({ selectedYear }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Análise de Governança</h2>
      <AnalyticsContent category="governance" selectedYear={selectedYear} />
      <FornecedoresAvaliados />
      <DiversidadeEtnicaIBGEBarras /> {/* Renderização do componente */}
    </div>
  );
}

export default GovernancaAnalytics;
