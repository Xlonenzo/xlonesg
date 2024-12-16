import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  LogOut, 
  User, 
  MessageSquareMore, 
  FileText, 
  HeadphonesIcon,
  Sun,
  Moon,
  Search
} from 'lucide-react';
import ChatBot from './ChatBot';

const Topbar = ({ onLogout, sidebarColor, fontColor, userName, role, isDarkMode, onToggleTheme }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false); // Estado para controlar o dropdown de notificações
  const notificationRef = useRef(null); // Ref para o botão de notificações e o dropdown
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  console.log('Nome do usuário recebido na Topbar:', userName);

  return (
    <div
      style={{ backgroundColor: sidebarColor }}
      className="h-16 flex justify-between items-center px-4"
    >
      {/* Role do usuário à esquerda */}
      <div className="flex items-center" style={{ color: fontColor }}>
        <span className="font-semibold">{role || 'Função não definida'}</span>
      </div>

      {/* Ícones à direita */}
      <div className="flex items-center relative ml-auto gap-6" ref={notificationRef}>
        {/* Pesquisa */}
        <div className="relative">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="hover:opacity-80 transition-opacity"
            style={{ color: fontColor }}
            title="Pesquisar"
          >
            <Search
              size={18} 
              className="opacity-50 stroke-[1]"
              strokeWidth={1}
            />
          </button>
          {isSearchOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-2 z-20">
              <input
                type="text"
                placeholder="Pesquisar..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Chatbot */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="hover:opacity-80 transition-opacity"
          style={{ color: fontColor }}
          title="Chat"
        >
          <MessageSquareMore
            size={18} 
            className="opacity-50 stroke-[1]"
            strokeWidth={1}
          />
        </button>

        {/* Alternar Tema */}
        <button 
          onClick={onToggleTheme}
          className="hover:opacity-80 transition-opacity"
          style={{ color: fontColor }}
          title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
        >
          {isDarkMode ? (
            <Sun
              size={18} 
              className="opacity-50 stroke-[1]"
              strokeWidth={1}
            />
          ) : (
            <Moon
              size={18} 
              className="opacity-50 stroke-[1]"
              strokeWidth={1}
            />
          )}
        </button>

        {/* Documentação */}
        <button 
          className="hover:opacity-80 transition-opacity"
          style={{ color: fontColor }}
          title="Documentação"
        >
          <FileText
            size={18} 
            className="opacity-50 stroke-[1]"
            strokeWidth={1}
          />
        </button>

        {/* Suporte Técnico */}
        <button 
          className="hover:opacity-80 transition-opacity"
          style={{ color: fontColor }}
          title="Suporte Técnico"
        >
          <HeadphonesIcon
            size={18} 
            className="opacity-50 stroke-[1]"
            strokeWidth={1}
          />
        </button>

        {/* Usuário */}
        <button 
          className="hover:opacity-80 transition-opacity"
          style={{ color: fontColor }}
          title="Perfil"
        >
          <User 
            size={18} 
            className="opacity-50 stroke-[1]" 
            strokeWidth={1}
          />
        </button>

        {/* Notificações */}
        <button 
          onClick={toggleNotifications} 
          className="relative hover:opacity-80 transition-opacity"
          style={{ color: fontColor }}
          title="Notificações"
        >
          <Bell 
            size={18} 
            className="opacity-50 stroke-[1]"
            strokeWidth={1}
          />
          <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
        </button>

        {/* Logout */}
        <button 
          onClick={onLogout} 
          className="hover:opacity-80 transition-opacity"
          style={{ color: fontColor }}
          title="Sair"
        >
          <LogOut 
            size={18} 
            className="opacity-50 stroke-[1]"
            strokeWidth={1}
          />
        </button>
      </div>

      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default Topbar;
