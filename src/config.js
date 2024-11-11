export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const DEFAULT_CUSTOMIZATION = {
  sidebarColor: process.env.REACT_APP_DEFAULT_SIDEBAR_COLOR || '#ffffff',
  buttonColor: process.env.REACT_APP_DEFAULT_BUTTON_COLOR || '#007bff',
  fontColor: process.env.REACT_APP_DEFAULT_FONT_COLOR || '#333333',
  logoUrl: process.env.REACT_APP_DEFAULT_LOGO_URL || '/path/to/default/logo.png',
};
