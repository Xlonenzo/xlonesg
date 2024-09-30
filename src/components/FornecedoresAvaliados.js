// src/components/FornecedoresAvaliados.js

import React, { useState } from 'react';
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

const initialData = [
  { name: 'Direitos Humanos', percentual: 75 },
  { name: 'Práticas Trabalhistas', percentual: 82 },
  { name: 'Gestão Ambiental', percentual: 68 },
  { name: 'Ética e Anticorrupção', percentual: 90 },
  { name: 'Saúde e Segurança', percentual: 85 },
  { name: 'Diversidade e Inclusão', percentual: 60 },
];

export default function FornecedoresAvaliados() {
  const [data, setData] = useState(initialData);

  const simulateDataUpdate = () => {
    const newData = data.map((item) => ({
      ...item,
      percentual: Math.min(
        100,
        Math.max(0, item.percentual + Math.floor(Math.random() * 21) - 10)
      ),
    }));
    setData(newData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-md rounded p-6">
      <h3 className="text-xl font-bold">Percentual de Fornecedores Avaliados</h3>
      <p className="text-gray-600">Critérios Sociais e Ambientais</p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="name" type="category" width={150} />
          <Tooltip
            formatter={(value) => `${value}%`}
            labelStyle={{ color: 'black' }}
            contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
          />
          <Legend />
          <Bar dataKey="percentual" fill="#8884d8" name="Percentual Avaliado" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center">
        <button
          onClick={simulateDataUpdate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Atualizar Dados
        </button>
      </div>
    </div>
  );
}
