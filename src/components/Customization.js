// src/components/Customization.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function Customization({ customization: globalCustomization, setCustomization: setGlobalCustomization }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localCustomization, setLocalCustomization] = useState(globalCustomization);

  const fetchCustomization = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/customization`);
      setLocalCustomization(response.data);
      setGlobalCustomization(response.data);
    } catch (error) {
      console.error('Erro ao buscar customização:', error);
      setError('Falha ao carregar as configurações');
    }
  }, [setGlobalCustomization]);

  useEffect(() => {
    fetchCustomization();
  }, [fetchCustomization]);

  useEffect(() => {
    setLocalCustomization(globalCustomization);
  }, [globalCustomization]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await axios.put(`${API_URL}/customization`, {
        sidebar_color: localCustomization.sidebar_color || '#1a73e8',
        button_color: localCustomization.button_color || '#1a73e8',
        font_color: localCustomization.font_color || '#000000'
      });

      setLocalCustomization(response.data);
      setGlobalCustomization(response.data);
      setSuccess('Customização salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar customização:', error);
      setError('Falha ao salvar as configurações. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
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
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cor da Barra Lateral
          </label>
          <input
            type="color"
            value={localCustomization.sidebar_color || '#1a73e8'}
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
            value={localCustomization.button_color || '#1a73e8'}
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
            value={localCustomization.font_color || '#000000'}
            onChange={(e) => setLocalCustomization({...localCustomization, font_color: e.target.value})}
            className="mt-1 block w-full"
          />
        </div>

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
