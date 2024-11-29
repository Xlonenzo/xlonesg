// src/components/DataSourceManagement.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config'; // Importe a configuração da API_URL

function DataSourceManagement() {
  const [dataSources, setDataSources] = useState([]);
  const [newDataSource, setNewDataSource] = useState({
    name: '',
    type: 'api',
    connection_string: '',
  });
  const [isAdding, setIsAdding] = useState(false);

  // Função para buscar as fontes de dados do backend
  useEffect(() => {
    fetchDataSources();
  }, []);

  const fetchDataSources = async () => {
    try {
      const response = await axios.get(`${API_URL}/data-sources/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setDataSources(response.data);
    } catch (error) {
      console.error('Erro ao buscar fontes de dados:', error);
    }
  };

  // Função para adicionar uma nova fonte de dados
  const handleAddDataSource = async () => {
    try {
      const response = await axios.post(`${API_URL}/data-sources/`, newDataSource, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setDataSources([...dataSources, response.data]);
      setNewDataSource({
        name: '',
        type: 'api',
        connection_string: '',
      });
      setIsAdding(false);
    } catch (error) {
      console.error('Erro ao adicionar fonte de dados:', error);
    }
  };

  // Função para deletar uma fonte de dados
  const handleDeleteDataSource = async (id) => {
    try {
      await axios.delete(`${API_URL}/data-sources/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setDataSources(dataSources.filter((source) => source.id !== id));
    } catch (error) {
      console.error('Erro ao deletar fonte de dados:', error);
    }
  };

  // Função para sincronizar uma fonte de dados
  const handleSyncDataSource = async (id) => {
    try {
      await axios.post(`${API_URL}/data-sources/${id}/sync`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      // Atualiza a lista de fontes de dados após a sincronização
      fetchDataSources();
    } catch (error) {
      console.error('Erro ao sincronizar fonte de dados:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciamento de Fontes de Dados</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Adicionar Nova Fonte de Dados
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Adicionar Nova Fonte de Dados</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nome da Fonte de Dados"
              value={newDataSource.name}
              onChange={(e) => setNewDataSource({ ...newDataSource, name: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <select
              value={newDataSource.type}
              onChange={(e) => setNewDataSource({ ...newDataSource, type: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="api">API</option>
              <option value="database">Banco de Dados</option>
              {/* Outros tipos se necessário */}
            </select>
            <input
              type="text"
              placeholder="String de Conexão"
              value={newDataSource.connection_string}
              onChange={(e) =>
                setNewDataSource({ ...newDataSource, connection_string: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mt-4 space-x-2">
            <button
              onClick={handleAddDataSource}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Salvar
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {dataSources && dataSources.length > 0 ? (
          dataSources.map((source) => (
            <div key={source.id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-bold">{source.name}</h3>
              <p>Tipo: {source.type}</p>
              <p>Status: {source.status}</p>
              <p>Última Sincronização: {source.last_sync || 'Nunca'}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleSyncDataSource(source.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Sincronizar
                </button>
                <button
                  onClick={() => handleDeleteDataSource(source.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>Nenhuma fonte de dados encontrada.</p>
        )}
      </div>
    </div>
  );
}

export default DataSourceManagement;
