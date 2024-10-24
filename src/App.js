import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
import CompanyManagement from './components/CompanyManagement';
import KPITemplate from './components/KPITemplate';
import KPITracker from './components/KPITracker';
import Register from './components/Register';

// Importar dados e estilos
import articlesData from './data/articles';
import actionPlansData from './data/actionPlans';
import dataSourcesData from './data/dataSources';
import kpisData from './data/kpis';
import menuItemsData from './data/menuItems';
import './index.css';

// Importar configuração
import { API_URL } from './config';

function App() {
  const [activeMenuItem, setActiveMenuItem] = useState('/');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customization, setCustomization] = useState({
    sidebar_color: '#ffffff',
    button_color: '#3490dc',
    font_color: '#333333',
    logo_url: ''
  });
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  const [articles, setArticles] = useState(articlesData);
  const [actionPlans, setActionPlans] = useState(actionPlansData);
  const [dataSources, setDataSources] = useState(dataSourcesData);
  const [kpis, setKpis] = useState(kpisData);
  const menuItems = menuItemsData;

  const [kpiTemplates, setKpiTemplates] = useState([]);
  const [kpiEntries, setKpiEntries] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    fetchCustomization();
  }, []);

  const fetchCustomization = async () => {
    try {
      const response = await axios.get(`${API_URL}/customization`);
      setCustomization(response.data);
    } catch (error) {
      console.error('Erro ao buscar customização:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogin = (userData) => {
    console.log('User data after login:', userData);
    setIsLoggedIn(true);
    setUserName(userData.username);
    setUserRole(userData.role);
    console.log('Nome do usuário definido:', userData.username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveMenuItem('/');
  };

  const handleRegister = (userData) => {
    setIsLoggedIn(true);
    setIsRegistering(false);
    setUserName(userData.username);
  };

  const renderContent = () => {
    switch (activeMenuItem) {
      case '/':
        return <HomeContent kpis={kpis} />;
      case '/admin':
        return userRole === 'admin' ? <AdminContent /> : <UnauthorizedAccess />;
      case '/admin/customization':
        return userRole === 'admin' ? (
          <Customization
            customization={customization}
            setCustomization={setCustomization}
          />
        ) : <UnauthorizedAccess />;
      case '/info-library':
        return <InfoLibrary articles={articles} setArticles={setArticles} />;
      case '/admin/data-source':
        return userRole === 'admin' ? (
          <DataSourceManagement
            dataSources={dataSources}
            setDataSources={setDataSources}
          />
        ) : <UnauthorizedAccess />;
      case '/admin/user-management':
        return userRole === 'admin' ? (
          <UserManagement buttonColor={customization.button_color} />
        ) : <UnauthorizedAccess />;
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
        return ['admin', 'editor'].includes(userRole) ? (
          <KPITemplate kpis={kpiTemplates} setKpis={setKpiTemplates} sidebarColor={customization.sidebar_color} buttonColor={customization.button_color} />
        ) : <UnauthorizedAccess />;
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
        return userRole === 'admin' ? <CompanyManagement /> : <UnauthorizedAccess />;
      case '/kpi-tracker':
        return ['admin', 'editor'].includes(userRole) ? (
          <KPITracker kpiEntries={kpiEntries} setKpiEntries={setKpiEntries} sidebarColor={customization.sidebar_color} buttonColor={customization.button_color} />
        ) : <UnauthorizedAccess />;
      default:
        return <div>Selecione uma opção do menu</div>;
    }
  };

  if (!isLoggedIn) {
    if (isRegistering) {
      return <Register onRegister={handleRegister} onCancel={() => setIsRegistering(false)} />;
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
          userName={userName}
          role={userRole}
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

// Componente para exibir mensagem de acesso não autorizado
const UnauthorizedAccess = () => (
  <div className="text-red-600 font-bold">
    Acesso não autorizado. Você não tem permissão para visualizar esta página.
  </div>
);
