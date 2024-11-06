// Sidebar.js
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Menu } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

function Sidebar({
  menuItems,
  activeMenuItem,
  setActiveMenuItem,
  isAnalyticsOpen,
  setIsAnalyticsOpen,
  isAdminOpen,
  setIsAdminOpen,
  isSidebarCollapsed,
  toggleSidebar,
  sidebarColor,
  logo,
  buttonColor,
  fontColor
}) {
  const [customization, setCustomization] = useState({
    primary_color: '#1a73e8',
    logo_url: '/static/logos/logo.png'
  });

  useEffect(() => {
    const fetchCustomization = async () => {
      try {
        const response = await axios.get(`${API_URL}/customization`);
        setCustomization(response.data);
      } catch (error) {
        console.error('Erro ao buscar customização:', error);
      }
    };

    fetchCustomization();
  }, []);

  // Função para renderizar cada item do menu
  const renderMenuItem = (item, isSubItem = false) => (
    <li key={item.path}>
      <button
        onClick={() => {
          if (item.name === 'Análises') {
            setIsAnalyticsOpen(!isAnalyticsOpen);
          } else if (item.name === 'Painel de Administração') {
            setIsAdminOpen(!isAdminOpen);
          } else {
            setActiveMenuItem(item.path);
          }
        }}
        style={{
          backgroundColor: activeMenuItem === item.path ? buttonColor : 'transparent',
          color: activeMenuItem === item.path ? '#FFFFFF' : fontColor,
        }}
        className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md ${
          isSubItem ? 'pl-8' : ''
        } ${activeMenuItem === item.path ? '' : 'hover:bg-gray-700'}`}
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

      {/* Renderizar subitens se existirem */}
      {!isSidebarCollapsed &&
        item.subItems &&
        ((item.name === 'Análises' && isAnalyticsOpen) ||
          (item.name === 'Painel de Administração' && isAdminOpen)) && (
          <ul className="mt-1 space-y-1">
            {item.subItems.map((subItem) => renderMenuItem(subItem, true))}
          </ul>
        )}
    </li>
  );

  return (
    <aside
      style={{ backgroundColor: sidebarColor }}
      className={`transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      } h-full`}
    >
      {/* Cabeçalho da Sidebar: Logo e Título */}
      <div className="flex items-center justify-between h-16 px-4">
        {/* Condicionalmente renderizar logo e título somente se a sidebar não estiver colapsada */}
        {!isSidebarCollapsed && (
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex items-center justify-center p-4">
              <img 
                src={`${API_URL}${customization.logo_url}`} 
                alt="Logo" 
                className="h-12 w-auto"  // Ajuste o tamanho conforme necessário
              />
            </div>
            {/* Título */}
            <span style={{ color: fontColor }} className="font-bold text-lg ml-2">ESG Dashboard</span>
          </div>
        )}
        {/* Botão para Colapsar/Expandir Sidebar */}
        <button onClick={toggleSidebar} style={{ color: fontColor }} className="focus:outline-none">
          <Menu size={24} />
        </button>
      </div>

      {/* Menu de Navegação */}
      <nav className="mt-5">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => renderMenuItem(item))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
