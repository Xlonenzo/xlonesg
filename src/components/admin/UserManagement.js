// src/components/admin/UserManagement.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserManagement({ buttonColor }) {
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('viewer'); // Novo estado para role
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      alert('Erro ao carregar usuários. Por favor, tente novamente.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/users/', {
        username: newUsername,
        email: newEmail,
        password: newPassword,
        role: newRole
      });
      alert('Usuário criado com sucesso!');
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário. Por favor, tente novamente.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const response = await axios.delete(`http://localhost:8000/users/${userId}`);
        if (response.data.message === "User deleted successfully") {
          alert('Usuário excluído com sucesso!');
          fetchUsers();
        } else {
          throw new Error('Resposta inesperada do servidor');
        }
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        if (error.response) {
          // O servidor respondeu com um status de erro
          alert(`Erro ao excluir usuário: ${error.response.data.detail || 'Erro desconhecido'}`);
        } else if (error.request) {
          // A requisição foi feita mas não houve resposta
          alert('Erro ao excluir usuário: Não foi possível conectar ao servidor');
        } else {
          // Algo aconteceu na configuração da requisição que causou o erro
          alert(`Erro ao excluir usuário: ${error.message}`);
        }
      }
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUsername(user.username);
    setNewEmail(user.email);
    setNewRole(user.role);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:8000/users/${editingUser.id}`, {
        username: newUsername,
        email: newEmail,
        password: newPassword,
        role: newRole
      });
      console.log('Resposta do servidor:', response.data);
      alert('Usuário atualizado com sucesso!');
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      let errorMessage = 'Erro ao atualizar usuário. ';
      if (error.response) {
        console.error('Dados da resposta de erro:', error.response.data);
        errorMessage += error.response.data.detail || JSON.stringify(error.response.data);
      } else if (error.request) {
        errorMessage += 'Não foi possível se conectar ao servidor.';
      } else {
        errorMessage += error.message;
      }
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('viewer');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Gerenciamento de Usuários</h2>
      
      {/* Lista de Usuários */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Usuários Existentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 font-semibold">Nome de Usuário</th>
                <th className="text-left p-3 font-semibold">Email</th>
                <th className="text-left p-3 font-semibold">Role</th>
                <th className="text-left p-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{user.username}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleEditUser(user)}
                      style={{ backgroundColor: buttonColor }}
                      className="text-white px-2 py-1 rounded mr-2 hover:opacity-80"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Criar/Editar Usuário */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          {editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}
        </h3>
        <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
          <input
            type="text"
            placeholder="Nome de usuário"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={!editingUser}
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {editingUser ? 'Atualizar Usuário' : 'Criar Usuário'}
          </button>
          {editingUser && (
            <button
              type="button"
              onClick={() => {
                setEditingUser(null);
                setNewUsername('');
                setNewEmail('');
                setNewPassword('');
                setNewRole('viewer');
              }}
              className="ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Cancelar Edição
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default UserManagement;
