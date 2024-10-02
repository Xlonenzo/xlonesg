import React, { useState, useEffect, useRef } from 'react';
import { Bell, LogOut } from 'lucide-react';

const Topbar = ({ onLogout, sidebarColor }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false); // Estado para controlar o dropdown de notificações
  const notificationRef = useRef(null); // Ref para o botão de notificações e o dropdown

  // Função para alternar o dropdown de notificações
  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  // Fechar o dropdown ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      style={{ backgroundColor: sidebarColor }} // Aplica a cor dinamicamente no topo
      className="text-white h-16 flex justify-between items-center px-4"
    >
      {/* Espaço à esquerda para manter a estrutura */}
      <div />

      {/* Notificações e Logout à direita */}
      <div className="flex items-center relative ml-auto" ref={notificationRef}>
        {/* Botão de Notificações */}
        <button onClick={toggleNotifications} className="mr-4 relative">
          <Bell size={24} />
          {/* Indicador de notificação */}
          <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
        </button>

        {/* Dropdown de Notificações */}
        {isNotificationOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded-lg shadow-lg z-10">
            <ul className="p-4">
              <li className="mb-2 border-b pb-2">Notificação 1</li>
              <li className="mb-2 border-b pb-2">Notificação 2</li>
              <li className="mb-2">Notificação 3</li>
            </ul>
          </div>
        )}

        {/* Botão de Logout */}
        <button onClick={onLogout} className="flex items-center text-white">
          <LogOut size={24} className="mr-2" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Topbar;
