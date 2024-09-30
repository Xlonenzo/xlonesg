// src/components/KPIChart.js

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function KPIChart({ data, title }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">{title}</h3>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="target" fill="#8884d8" name="Valor Alvo" />
            <Bar dataKey="actual" fill="#82ca9d" name="Valor Atual" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default KPIChart;
