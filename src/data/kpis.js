// src/data/kpis.js

const kpisData = [
  // KPIs de Meio Ambiente
  {
    id: 1,
    name: 'Redução de Emissões de CO2',
    category: 'environment',
    year: 2023,
    target_value: 100,
    actual_value: 80,
    unit: 'toneladas',
    description: 'Reduzir as emissões de CO2 em 20%',
    frequency: 'Anual',
    collection_method: 'Medição direta',
    status: 'Em andamento',
  },
  {
    id: 2,
    name: 'Consumo de Água',
    category: 'environment',
    year: 2023,
    target_value: 500,
    actual_value: 450,
    unit: 'm³',
    description: 'Reduzir o consumo de água em 10%',
    frequency: 'Mensal',
    collection_method: 'Leitura de medidores',
    status: 'Em andamento',
  },
  // KPIs Sociais
  {
    id: 3,
    name: 'Índice de Satisfação dos Funcionários',
    category: 'social',
    year: 2023,
    target_value: 85,
    actual_value: 78,
    unit: '%',
    description: 'Aumentar a satisfação dos funcionários',
    frequency: 'Anual',
    collection_method: 'Pesquisa interna',
    status: 'Em andamento',
  },
  // KPIs de Governança
  {
    id: 4,
    name: 'Treinamento em Ética',
    category: 'governance',
    year: 2023,
    target_value: 100,
    actual_value: 95,
    unit: '%',
    description: 'Treinar todos os funcionários em ética corporativa',
    frequency: 'Anual',
    collection_method: 'Registros de treinamento',
    status: 'Em andamento',
  },
  // Adicione mais KPIs conforme necessário
];

export default kpisData;
