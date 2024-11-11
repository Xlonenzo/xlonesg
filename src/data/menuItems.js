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
  Building,
  FileText,
  Target,
  TreePine,
  TruckIcon,
  Wallet,
  Shield,
  Link
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
      { name: 'Empresas', icon: <Building size={20} />, path: '/admin/company-management' },
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
  { name: 'KPIs', icon: <FileText size={20} />, path: '/kpi-templates' },
  { name: 'Rastreador de KPI', icon: <Target size={20} />, path: '/kpi-tracker' },
  { name: 'Gerenciador de Títulos', icon: <FileText size={20} />, path: '/bond-management' },
  { 
    name: 'Rastreador ESG', 
    icon: <Target size={20} />, 
    path: '/esg-tracker',
    subItems: [
      { name: 'Projetos ESG', icon: <TreePine size={20} />, path: '/esg-tracker/projects' },
      { name: 'Dados de Emissão', icon: <Leaf size={20} />, path: '/esg-tracker/emissions' },
      { name: 'Fornecedores', icon: <TruckIcon size={20} />, path: '/esg-tracker/suppliers' },
      { name: 'Materialidade', icon: <BarChart2 size={20} />, path: '/esg-tracker/materiality' },
      { name: 'Investimentos', icon: <Wallet size={20} />, path: '/esg-tracker/investments' },
      { name: 'Compliance', icon: <Shield size={20} />, path: '/esg-tracker/compliance' }
    ] 
  },
  { name: 'Biblioteca de Informações', icon: <Book size={20} />, path: '/info-library' },
  { name: 'Plano de Ação', icon: <ClipboardList size={20} />, path: '/action-plan' },
  {
    name: 'Vínculos',
    icon: <Link size={20} />,
    path: '/bonds/projects',
    subItems: [
      { name: 'Títulos e Projetos', icon: <Link size={20} />, path: '/bonds/projects' },
    ]
  }
];

export default menuItemsData;
