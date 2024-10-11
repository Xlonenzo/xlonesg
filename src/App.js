// App.js
import React, { useState } from 'react';

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

// Importar estilos
import './index.css';

function App() {
  // Estados de personalização
  const [activeMenuItem, setActiveMenuItem] = useState('/');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [sidebarColor, setSidebarColor] = useState('#727E7A');
  const [logo, setLogo] = useState('/logo.png');
  const [buttonColor, setButtonColor] = useState('#4A5568');
  const [fontColor, setFontColor] = useState('#D1D5DB');

  // Inicializar estados com dados importados
  const [articles, setArticles] = useState(articlesData);
  const [actionPlans, setActionPlans] = useState(actionPlansData);
  const [dataSources, setDataSources] = useState(dataSourcesData);
  const [kpis, setKpis] = useState(kpisData);
  const menuItems = menuItemsData;

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
            setSidebarColor={setSidebarColor}
            setLogo={setLogo}
            setButtonColor={setButtonColor}
            setFontColor={setFontColor}
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
        return <UserManagement />;
      case '/analytics/environment':
        return <AnalyticsContent pageTitle="Meio Ambiente" />;
      case '/analytics/governance':
        return <GovernancaAnalytics />;
      case '/analytics/social':
        return <AnalyticsContent pageTitle="Social" />;
      case '/analytics/comparacao-kpi':
        return <ComparacaoKPI />;
      case '/kpi-management':
        return <KPIManagement kpis={kpis} setKpis={setKpis} buttonColor={buttonColor} />;
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
      default:
        return <div>Selecione uma opção do menu</div>;
    }
  };

  // Verifica se o usuário está logado
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-col w-full">
        <Topbar
          onLogout={handleLogout}
          sidebarColor={sidebarColor}
          buttonColor={buttonColor}
          fontColor={fontColor}
        />

        <div className="flex h-full">
          <Sidebar
            sidebarColor={sidebarColor}
            menuItems={menuItems}
            activeMenuItem={activeMenuItem}
            setActiveMenuItem={setActiveMenuItem}
            isAnalyticsOpen={isAnalyticsOpen}
            setIsAnalyticsOpen={setIsAnalyticsOpen}
            isAdminOpen={isAdminOpen}
            setIsAdminOpen={setIsAdminOpen}
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
            logo={logo}
            buttonColor={buttonColor}
            fontColor={fontColor}
          />

          <main className="flex-1 overflow-y-auto p-8">
            <h1 className="text-2xl font-bold mb-6" style={{ color: fontColor }}>
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