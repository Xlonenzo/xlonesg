import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const data = [
  { nivel: 'Diretoria', valor: -0.86 },
  { nivel: 'Gerência', valor: -0.38 },
  { nivel: 'Não Liderança', valor: -0.14 },
  { nivel: 'Ponderado', valor: -0.46 },
];

const IEERComparativoChart = () => (
  <ResponsiveContainer width="100%" height={400}>
    <BarChart
      data={data}
      margin={{
        top: 20, right: 30, left: 20, bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="nivel" />
      <YAxis label={{ value: 'IEER N1', angle: -90, position: 'insideLeft' }} />
      <Tooltip />
      <Legend />
      <ReferenceLine y={0} stroke="#000" />
      <Bar dataKey="valor" fill="#8884d8" />
    </BarChart>
  </ResponsiveContainer>
);

export default IEERComparativoChart;
