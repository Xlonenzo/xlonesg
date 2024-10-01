// src/components/HomeContent.jsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPI from './KPI';

function HomeContent({ kpis, selectedYear }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Visão Geral {selectedYear}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {kpis.slice(0, 3).map(kpi => (
          <KPI key={kpi.id} kpi={kpi} />
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">Visão Geral dos KPIs</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={kpis} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="actual_value" fill="#8884d8" name="Valor Atual" />
            <Bar dataKey="target_value" fill="#82ca9d" name="Valor Alvo" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default HomeContent;