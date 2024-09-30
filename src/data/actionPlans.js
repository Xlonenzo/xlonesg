// src/data/actionPlans.js
const actionPlans = [
  {
    id: 1,
    objective: 'Reduzir as emissões de carbono em 15% nos próximos 12 meses',
    tasks: [
      {
        id: 1,
        description: 'Realizar auditoria energética em todas as instalações',
        responsible: 'Equipe de Sustentabilidade',
        resources: 'R$ 50.000 para contratação de auditoria externa',
        deadline: '31/12/2023',
        kpis: ['IEER', 'Emissões de GEE'],
        risks: 'Atrasos na contratação da auditoria externa',
      },
      {
        id: 2,
        description: 'Implementar sistema de monitoramento de energia em tempo real',
        responsible: 'Departamento de TI',
        resources: 'R$ 100.000 para aquisição e instalação de sensores e software',
        deadline: '31/03/2024',
        kpis: ['IEER'],
        risks: 'Problemas de compatibilidade com sistemas existentes',
      },
    ],
    startDate: '01/01/2024',
    endDate: '31/12/2024',
  },
];

export default actionPlans;
