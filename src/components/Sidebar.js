import React from 'react';
import { ChevronDown, ChevronRight, Menu } from 'lucide-react';

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
  logo
}) {
  // Function to render each menu item
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
      }`}
    >
      {/* Logo e título à esquerda, botão de colapso à direita */}
      <div className="flex items-center justify-between h-16 px-4">
        {/* Exibe o logo e o título apenas quando a sidebar não está colapsada */}
        {!isSidebarCollapsed && (
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
            <span className="text-white font-bold text-lg ml-2">ESG Dashboard</span>
          </div>
        )}
        <button onClick={toggleSidebar} className="text-white focus:outline-none">
          <Menu size={24} />
        </button>
      </div>

      {/* Menu de navegação */}
      <nav className="mt-5">
        <ul className="space-y-2 px-2">{menuItems.map((item) => renderMenuItem(item))}</ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
