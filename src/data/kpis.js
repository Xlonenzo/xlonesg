const kpisData = [
  // KPIs de 1 a 20 - Empresa XLON e Setor TI
  {
    id: 1,
    name: 'Redução de Emissões de CO2',
    category: 'environment',
    year: 2023,
    target_value: 2300,
    actual_value: 2100,
    unit: 'tCO₂e',
    description: 'Reduzir as emissões de CO2 em 20%',
    frequency: 'Anual',
    collection_method: 'Inventário de Emissões de GEE (Protocolo GHG)',
    status: 'Em andamento',
    is_favorite: false,
    companhia: 'XLON',
    setor: 'TI'
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
    collection_method: 'Sistemas de Gestão de Água e Resíduos',
    status: 'Em andamento',
    is_favorite: false,
    companhia: 'XLON',
    setor: 'TI'
  },
  {
    id: 3,
    name: 'Índice de Satisfação dos Funcionários',
    category: 'social',
    year: 2023,
    target_value: 85,
    actual_value: 82,
    unit: '%',
    description: 'Aumentar a satisfação dos funcionários',
    frequency: 'Anual',
    collection_method: 'Pesquisas de Satisfação de Empregados',
    status: 'Em andamento',
    is_favorite: false,
    companhia: 'XLON',
    setor: 'TI'
  },
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
    collection_method: 'Relatórios de Saúde e Segurança no Trabalho',
    status: 'Em andamento',
    is_favorite: false,
    companhia: 'XLON',
    setor: 'TI'
  },
  {
    id: 5,
    name: 'Uso de Energia Renovável',
    category: 'environment',
    year: 2022,
    target_value: 100,
    actual_value: 85,
    unit: 'kWh',
    description: 'Aumentar o uso de energia renovável',
    frequency: 'Anual',
    collection_method: 'Monitoramento de Consumo de Energia (kWh/m²)',
    status: 'Em andamento',
    is_favorite: false,
    companhia: 'XLON',
    setor: 'TI'
  },
  {
    id: 6,
    name: 'Aumento da Reciclagem de Resíduos',
    category: 'environment',
    year: 2022,
    target_value: 75,
    actual_value: 70,
    unit: '%',
    description: 'Aumentar a reciclagem de resíduos em 25%',
    frequency: 'Anual',
    collection_method: 'Auditorias e Verificações Ambientais',
    status: 'Em andamento',
    is_favorite: false,
    companhia: 'XLON',
    setor: 'TI'
  },
  {
    id: 7,
    name: 'Treinamento de Diversidade e Inclusão',
    category: 'governance',
    year: 2022,
    target_value: 90,
    actual_value: 85,
    unit: '%',
    description: 'Garantir que 90% dos funcionários passem pelo treinamento de D&I',
    frequency: 'Anual',
    collection_method: 'Sistemas de Gestão de Recursos Humanos (HRMS)',
    status: 'Concluído',
    is_favorite: false,
    companhia: 'XLON',
    setor: 'TI'
  },
  {
    id: 8,
    name: 'Redução de Consumo de Plástico',
    category: 'environment',
    year: 2023,
    target_value: 30,
    actual_value: 25,
    unit: 'toneladas',
    description: 'Reduzir o consumo de plástico em 30%',
    frequency: 'Anual',
    collection_method: 'Auditoria de fornecedores',
    status: 'Em andamento',
    is_favorite: false,
    companhia: 'XLON',
    setor: 'TI'
  },
  {
    id: 9,
    name: 'Participação em Voluntariado',
    category: 'social',
    year: 2023,
    target_value: 50,
    actual_value: 47,
    unit: '%',
    description: 'Alcançar 50% de participação dos funcionários em programas de voluntariado',
    frequency: 'Anual',
    collection_method: 'Relatórios de voluntariado',
    status: 'Em andamento',
    is_favorite: false,
    companhia: 'XLON',
    setor: 'TI'
  },
  {
    id: 10,
    name: 'Aumento da Eficiência Energética',
    category: 'environment',
    year: 2024,
    target_value: 15,
    actual_value: 12,
    unit: '%',
    description: 'Aumentar a eficiência energética em 15%',
    frequency: 'Anual',
    collection_method: 'Medição de consumo',
    status: 'Planejado',
    is_favorite: false,
    companhia: 'XLON',
    setor: 'TI'
  },
  {
    id: 11,
    name: 'Aumento da Produtividade',
    category: 'social',
    year: 2024,
    target_value: 10,
    actual_value: 12,
    unit: 'unidades/hora',
    description: 'Aumentar a produtividade dos funcionários em 10%',
    frequency: 'Anual',
    collection_method: 'Relatórios de Produtividade',
    status: 'Concluído',
    is_favorite: false,
    companhia: 'XLON',
    setor: 'TI'
  },
  {
    id: 12,
    name: 'Eficiência Hídrica',
    category: 'environment',
    year: 2024,
    target_value: 15,
    actual_value: 17,
    unit: '%',
    description: 'Aumentar a eficiência hídrica em 15%',
    frequency: 'Anual',
    collection_method: 'Sistemas de Gestão de Água e Resíduos',
    status: 'Em andamento',
    is_favorite: false,
    companhia: 'XLON',
    setor: 'TI'
  },
  {
    id: 13,
    name: 'Redução de Consumo de Energia',
    category: 'environment',
    year: 2024,
    target_value: 10,
    actual_value: 11,
    unit: '%',
    description: 'Reduzir o consumo de energia em 10%',
    frequency: 'Mensal',
    collection_method: 'Monitoramento de Consumo de Energia (kWh/m²)',
    status: 'Em andamento',
    is_favorite: false,
    companhia: 'XLON',
    setor: 'TI'
  },
  {
    id: 14,
    name: 'Taxa de Crescimento de Lucro',
    category: 'governance',
    year: 2024,
    target_value: 15,
    actual_value: 18,
    unit: '%/ano',
    description: 'Aumentar o lucro em 15% ao ano',
    frequency: 'Anual',
    collection_method: 'Relatórios Financeiros Integrados',
    status: 'Em andamento',
    is_favorite: false,
    companhia: 'XLON',
    setor: 'TI'
  },
  {
    id: 15,
    name: 'Redução de Geração de Resíduos',
    category: 'environment',
    year: 2024,
    target_value: 25,
    actual_value: 30,
    unit: 'kg',
    description: 'Reduzir a geração de resíduos em 25%',
    frequency: 'Anual',
    collection_method: 'Auditorias e Verificações Ambientais',
    status: 'Em andamento',
    is_favorite: false,
    companhia: 'XLON',
    setor: 'TI'
  },
  {
    id: 16,
    name: 'Crescimento Populacional Sustentável',
    category: 'social',
    year: 2024,
    target_value: 2,
    actual_value: 2.1,
    unit: '%/ano',
    description: 'Manter um crescimento populacional sustentável de 2% ao ano',
    frequency: 'Anual',
    collection_method: 'Relatórios Demográficos',
    status: 'Em andamento',
    is_favorite: true,
    companhia: 'XLON',
    setor: 'TI'
  },
  {
    id: 17,
    name: 'Aumento da Satisfação dos Clientes',
    category: 'social',
    year: 2024,
    target_value: 90,
    actual_value: 92,
    unit: '%',
    description: 'Aumentar a satisfação dos clientes em 90%',
    frequency: 'Anual',
    collection_method: 'Pesquisas de Satisfação de Clientes',
    status: 'Em andamento',
    is_favorite: false,
    companhia: 'XLON',
    setor: 'TI'
  },
  {
    id: 18,
    name: 'Redução da Rotatividade de Funcionários',
    category: 'social',
    year: 2024,
    target_value: 12,
    actual_value: 10,
    unit: '%',
    description: 'Reduzir a rotatividade de funcionários em 12%',
    frequency: 'Anual',
    collection_method: 'Relatórios de Recursos Humanos',
    status: 'Concluído',
    is_favorite: true,
    companhia: 'XLON',
    setor: 'TI'
  },
  {
    id: 19,
    name: 'Redução de Emissões de Metano',
    category: 'environment',
    year: 2024,
    target_value: 150,
    actual_value: 140,
    unit: 'tCO₂e',
    description: 'Reduzir as emissões de metano em 150 toneladas equivalentes de CO2',
    frequency: 'Anual',
    collection_method: 'Inventário de Emissões de GEE (Protocolo GHG)',
    status: 'Em andamento',
    is_favorite: false,
    companhia: 'XLON',
    setor: 'TI'
  },
  {
    id: 20,
    name: 'Aumento da Eficiência de Transporte',
    category: 'environment',
    year: 2024,
    target_value: 15,
    actual_value: 17,
    unit: '%',
    description: 'Aumentar a eficiência do transporte em 15%',
    frequency: 'Anual',
    collection_method: 'Monitoramento de Consumo de Combustível',
    status: 'Em andamento',
    is_favorite: true,
    companhia: 'XLON',
    setor: 'TI'
  },

  // Novos KPIs com target_value e actual_value iguais e companhia em branco
  {
    id: 21,
    name: 'Redução de Emissões de CO2',
    category: 'environment',
    year: 2023,
    target_value: 2300,
    actual_value: 2300,  // Igual ao target_value
    unit: 'tCO₂e',
    description: 'Reduzir as emissões de CO2 em 20%',
    frequency: 'Anual',
    collection_method: 'Inventário de Emissões de GEE (Protocolo GHG)',
    status: 'Em andamento',
    is_favorite: false,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 22,
    name: 'Consumo de Água',
    category: 'environment',
    year: 2023,
    target_value: 500,
    actual_value: 500,  // Igual ao target_value
    unit: 'm³',
    description: 'Reduzir o consumo de água em 10%',
    frequency: 'Mensal',
    collection_method: 'Sistemas de Gestão de Água e Resíduos',
    status: 'Em andamento',
    is_favorite: false,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 23,
    name: 'Índice de Satisfação dos Funcionários',
    category: 'social',
    year: 2023,
    target_value: 85,
    actual_value: 85,  // Igual ao target_value
    unit: '%',
    description: 'Aumentar a satisfação dos funcionários',
    frequency: 'Anual',
    collection_method: 'Pesquisas de Satisfação de Empregados',
    status: 'Em andamento',
    is_favorite: false,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 24,
    name: 'Treinamento em Ética',
    category: 'governance',
    year: 2023,
    target_value: 100,
    actual_value: 100,  // Igual ao target_value
    unit: '%',
    description: 'Treinar todos os funcionários em ética corporativa',
    frequency: 'Anual',
    collection_method: 'Relatórios de Saúde e Segurança no Trabalho',
    status: 'Em andamento',
    is_favorite: false,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 25,
    name: 'Uso de Energia Renovável',
    category: 'environment',
    year: 2022,
    target_value: 100,
    actual_value: 100,  // Igual ao target_value
    unit: 'kWh',
    description: 'Aumentar o uso de energia renovável',
    frequency: 'Anual',
    collection_method: 'Monitoramento de Consumo de Energia (kWh/m²)',
    status: 'Em andamento',
    is_favorite: false,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 26,
    name: 'Aumento da Reciclagem de Resíduos',
    category: 'environment',
    year: 2022,
    target_value: 75,
    actual_value: 75,  // Igual ao target_value
    unit: '%',
    description: 'Aumentar a reciclagem de resíduos em 25%',
    frequency: 'Anual',
    collection_method: 'Auditorias e Verificações Ambientais',
    status: 'Em andamento',
    is_favorite: false,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 27,
    name: 'Treinamento de Diversidade e Inclusão',
    category: 'governance',
    year: 2022,
    target_value: 90,
    actual_value: 90,  // Igual ao target_value
    unit: '%',
    description: 'Garantir que 90% dos funcionários passem pelo treinamento de D&I',
    frequency: 'Anual',
    collection_method: 'Sistemas de Gestão de Recursos Humanos (HRMS)',
    status: 'Concluído',
    is_favorite: false,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 28,
    name: 'Redução de Consumo de Plástico',
    category: 'environment',
    year: 2023,
    target_value: 30,
    actual_value: 30,  // Igual ao target_value
    unit: 'toneladas',
    description: 'Reduzir o consumo de plástico em 30%',
    frequency: 'Anual',
    collection_method: 'Auditoria de fornecedores',
    status: 'Em andamento',
    is_favorite: false,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 29,
    name: 'Participação em Voluntariado',
    category: 'social',
    year: 2023,
    target_value: 50,
    actual_value: 50,  // Igual ao target_value
    unit: '%',
    description: 'Alcançar 50% de participação dos funcionários em programas de voluntariado',
    frequency: 'Anual',
    collection_method: 'Relatórios de voluntariado',
    status: 'Em andamento',
    is_favorite: false,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 30,
    name: 'Aumento da Eficiência Energética',
    category: 'environment',
    year: 2024,
    target_value: 15,
    actual_value: 15,  // Igual ao target_value
    unit: '%',
    description: 'Aumentar a eficiência energética em 15%',
    frequency: 'Anual',
    collection_method: 'Medição de consumo',
    status: 'Planejado',
    is_favorite: false,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 31,
    name: 'Aumento da Produtividade',
    category: 'social',
    year: 2024,
    target_value: 10,
    actual_value: 10,  // Igual ao target_value
    unit: 'unidades/hora',
    description: 'Aumentar a produtividade dos funcionários em 10%',
    frequency: 'Anual',
    collection_method: 'Relatórios de Produtividade',
    status: 'Concluído',
    is_favorite: false,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 32,
    name: 'Eficiência Hídrica',
    category: 'environment',
    year: 2024,
    target_value: 15,
    actual_value: 15,  // Igual ao target_value
    unit: '%',
    description: 'Aumentar a eficiência hídrica em 15%',
    frequency: 'Anual',
    collection_method: 'Sistemas de Gestão de Água e Resíduos',
    status: 'Em andamento',
    is_favorite: false,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 33,
    name: 'Redução de Consumo de Energia',
    category: 'environment',
    year: 2024,
    target_value: 10,
    actual_value: 10,  // Igual ao target_value
    unit: '%',
    description: 'Reduzir o consumo de energia em 10%',
    frequency: 'Mensal',
    collection_method: 'Monitoramento de Consumo de Energia (kWh/m²)',
    status: 'Em andamento',
    is_favorite: false,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 34,
    name: 'Taxa de Crescimento de Lucro',
    category: 'governance',
    year: 2024,
    target_value: 15,
    actual_value: 15,  // Igual ao target_value
    unit: '%/ano',
    description: 'Aumentar o lucro em 15% ao ano',
    frequency: 'Anual',
    collection_method: 'Relatórios Financeiros Integrados',
    status: 'Em andamento',
    is_favorite: false,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 35,
    name: 'Redução de Geração de Resíduos',
    category: 'environment',
    year: 2024,
    target_value: 25,
    actual_value: 25,  // Igual ao target_value
    unit: 'kg',
    description: 'Reduzir a geração de resíduos em 25%',
    frequency: 'Anual',
    collection_method: 'Auditorias e Verificações Ambientais',
    status: 'Em andamento',
    is_favorite: false,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 36,
    name: 'Crescimento Populacional Sustentável',
    category: 'social',
    year: 2024,
    target_value: 2,
    actual_value: 2,  // Igual ao target_value
    unit: '%/ano',
    description: 'Manter um crescimento populacional sustentável de 2% ao ano',
    frequency: 'Anual',
    collection_method: 'Relatórios Demográficos',
    status: 'Em andamento',
    is_favorite: true,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 37,
    name: 'Aumento da Satisfação dos Clientes',
    category: 'social',
    year: 2024,
    target_value: 90,
    actual_value: 90,  // Igual ao target_value
    unit: '%',
    description: 'Aumentar a satisfação dos clientes em 90%',
    frequency: 'Anual',
    collection_method: 'Pesquisas de Satisfação de Clientes',
    status: 'Em andamento',
    is_favorite: false,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 38,
    name: 'Redução da Rotatividade de Funcionários',
    category: 'social',
    year: 2024,
    target_value: 12,
    actual_value: 12,  // Igual ao target_value
    unit: '%',
    description: 'Reduzir a rotatividade de funcionários em 12%',
    frequency: 'Anual',
    collection_method: 'Relatórios de Recursos Humanos',
    status: 'Concluído',
    is_favorite: true,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 39,
    name: 'Redução de Emissões de Metano',
    category: 'environment',
    year: 2024,
    target_value: 150,
    actual_value: 150,  // Igual ao target_value
    unit: 'tCO₂e',
    description: 'Reduzir as emissões de metano em 150 toneladas equivalentes de CO2',
    frequency: 'Anual',
    collection_method: 'Inventário de Emissões de GEE (Protocolo GHG)',
    status: 'Em andamento',
    is_favorite: false,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 40,
    name: 'Aumento da Eficiência de Transporte',
    category: 'environment',
    year: 2024,
    target_value: 15,
    actual_value: 15,  // Igual ao target_value
    unit: '%',
    description: 'Aumentar a eficiência do transporte em 15%',
    frequency: 'Anual',
    collection_method: 'Monitoramento de Consumo de Combustível',
    status: 'Em andamento',
    is_favorite: true,
    companhia: '',  // Campo em branco
    setor: 'TI'
  },
  {
    id: 40,
    name: 'IEER - Indice ESG de Equidade Racial ',
    category: 'environment',
    year: 2024,
    target_value: 1,
    actual_value: 0,  // Igual ao target_value
    unit: '',
    description: 'IEER - Indice ESG de Equidade Racial',
    frequency: 'Anual',
    collection_method: 'Relatorios Financeiros Integrados',
    status: 'Em andamento',
    is_favorite: true,
    companhia: '',  // Campo em branco
    setor: 'TI'
  }
];

export default kpisData;
