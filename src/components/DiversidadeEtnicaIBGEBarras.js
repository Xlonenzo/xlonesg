// src/components/DiversidadeEtnicaIBGEBarras.js

import React from 'react';
import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'; // Ajuste o caminho se necessário
import { Badge } from './ui/badge'; // Ajuste o caminho se necessário
import { Users, CalendarClock, ClipboardList, TrendingUp } from 'lucide-react';

const COLORS = {
  Branca: '#8884d8',
  Preta: '#82ca9d',
  Parda: '#ffc658',
  Amarela: '#ff7300',
  Indigena: '#0088FE',
  'Nao declarada': '#00C49F'
};

const initialData = {
  name: 'Diversidade Étnica no Quadro de Funcionários',
  unit: '%',
  category: 'governance', // Consistência com kpis.js
  description: 'Distribuição étnica dos funcionários conforme categorias do IBGE ao longo dos anos',
  frequency: 'Anual',
  collection_method: 'Pesquisa Interna de Diversidade',
  status: 'Monitoramento Contínuo',
  current_year: 2023,
  ethnic_data: [
    { year: 2019, Branca: 50, Preta: 7, Parda: 40, Amarela: 1, Indigena: 0.5, 'Nao declarada': 1.5 },
    { year: 2020, Branca: 48, Preta: 8, Parda: 41, Amarela: 1, Indigena: 0.5, 'Nao declarada': 1.5 },
    { year: 2021, Branca: 47, Preta: 8.5, Parda: 42, Amarela: 1, Indigena: 0.5, 'Nao declarada': 1 },
    { year: 2022, Branca: 46, Preta: 9, Parda: 42.5, Amarela: 1, Indigena: 0.5, 'Nao declarada': 1 },
    { year: 2023, Branca: 45.2, Preta: 9.1, Parda: 43.5, Amarela: 1.1, Indigena: 0.5, 'Nao declarada': 0.6 },
  ]
};

export default function DiversidadeEtnicaIBGEBarras() {
  const [data, setData] = useState(initialData);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow-md">
          <p className="font-bold">{`Ano: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(1)}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{data.name}</CardTitle>
        <CardDescription>{data.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold">Ano Atual: {data.current_year}</div>
          <Badge variant="outline" className="bg-blue-500 text-white">
            {data.status}
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data.ethnic_data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {Object.keys(COLORS).map((key) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={COLORS[key]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span><strong>Categoria:</strong> {data.category}</span>
          </div>
          <div className="flex items-center">
            <CalendarClock className="mr-2 h-4 w-4" />
            <span><strong>Frequência:</strong> {data.frequency}</span>
          </div>
          <div className="flex items-center col-span-2">
            <ClipboardList className="mr-2 h-4 w-4" />
            <span><strong>Método de Coleta:</strong> {data.collection_method}</span>
          </div>
          <div className="flex items-center col-span-2">
            <TrendingUp className="mr-2 h-4 w-4" />
            <span><strong>Status:</strong> {data.status}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
