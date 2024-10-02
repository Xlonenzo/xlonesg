// Customization.js
import React, { useState } from 'react';

const Customization = ({ setSidebarColor, setLogo, setButtonColor, setFontColor }) => {
  const [newLogo, setNewLogo] = useState(null); // Estado para armazenar a nova logo temporária

  // Função para trocar a cor da sidebar
  const handleSidebarColorChange = (event) => {
    setSidebarColor(event.target.value);
  };

  // Função para trocar a cor do botão
  const handleButtonColorChange = (event) => {
    setButtonColor(event.target.value);
  };

  // Função para trocar a cor da fonte
  const handleFontColorChange = (event) => {
    setFontColor(event.target.value);
  };

  // Função para trocar o logo
  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const logoUrl = URL.createObjectURL(file); // Cria uma URL temporária para visualizar a imagem
      setNewLogo(logoUrl); // Armazena a logo localmente
      setLogo(logoUrl); // Atualiza o logo na sidebar
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Personalização</h2>

      {/* Alterar a cor da Sidebar */}
      <label className="block mb-2">Cor da Sidebar:</label>
      <input
        type="color"
        onChange={handleSidebarColorChange}
        className="block mb-4"
        defaultValue="#727E7A"
      />

      {/* Alterar a cor do Botão */}
      <label className="block mb-2">Cor do Botão:</label>
      <input
        type="color"
        onChange={handleButtonColorChange}
        className="block mb-4"
        defaultValue="#4A5568" // Cor padrão: cinza escuro
      />

      {/* Alterar a cor da Fonte */}
      <label className="block mb-2">Cor da Fonte:</label>
      <input
        type="color"
        onChange={handleFontColorChange}
        className="block mb-4"
        defaultValue="#D1D5DB" // Cor padrão: cinza claro
      />

      {/* Upload do novo logo */}
      <label className="block mb-2">Alterar Logo:</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleLogoChange}
        className="block mb-4"
      />

      {/* Exibir a logo temporária para visualização */}
      {newLogo && (
        <div className="mt-4">
          <h3 className="text-lg mb-2">Visualização da Nova Logo:</h3>
          <img src={newLogo} alt="Nova Logo" className="h-16 w-auto" />
        </div>
      )}
    </div>
  );
};

export default Customization;
