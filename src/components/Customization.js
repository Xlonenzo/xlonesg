// Customization.js
import React, { useState } from 'react';
import axios from 'axios';

const Customization = ({ customization, setCustomization }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleColorChange = async (event, type) => {
    const newCustomization = { ...customization, [type]: event.target.value };
    setCustomization(newCustomization);
    await saveCustomization(newCustomization);
  };

  const handleLogoChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post('http://localhost:8000/api/upload-logo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        const logoUrl = response.data.logo_url;
        const newCustomization = { ...customization, logo_url: logoUrl };
        setCustomization(newCustomization);
        await saveCustomization(newCustomization);
      } catch (error) {
        console.error('Erro ao fazer upload da logo:', error.response ? error.response.data : error.message);
        alert('Erro ao fazer upload da logo: ' + (error.response ? error.response.data.detail : error.message));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const saveCustomization = async (newCustomization) => {
    try {
      setIsLoading(true);
      if (newCustomization.id) {
        await axios.put(`http://localhost:8000/api/customization/${newCustomization.id}`, newCustomization);
      } else {
        const response = await axios.post('http://localhost:8000/api/customization', newCustomization);
        setCustomization(response.data);
      }
    } catch (error) {
      console.error('Erro ao salvar customização:', error);
      alert('Erro ao salvar customização');
    } finally {
      setIsLoading(false);
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

      {customization.logo_url && (
        <div className="mt-4">
          <h3 className="text-lg mb-2">Logo Atual:</h3>
          <img 
            src={customization.logo_url} 
            alt="Logo Atual" 
            className="h-16 w-auto"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder-logo.png";
            }}
          />
        </div>
      )}

      {isLoading && <p>Salvando alterações...</p>}
    </div>
  );
};

export default Customization;
