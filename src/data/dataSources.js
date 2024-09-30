// src/data/dataSources.js
const dataSources = [
  {
    id: 1,
    name: 'API de Consumo de Energia',
    type: 'api',
    connectionString: 'https://api.energia.com/v1',
    lastSync: '2023-09-15 14:30',
    status: 'active',
  },
  {
    id: 2,
    name: 'Banco de Dados de Recursos Humanos',
    type: 'database',
    connectionString: 'postgresql://user:password@host:5432/db',
    lastSync: '2023-09-14 09:15',
    status: 'active',
  },
  {
    id: 3,
    name: 'Arquivo de Emissões de Carbono',
    type: 'file',
    connectionString: '/path/to/carbon_emissions.csv',
    lastSync: '2023-09-13 16:45',
    status: 'error',
  },
];

export default dataSources;
