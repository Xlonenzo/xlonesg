import React from 'react';
import { Bell, LogOut } from 'lucide-react';

const Topbar = ({ onLogout, sidebarColor }) => {
  return (
    <div
      style={{ backgroundColor: sidebarColor }} // Aplica a cor dinamicamente no topo
      className="text-white h-16 flex justify-between items-center px-4"
    >
      <div className="text-lg font-bold">ESG Dashboard</div>
      <div className="flex items-center">
        <button className="mr-4 relative">
          <Bell size={24} />
          <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
        </button>
        <button onClick={onLogout} className="flex items-center text-white">
          <LogOut size={24} className="mr-2" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Topbar;
