import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_URL}/roles/`);
      setRoles(response.data);
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
      alert('Erro ao carregar perfis. Por favor, tente novamente.');
    }
  };

  const handleAddRole = async () => {
    if (newRoleName && newRoleDescription) {
      try {

        await axios.post(`${process.env.REACT_APP_API_URL}/roles/`, {
          name: newRoleName,
          description: newRoleDescription,
        });
        setNewRoleName('');
        setNewRoleDescription('');
        fetchRoles();
      } catch (error) {
        console.error('Erro ao adicionar perfil:', error);
        alert('Erro ao adicionar perfil. Por favor, tente novamente.');
      }
    } else {
      alert('Por favor, preencha todos os campos para adicionar um novo perfil.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Gerenciamento de Perfis</h2>
      
      {/* Lista de Perfis */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Perfis Existentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 font-semibold">Perfil</th>
                <th className="text-left p-3 font-semibold">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{role.name}</td>
                  <td className="p-3">{role.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adicionar Novo Perfil */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Adicionar Novo Perfil</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Nome do Perfil"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Descrição do Perfil"
            value={newRoleDescription}
            onChange={(e) => setNewRoleDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleAddRole}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Adicionar Perfil
        </button>
      </div>
    </div>
  );
}

export default RoleManagement;
