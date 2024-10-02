import React, { useState } from 'react';

const Customization = ({ setSidebarColor, setLogo }) => {
  const [newLogo, setNewLogo] = useState(null); // Estado para armazenar a nova logo temporária

  // Função para trocar a cor da sidebar
  const handleColorChange = (event) => {
    setSidebarColor(event.target.value);
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
        onChange={handleColorChange}
        className="block mb-4"
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
