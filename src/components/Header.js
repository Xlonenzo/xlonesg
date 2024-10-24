const Header = ({ isAuthenticated, onLogout, user, customization }) => {
  return (
    <header style={{ backgroundColor: customization.sidebarColor, color: customization.fontColor }}>
      {/* ... conteúdo existente ... */}
      {isAuthenticated && (
        <button 
          onClick={onLogout}
          style={{ backgroundColor: customization.buttonColor, color: customization.fontColor }}
        >
          Logout
        </button>
      )}
    </header>
  );
};
