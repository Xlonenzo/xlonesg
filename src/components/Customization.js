// src/components/Customization.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function Customization({ customization: globalCustomization, setCustomization: setGlobalCustomization }) {
  // Estados
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localCustomization, setLocalCustomization] = useState(globalCustomization);

  useEffect(() => {
    fetchCustomization();
  }, []);

  useEffect(() => {
    setLocalCustomization(globalCustomization);
  }, [globalCustomization]);

  const fetchCustomization = async () => {
    try {
      const response = await axios.get(`${API_URL}/customization/1`);
      setLocalCustomization(response.data);
      setGlobalCustomization(response.data); // Atualiza o estado global
      if (response.data.logo_url) {
        setPreviewUrl(response.data.logo_url);
      }
    } catch (error) {
      console.error('Erro ao buscar customização:', error);
      setError('Falha ao carregar as configurações');
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('logo', file);

      const response = await axios.post(`${API_URL}/customization/upload-logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const newCustomization = {
        ...localCustomization,
        logo_url: response.data.logo_url
      };

      setLocalCustomization(newCustomization);
      setGlobalCustomization(newCustomization); // Atualiza o estado global

      return response.data.logo_url;
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        if (!file.type.match('image.*')) {
          setError('Por favor, selecione apenas arquivos de imagem');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError('O arquivo deve ter no máximo 5MB');
          return;
        }

        setError('');
        setSelectedFile(file);
        const logoUrl = await handleFileUpload(file);
        setPreviewUrl(logoUrl);
      } catch (error) {
        setError('Falha ao fazer upload da imagem');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(`${API_URL}/customization/1`, {
        sidebar_color: localCustomization.sidebar_color,
        button_color: localCustomization.button_color,
        font_color: localCustomization.font_color,
        logo_url: localCustomization.logo_url
      });

      setLocalCustomization(response.data);
      setGlobalCustomization(response.data); // Atualiza o estado global
      setSuccess('Customização salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar customização:', error);
      setError('Falha ao salvar as configurações. Por favor, tente novamente.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Customização da Interface</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cores */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cor da Barra Lateral
          </label>
          <input
            type="color"
            value={localCustomization.sidebar_color}
            onChange={(e) => setLocalCustomization({...localCustomization, sidebar_color: e.target.value})}
            className="mt-1 block w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cor dos Botões
          </label>
          <input
            type="color"
            value={localCustomization.button_color}
            onChange={(e) => setLocalCustomization({...localCustomization, button_color: e.target.value})}
            className="mt-1 block w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cor da Fonte
          </label>
          <input
            type="color"
            value={localCustomization.font_color}
            onChange={(e) => setLocalCustomization({...localCustomization, font_color: e.target.value})}
            className="mt-1 block w-full"
          />
        </div>

        {/* Upload de Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Logo da Empresa
          </label>
          <div className="mt-1 flex items-center space-x-4">
            <input
              type="file"
              onChange={handleFileSelect}
              accept="image/*"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {isLoading && <span>Carregando...</span>}
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="h-20 w-20 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.png';
                  setError('Não foi possível carregar a imagem');
                }}
              />
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Formatos aceitos: PNG, JPG, SVG. Tamanho máximo: 5MB
          </p>
        </div>

        {/* Botão Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : 'Salvar Customização'}
        </button>
      </form>
    </div>
  );
}

export default Customization;
