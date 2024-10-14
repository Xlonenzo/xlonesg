import React from 'react';

function KPICard({ kpi }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-2">
      <h3 className="text-lg font-bold mb-1">{kpi.template_name}</h3>
      <p className="text-sm text-gray-600 mb-2">{kpi.description}</p>
      <p className="text-xs text-gray-600 mb-1">Ano: {kpi.year}</p>
      <p className="text-xs text-gray-600 mb-1">Mês: {kpi.month}</p>
      <p className="text-xs text-gray-600 mb-1">Unidade: {kpi.unit}</p>
      <p className="text-xs text-gray-600 mb-1">CNPJ: {kpi.cnpj}</p>
      <p className="text-xs text-gray-600 mb-1">Estado: {kpi.state}</p>
      <p className="text-sm text-green-600 font-bold">Atual: {kpi.actual_value}</p>
      <p className="text-sm text-blue-600 font-bold">Alvo: {kpi.target_value}</p>
      <p className="text-xs text-gray-600 mt-1">Status: {kpi.status}</p>
      <p className="text-xs text-gray-600 mt-1">Favorito: {kpi.isfavorite ? 'Sim' : 'Não'}</p>
    </div>
  );
}

export default KPICard;
