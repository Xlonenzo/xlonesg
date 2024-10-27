// src/components/Customization.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const Customization = ({ customization, setCustomization }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Carregar a customização inicial
  useEffect(() => {
    const fetchCustomization = async () => {
      try {
        const response = await axios.get(`${API_URL}/customization`);
        setCustomization(response.data);
      } catch (error) {
        console.error('Erro ao carregar customização:', error);
      }
    };

    fetchCustomization();
  }, [setCustomization]);

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
        const response = await axios.post(`${API_URL}/upload-logo`, formData, {
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
        await axios.put(`${API_URL}/customization/${newCustomization.id}`, newCustomization);
      } else {
        const response = await axios.post(`${API_URL}/customization`, newCustomization);
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
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Personalização</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cor da Sidebar:</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={customization.sidebar_color}
                  onChange={(e) => handleColorChange(e, 'sidebar_color')}
                  className="h-10 w-10 rounded-full shadow-sm cursor-pointer"
                />
                <span className="ml-3 text-gray-600">{customization.sidebar_color}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cor do Botão:</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={customization.button_color}
                  onChange={(e) => handleColorChange(e, 'button_color')}
                  className="h-10 w-10 rounded-full shadow-sm cursor-pointer"
                />
                <span className="ml-3 text-gray-600">{customization.button_color}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cor da Fonte:</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={customization.font_color}
                  onChange={(e) => handleColorChange(e, 'font_color')}
                  className="h-10 w-10 rounded-full shadow-sm cursor-pointer"
                />
                <span className="ml-3 text-gray-600">{customization.font_color}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alterar Logo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>

            {customization.logo_url && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Logo Atual:</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img 
                    src={customization.logo_url} 
                    alt="Logo Atual" 
                    className="max-h-32 w-auto mx-auto"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-logo.png";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="mt-8 text-center">
            <p className="text-blue-600 font-semibold">Salvando alterações...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customization;
