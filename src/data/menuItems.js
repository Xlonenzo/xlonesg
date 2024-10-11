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
  User,
  Sliders,
  Building, // Adicione este import
} from 'lucide-react';

const menuItemsData = [
  { name: 'Home', icon: <Home size={20} />, path: '/' },
  { 
    name: 'Painel de Administração', 
    icon: <Settings size={20} />, 
    path: '/admin',
    subItems: [
      { name: 'Fonte de Dados', icon: <Database size={20} />, path: '/admin/data-source' },
      { name: 'Perfis e Usuários', icon: <User size={20} />, path: '/admin/user-management' },
      { name: 'Personalização', icon: <Settings size={20} />, path: '/admin/customization' },
      { name: 'Gerenciamento de Empresas', icon: <Building size={20} />, path: '/admin/company-management' }, // Adicione esta linha
    ]
  },
  {
    name: 'Análises',
    icon: <BarChart2 size={20} />,
    path: '/analytics',
    subItems: [
      { name: 'Meio Ambiente', icon: <Leaf size={20} />, path: '/analytics/environment' },
      { name: 'Governança', icon: <Briefcase size={20} />, path: '/analytics/governance' },
      { name: 'Social', icon: <Users size={20} />, path: '/analytics/social' },
      { name: 'Comparação de KPI', icon: <Sliders size={20} />, path: '/analytics/comparacao-kpi' },
    ],
  },
  { name: 'Gerenciamento de KPIs', icon: <Settings size={20} />, path: '/kpi-management' },
  { name: 'Biblioteca de Informações', icon: <Book size={20} />, path: '/info-library' },
  { name: 'Plano de Ação', icon: <ClipboardList size={20} />, path: '/action-plan' },
];

export default menuItemsData;
