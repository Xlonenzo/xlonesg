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
  logo // Recebe o logo dinamicamente
}) {
  // Function to render each menu item
  const renderMenuItem = (item, isSubItem = false) => (
    <li key={item.path}>
      <button
        onClick={() => {
          setActiveMenuItem(item.path);
          if (item.name === 'Análises') {
            setIsAnalyticsOpen(!isAnalyticsOpen);
          }
          if (item.name === 'Painel de Administração') {
            setIsAdminOpen(!isAdminOpen);
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
      style={{ backgroundColor: sidebarColor }} // Aplica a cor dinamicamente no corpo da sidebar
      className={`transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Topo da Sidebar */}
      <div
        style={{ backgroundColor: sidebarColor }} // Aplica a cor dinamicamente no topo da sidebar
        className="flex items-center justify-between h-16 px-4"
      >
        {/* Exibir o logo apenas quando a sidebar não estiver colapsada */}
        {!isSidebarCollapsed && (
          <img
            src={logo} // Caminho dinâmico da logo
            alt="Logo"
            className="h-10 w-auto" // Tamanho do logo
          />
        )}
        <button onClick={toggleSidebar} className="text-white focus:outline-none">
          <Menu size={24} />
        </button>
      </div>
      {/* Conteúdo do menu */}
      <nav className="mt-5">
        <ul className="space-y-2 px-2">{menuItems.map((item) => renderMenuItem(item))}</ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
