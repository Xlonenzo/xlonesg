// components/KPI.js
import React from 'react';

function KPI({ kpi }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">{kpi.name}</h3>
      <p className="text-3xl font-bold mb-2">
        {kpi.actual_value} / {kpi.target_value} {kpi.unit}
      </p>
      <p className="text-sm text-gray-600 mb-2">{kpi.description}</p>
      <p className="text-sm">
        <strong>Frequência:</strong> {kpi.frequency}
      </p>
      <p className="text-sm">
        <strong>Método de Coleta:</strong> {kpi.collection_method}
      </p>
      <p className="text-sm">
        <strong>Status:</strong> {kpi.status}
      </p>
    </div>
  );
}

export default KPI;
