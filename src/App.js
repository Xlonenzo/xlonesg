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
import BondManagement from './components/BondManagement';
import BondProjectRelation from './components/BondProjectRelation';
import EmissionTracking from './components/EmissionTracking';
import ESGProjects from './components/ESGProjects';
import Suppliers from './components/Suppliers';
import Materiality from './components/Materiality';
import Investment from './components/Investment';
import Compliance from './components/Compliance';
import SustainabilityReport from './components/SustainabilityReport';
import PortfolioODS from './components/PortfolioODS';
import EnvironmentalDocuments from './components/EnvironmentalDocuments';
import EnvironmentalImpactStudy from './components/EnvironmentalImpactStudy';
import IoTConfigDashboard from './components/IoTConfigDashboard';

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
  const [isESGTrackerOpen, setIsESGTrackerOpen] = useState(false);
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

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetchCustomization();
  }, []);

  const fetchCustomization = async () => {
    try {
      console.log('Iniciando busca de customização...');
      const response = await axios.get(`${API_URL}/customization`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('Resposta da customização:', response.data);
      setCustomization(response.data);
    } catch (error) {
      console.error('Erro completo:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
    }
  };

  // Adicione um useEffect para monitorar mudanças na customização
  useEffect(() => {
    console.log('Customização atualizada:', customization);
  }, [customization]);

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

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Aqui você pode adicionar lógica adicional para mudar cores/temas
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
        return <InfoLibrary 
          buttonColor={customization.button_color}
          sidebarColor={customization.sidebar_color}
          articles={articles} 
          setArticles={setArticles} 
        />;
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
        return userRole === 'admin' ? (
          <CompanyManagement buttonColor={customization.button_color} />
        ) : <UnauthorizedAccess />;
      case '/kpi-tracker':
        return ['admin', 'editor'].includes(userRole) ? (
          <KPITracker kpiEntries={kpiEntries} setKpiEntries={setKpiEntries} sidebarColor={customization.sidebar_color} buttonColor={customization.button_color} />
        ) : <UnauthorizedAccess />;
      case '/bond-management':
        return ['admin', 'editor'].includes(userRole) ? (
          <BondManagement 
            sidebarColor={customization.sidebar_color} 
            buttonColor={customization.button_color} 
          />
        ) : <UnauthorizedAccess />;
      case '/esg-tracker/projects':
        return ['admin', 'editor'].includes(userRole) ? (
          <ESGProjects 
            sidebarColor={customization.sidebar_color} 
            buttonColor={customization.button_color} 
          />
        ) : <UnauthorizedAccess />;
      case '/esg-tracker/emissions':
        return ['admin', 'editor'].includes(userRole) ? (
          <EmissionTracking 
            sidebarColor={customization.sidebar_color} 
            buttonColor={customization.button_color} 
          />
        ) : <UnauthorizedAccess />;
      case '/esg-tracker/suppliers':
        return ['admin', 'editor'].includes(userRole) ? (
          <Suppliers 
            sidebarColor={customization.sidebar_color} 
            buttonColor={customization.button_color} 
          />
        ) : <UnauthorizedAccess />;
      case '/esg-tracker/materiality':
        return ['admin', 'editor'].includes(userRole) ? (
          <Materiality 
            sidebarColor={customization.sidebar_color} 
            buttonColor={customization.button_color} 
          />
        ) : <UnauthorizedAccess />;
      case '/esg-tracker/investments':
        return ['admin', 'editor'].includes(userRole) ? (
          <Investment 
            sidebarColor={customization.sidebar_color} 
            buttonColor={customization.button_color} 
          />
        ) : <UnauthorizedAccess />;
      case '/esg-tracker/compliance':
        return ['admin', 'editor'].includes(userRole) ? (
          <Compliance 
            sidebarColor={customization.sidebar_color} 
            buttonColor={customization.button_color} 
          />
        ) : <UnauthorizedAccess />;
      case '/bonds/list':
        return ['admin', 'editor'].includes(userRole) ? (
          <BondManagement 
            sidebarColor={customization.sidebar_color} 
            buttonColor={customization.button_color} 
          />
        ) : <UnauthorizedAccess />;
      case '/bonds/relationships':
        return ['admin', 'editor'].includes(userRole) ? (
          <BondProjectRelation 
            sidebarColor={customization.sidebar_color} 
            buttonColor={customization.button_color} 
          />
        ) : <UnauthorizedAccess />;
      case '/bonds/sustainability-report':
        return ['admin', 'editor'].includes(userRole) ? (
          <SustainabilityReport 
            sidebarColor={customization.sidebar_color} 
            buttonColor={customization.button_color} 
          />
        ) : <UnauthorizedAccess />;
      case '/bonds/portfolio-ods':
        return ['admin', 'editor'].includes(userRole) ? (
          <PortfolioODS 
            sidebarColor={customization.sidebar_color} 
            buttonColor={customization.button_color} 
          />
        ) : <UnauthorizedAccess />;

      case '/esg-tracker/environmental-documents':
        return ['admin', 'editor'].includes(userRole) ? (
          <EnvironmentalDocuments 
            sidebarColor={customization.sidebar_color} 
            buttonColor={customization.button_color} 
          />
        ) : <UnauthorizedAccess />;

      case '/esg-tracker/environmental-impact':
        return ['admin', 'editor'].includes(userRole) ? (
          <EnvironmentalImpactStudy 
            sidebarColor={customization.sidebar_color} 
            buttonColor={customization.button_color} 
          />
        ) : <UnauthorizedAccess />;
      case '/admin/iot-config':
        return userRole === 'admin' ? (
          <IoTConfigDashboard 
            sidebarColor={customization.sidebar_color} 
            buttonColor={customization.button_color} 
          />
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
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
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
            isESGTrackerOpen={isESGTrackerOpen}
            setIsESGTrackerOpen={setIsESGTrackerOpen}
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
            logo={customization.logo_url}
            buttonColor={customization.button_color}
            fontColor={customization.font_color}
          />

          <main className="flex-1 overflow-y-auto p-8">
          
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
