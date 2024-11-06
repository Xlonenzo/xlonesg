// src/components/Customization.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Settings, Palette, Type } from 'lucide-react';

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
    <div className="max-w-3xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center">
            <Settings className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Customização da Interface</h2>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="text-red-700">{error}</div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 flex items-center bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <div className="text-green-700">{success}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl transition-all hover:shadow-md">
              <div className="flex items-center mb-4">
                <Palette className="w-5 h-5 text-blue-600 mr-2" />
                <label className="text-sm font-medium text-gray-700">
                  Cor da Barra Lateral
                </label>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={localCustomization.sidebar_color || '#1a73e8'}
                  onChange={(e) => setLocalCustomization({...localCustomization, sidebar_color: e.target.value})}
                  className="h-12 w-24 rounded-lg cursor-pointer border-2 border-gray-200 focus:border-blue-500 transition-all"
                />
                <span className="text-sm font-mono text-gray-500 bg-white px-3 py-2 rounded-md border border-gray-200">
                  {localCustomization.sidebar_color || '#1a73e8'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl transition-all hover:shadow-md">
              <div className="flex items-center mb-4">
                <Palette className="w-5 h-5 text-blue-600 mr-2" />
                <label className="text-sm font-medium text-gray-700">
                  Cor dos Botões
                </label>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={localCustomization.button_color || '#1a73e8'}
                  onChange={(e) => setLocalCustomization({...localCustomization, button_color: e.target.value})}
                  className="h-12 w-24 rounded-lg cursor-pointer border-2 border-gray-200 focus:border-blue-500 transition-all"
                />
                <span className="text-sm font-mono text-gray-500 bg-white px-3 py-2 rounded-md border border-gray-200">
                  {localCustomization.button_color || '#1a73e8'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl transition-all hover:shadow-md">
              <div className="flex items-center mb-4">
                <Type className="w-5 h-5 text-blue-600 mr-2" />
                <label className="text-sm font-medium text-gray-700">
                  Cor da Fonte
                </label>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={localCustomization.font_color || '#000000'}
                  onChange={(e) => setLocalCustomization({...localCustomization, font_color: e.target.value})}
                  className="h-12 w-24 rounded-lg cursor-pointer border-2 border-gray-200 focus:border-blue-500 transition-all"
                />
                <span className="text-sm font-mono text-gray-500 bg-white px-3 py-2 rounded-md border border-gray-200">
                  {localCustomization.font_color || '#000000'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              style={{ 
                backgroundColor: localCustomization.button_color || '#1a73e8'
              }}
              className="flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 disabled:opacity-50 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Salvando...</span>
                </>
              ) : (
                'Salvar Customização'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Customization;
