// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Remova as importações não utilizadas
// import {
//   Home,
//   Settings,
//   BarChart2,
//   Leaf,
//   Users,
//   Briefcase,
//   ChevronDown,
//   ChevronRight,
//   Menu,
//   Book,
//   ClipboardList,
//   Database,
// } from 'lucide-react';

// Importar dados de arquivos separados
import articlesData from './data/articles';
import actionPlansData from './data/actionPlans';
import dataSourcesData from './data/dataSources';
import kpisData from './data/kpis';
import menuItemsData from './data/menuItems';

// Importar componentes
import HomeContent from './components/HomeContent';
import AdminContent from './components/AdminContent';
import KPIManagement from './components/KPIManagement';
import InfoLibrary from './components/InfoLibrary';
import ActionPlanManagement from './components/ActionPlanManagement';
import DataSourceManagement from './components/DataSourceManagement';
import GovernancaAnalytics from './components/GovernancaAnalytics';
import AnalyticsContent from './components/AnalyticsContent';
import UserManagement from './components/admin/UserManagement';
import LoginPage from './components/LoginPage';
import ComparacaoKPI from './components/ComparacaoKPI';
import Customization from './components/Customization';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import CompanyManagement from './components/CompanyManagement'; // Adicione esta linha
import KPITemplate from './components/KPITemplate';
import KPITracker from './components/KPITracker';
import Register from './components/Register';

// Importar estilos
import './index.css';

function App() {
  // Estados de personalização
  const [activeMenuItem, setActiveMenuItem] = useState('/');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [customization, setCustomization] = useState({
    sidebar_color: '#ffffff',
    button_color: '#3490dc',
    font_color: '#333333',
    logo_url: ''
  });

  // Inicializar estados com dados importados
  const [articles, setArticles] = useState(articlesData);
  const [actionPlans, setActionPlans] = useState(actionPlansData);
  const [dataSources, setDataSources] = useState(dataSourcesData);
  const [kpis, setKpis] = useState(kpisData);
  const menuItems = menuItemsData;

  // Adicione este novo estado para os templates de KPI
  const [kpiTemplates, setKpiTemplates] = useState([]);

  // Adicione este novo estado para as entradas de KPI
  const [kpiEntries, setKpiEntries] = useState([]);

  // Função para alternar a sidebar
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Funções de login/logout
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = (userData) => {
    setIsLoggedIn(true);
    setIsRegistering(false);
    // Aqui você pode adicionar lógica adicional, como salvar os dados do usuário no estado
  };

  useEffect(() => {
    fetchCustomization();
  }, []);

  const fetchCustomization = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/customization');
      setCustomization(response.data);
    } catch (error) {
      console.error('Erro ao buscar customização:', error);
    }
  };

  // Função para renderizar o conteúdo baseado no item de menu ativo
  const renderContent = () => {
    switch (activeMenuItem) {
      case '/':
        return <HomeContent kpis={kpis} />;
      case '/admin':
        return <AdminContent />;
      case '/admin/customization':
        return (
          <Customization
            customization={customization}
            setCustomization={setCustomization}
          />
        );
      case '/info-library':
        return <InfoLibrary articles={articles} setArticles={setArticles} />;
      case '/admin/data-source':
        return (
          <DataSourceManagement
            dataSources={dataSources}
            setDataSources={setDataSources}
          />
        );
      case '/admin/user-management':
        return <UserManagement buttonColor={customization.button_color} />;
      case '/analytics/environment':
        return <AnalyticsContent pageTitle="Meio Ambiente" />;
      case '/analytics/governance':
        return <GovernancaAnalytics />;
      case '/analytics/social':
        return <AnalyticsContent pageTitle="Social" />;
      case '/analytics/comparacao-kpi':
        return <ComparacaoKPI />;
      case '/kpi-management':
        return <KPIManagement kpis={kpis} setKpis={setKpis} buttonColor={customization.button_color} />;
      case '/kpi-templates':
        return <KPITemplate kpis={kpiTemplates} setKpis={setKpiTemplates} sidebarColor={customization.sidebar_color} buttonColor={customization.button_color} />;
      case '/action-plan':
        return (
          <ActionPlanManagement
            actionPlans={actionPlans}
            setActionPlans={setActionPlans}
            kpis={kpis}
            setKpis={setKpis}
          />
        );
      case '/admin/company-management':
        return <CompanyManagement />;
      case '/kpi-tracker':
        return <KPITracker kpiEntries={kpiEntries} setKpiEntries={setKpiEntries} sidebarColor={customization.sidebar_color} buttonColor={customization.button_color} />;
      default:
        return <div>Selecione uma opção do menu</div>;
    }
  };

  // Verifica se o usuário está logado
  if (!isLoggedIn) {
    if (isRegistering) {
      return <Register onRegister={handleRegister} />;
    }
    return <LoginPage onLogin={handleLogin} onRegister={() => setIsRegistering(true)} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-col w-full">
        <Topbar
          onLogout={handleLogout}
          sidebarColor={customization.sidebar_color}
          buttonColor={customization.button_color}
          fontColor={customization.font_color}
        />

        <div className="flex h-full">
          <Sidebar
            sidebarColor={customization.sidebar_color}
            menuItems={menuItems}
            activeMenuItem={activeMenuItem}
            setActiveMenuItem={setActiveMenuItem}
            isAnalyticsOpen={isAnalyticsOpen}
            setIsAnalyticsOpen={setIsAnalyticsOpen}
            isAdminOpen={isAdminOpen}
            setIsAdminOpen={setIsAdminOpen}
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
            logo={customization.logo_url}
            buttonColor={customization.button_color}
            fontColor={customization.font_color}
          />

          <main className="flex-1 overflow-y-auto p-8">
            <h1 className="text-2xl font-bold mb-6" style={{ color: customization.font_color }}>
              Dashboard ESG
            </h1>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
