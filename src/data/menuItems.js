// src/data/menuItems.js
import React from 'react';
import {
  Home,
  Settings,
  BarChart2,
  Leaf,
  Users,
  Briefcase,
  Book,
  ClipboardList,
  Database,
} from 'lucide-react';

const menuItems = [
  { name: 'Home', icon: <Home size={20} />, path: '/' },
  {
    name: 'Painel de Administração',
    icon: <Settings size={20} />,
    path: '/admin',
    subItems: [
      {
        name: 'Fonte de Dados',
        icon: <Database size={20} />,
        path: '/admin/data-source',
      },
    ],
  },
  {
    name: 'Análises',
    icon: <BarChart2 size={20} />,
    path: '/analytics',
    subItems: [
      {
        name: 'Meio Ambiente',
        icon: <Leaf size={20} />,
        path: '/analytics/environment',
      },
      {
        name: 'Governança',
        icon: <Briefcase size={20} />,
        path: '/analytics/governance',
      },
      {
        name: 'Social',
        icon: <Users size={20} />,
        path: '/analytics/social',
      },
    ],
  },
  {
    name: 'Gerenciamento de KPIs',
    icon: <Settings size={20} />,
    path: '/kpi-management',
  },
  {
    name: 'Biblioteca de Informações',
    icon: <Book size={20} />,
    path: '/info-library',
  },
  {
    name: 'Plano de Ação',
    icon: <ClipboardList size={20} />,
    path: '/action-plan',
  },
];

export default menuItems;
