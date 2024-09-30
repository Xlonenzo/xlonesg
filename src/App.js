// src/App.js

import React, { useState } from 'react';
import {
  Home,
  Settings,
  BarChart2,
  Leaf,
  Users,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Menu,
  Book,
  ClipboardList,
  Database,
} from 'lucide-react';

// Importar dados de arquivos separados
import articlesData from './data/articles';
import actionPlansData from './data/actionPlans';
import dataSourcesData from './data/dataSources';
import yearsData from './data/years';
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
import KPIChart from './components/KPIChart';
import FornecedoresAvaliados from './components/FornecedoresAvaliados';

// Importar estilos (se estiver usando Tailwind CSS ou outro CSS)
import './index.css';

function App() {
  const [activeMenuItem, setActiveMenuItem] = useState('/');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Inicializar estado com dados importados
  const [articles, setArticles] = useState(articlesData);
  const [actionPlans, setActionPlans] = useState(actionPlansData);
  const [dataSources, setDataSources] = useState(dataSourcesData);
  const years = yearsData;
  const menuItems = menuItemsData;

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const renderMenuItem = (item, isSubItem = false) => (
    <li key={item.path}>
      <button
        onClick={() => {
          if (item.subItems) {
            if (item.name === 'Análises') {
              setIsAnalyticsOpen(!isAnalyticsOpen);
            }
            if (item.name === 'Painel de Administração') {
              setIsAdminOpen(!isAdminOpen);
            }
          } else {
            setActiveMenuItem(item.path);
          }
        }}
        className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md ${
          activeMenuItem === item.path
            ? 'bg-gray-900 text-white'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        } ${isSubItem ? 'pl-8' : ''}`}
      >
        {item.icon}
        {!isSidebarCollapsed && (
          <>
            <span className="ml-3">{item.name}</span>
            {item.subItems && (
              <span className="ml-auto">
                {(item.name === 'Análises' && isAnalyticsOpen) ||
                (item.name === 'Painel de Administração' && isAdminOpen) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </span>
            )}
          </>
        )}
      </button>
      {!isSidebarCollapsed &&
        item.subItems &&
        ((item.name === 'Análises' && isAnalyticsOpen) ||
          (item.name === 'Painel de Administração' && isAdminOpen)) && (
          <ul className="mt-1 space-y-1">
            {item.subItems.map((subItem) => (
              <li key={subItem.path}>
                <button
                  onClick={() => setActiveMenuItem(subItem.path)}
                  className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md ${
                    activeMenuItem === subItem.path
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } pl-8`}
                >
                  {subItem.icon}
                  <span className="ml-3">{subItem.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
    </li>
  );

  const renderContent = () => {
    switch (activeMenuItem) {
      case '/':
        return <HomeContent selectedYear={selectedYear} />;
      case '/admin':
        return <AdminContent />;
      case '/info-library':
        return <InfoLibrary articles={articles} setArticles={setArticles} />;
      case '/admin/data-source':
        return (
          <DataSourceManagement
            dataSources={dataSources}
            setDataSources={setDataSources}
          />
        );
      case '/analytics/environment':
        return (
          <AnalyticsContent category="environment" selectedYear={selectedYear} />
        );
      case '/analytics/governance':
        return <GovernancaAnalytics selectedYear={selectedYear} />;
      case '/analytics/social':
        return (
          <AnalyticsContent category="social" selectedYear={selectedYear} />
        );
      case '/kpi-management':
        return <KPIManagement />;
      case '/action-plan':
        return (
          <ActionPlanManagement
            actionPlans={actionPlans}
            setActionPlans={setActionPlans}
          />
        );
      default:
        return <div>Selecione uma opção do menu</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside
        className={`bg-gray-800 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-between h-16 bg-gray-900 px-4">
          {!isSidebarCollapsed && (
            <span className="text-white font-bold text-lg">ESG Dashboard</span>
          )}
          <button onClick={toggleSidebar} className="text-white focus:outline-none">
            <Menu size={24} />
          </button>
        </div>
        <nav className="mt-5">
          <ul className="space-y-2 px-2">
            {menuItems.map((item) => renderMenuItem(item))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard ESG</h1>
          <div className="flex items-center">
            <label
              htmlFor="year-select"
              className="mr-2 text-sm font-medium text-gray-700"
            >
              Ano:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
