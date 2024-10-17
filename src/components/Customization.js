// Customization.js
import React, { useState } from 'react';
import axios from 'axios';

const Customization = ({ customization, setCustomization }) => {
  const [newLogo, setNewLogo] = useState(null);

  const handleColorChange = (event, type) => {
    const newCustomization = { ...customization, [type]: event.target.value };
    setCustomization(newCustomization);
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const logoUrl = URL.createObjectURL(file);
      setNewLogo(logoUrl);
      setCustomization({ ...customization, logo_url: logoUrl });
    }
  };

  const saveCustomization = async () => {
    try {
      if (customization.id) {
        await axios.put(`http://localhost:8000/api/customization/${customization.id}`, customization);
      } else {
        await axios.post('http://localhost:8000/api/customization', customization);
      }
      alert('Customização salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar customização:', error);
      alert('Erro ao salvar customização');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Personalização</h2>

      <label className="block mb-2">Cor da Sidebar:</label>
      <input
        type="color"
        value={customization.sidebar_color}
        onChange={(e) => handleColorChange(e, 'sidebar_color')}
        className="block mb-4"
      />

      <label className="block mb-2">Cor do Botão:</label>
      <input
        type="color"
        value={customization.button_color}
        onChange={(e) => handleColorChange(e, 'button_color')}
        className="block mb-4"
      />

      <label className="block mb-2">Cor da Fonte:</label>
      <input
        type="color"
        value={customization.font_color}
        onChange={(e) => handleColorChange(e, 'font_color')}
        className="block mb-4"
      />

      <label className="block mb-2">Alterar Logo:</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleLogoChange}
        className="block mb-4"
      />

      {newLogo && (
        <div className="mt-4">
          <h3 className="text-lg mb-2">Visualização da Nova Logo:</h3>
          <img src={newLogo} alt="Nova Logo" className="h-16 w-auto" />
        </div>
      )}

      <button
        onClick={saveCustomization}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Salvar Customização
      </button>
    </div>
  );
};

export default Customization;
