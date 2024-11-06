// src/components/admin/UserManagement.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import { API_URL } from '../../config';

function UserManagement({ buttonColor }) {
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('viewer');
  const [isActive, setIsActive] = useState(true);
  const [newFullName, setNewFullName] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Remova full_name dos filtros
  const [filters, setFilters] = useState({
    username: '',
    email: '',
    role: '',
    is_active: ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'is_active' ? value : value
    }));
  };

  const filteredUsers = users.filter(user => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      
      if (key === 'is_active') {
        const userStatus = user[key] === true ? 'true' : 'false';
        return userStatus === filters[key];
      }
      
      return user[key]?.toLowerCase().includes(filters[key].toLowerCase());
    });
  });

  const renderColumnFilter = (columnName, options = null) => (
    <div className="flex items-center">
      {options ? (
        <select
          name={columnName}
          value={filters[columnName]}
          onChange={handleFilterChange}
          className="w-full p-1 text-sm border rounded"
        >
          <option value="">Todos</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          name={columnName}
          value={filters[columnName]}
          onChange={handleFilterChange}
          className="w-full p-1 text-sm border rounded"
          placeholder={`Filtrar ${columnName}`}
        />
      )}
      <FaFilter className="ml-1 text-gray-500" />
    </div>
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Iniciando busca de usuários...');
      const response = await axios({
        method: 'get',
        url: `${API_URL}/users/`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false
      });
      
      console.log('Usuários recebidos (raw):', response.data);
      
      // Garantir que is_active seja sempre booleano
      const processedUsers = response.data.map(user => ({
        ...user,
        is_active: user.is_active === true
      }));
      
      console.log('Usuários processados:', processedUsers);
      setUsers(processedUsers);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      const errorMessage = error.response?.data?.detail || 'Erro ao carregar usuários';
      setError(errorMessage);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Criar objeto de dados
    const userData = {
      username: newUsername,
      email: newEmail,
      password: newPassword,
      role: newRole,
      is_active: Boolean(isActive),
      full_name: newFullName
    };

    // Validar dados antes do envio
    const validationErrors = validateUserData(userData);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      setLoading(false);
      return;
    }

    console.log('Dados a serem enviados:', {
      ...userData,
      password: 'REDACTED',
      is_active: Boolean(userData.is_active)
    });

    try {
      const response = await axios({
        method: 'post',
        url: `${API_URL}/users/`,
        data: userData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Resposta do servidor:', response.data);
      alert('Usuário criado com sucesso!');
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Erro detalhado:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        validationError: error.response?.data?.detail
      });
      
      let errorMessage = 'Erro ao criar usuário';
      if (error.response?.data?.detail) {
        errorMessage = Array.isArray(error.response.data.detail) 
          ? error.response.data.detail.map(err => err.msg).join(', ')
          : error.response.data.detail;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Função para validar os dados antes do envio
  const validateUserData = (data) => {
    const errors = [];
    
    if (!data.username || data.username.length < 3) {
      errors.push('Username deve ter pelo menos 3 caracteres');
    }
    
    if (!data.email || !data.email.includes('@')) {
      errors.push('Email inválido');
    }
    
    if (!data.password || data.password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }
    
    if (!data.role || !['viewer', 'editor', 'admin'].includes(data.role)) {
      errors.push('Função inválida');
    }

    if (!data.full_name || data.full_name.length < 3) {
      errors.push('Nome completo deve ter pelo menos 3 caracteres');
    }

    return errors;
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const response = await axios.delete(`${API_URL}/users/${userId}`);
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
    console.log('Editando usuário (dados originais):', user);
    setEditingUser(user);
    setNewUsername(user.username);
    setNewEmail(user.email);
    setNewRole(user.role);
    setNewFullName(user.full_name);
    // Garantir valor booleano para is_active
    const activeStatus = user.is_active === true;
    console.log('Status ativo definido para:', activeStatus);
    setIsActive(activeStatus);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Garantir que is_active seja booleano
      const isActiveValue = isActive === true;
      console.log('Valor de is_active a ser enviado:', isActiveValue);
      
      const userData = {
        username: newUsername,
        email: newEmail,
        password: newPassword || undefined,
        role: newRole,
        is_active: isActiveValue,
        full_name: newFullName
      };

      console.log('Dados de atualização:', userData);

      const response = await axios.put(`${API_URL}/users/${editingUser.id}`, userData);
      console.log('Resposta da atualização:', response.data);
      
      alert('Usuário atualizado com sucesso!');
      resetForm();
      await fetchUsers(); // Usar await aqui
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setError(error.response?.data?.detail || 'Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar o resetForm para garantir que todos os campos sejam limpos
  const resetForm = () => {
    setEditingUser(null);
    setIsAddingUser(false);
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('viewer');
    setIsActive(true);
    setNewFullName('');
    setError(null);
  };

  const handleAddNewUser = () => {
    setIsAddingUser(true);
    setEditingUser(null);
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('viewer');
    setIsActive(true);
    setNewFullName('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Gerenciamento de Usuários</h2>
      
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={handleAddNewUser}
          className="text-white px-4 py-2 rounded hover:opacity-80"
          style={{ backgroundColor: buttonColor }}
        >
          Adicionar Novo Usuário
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar usuários..."
            className="p-2 pl-8 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-2 top-3 text-gray-400" />
        </div>
      </div>

      {error && typeof error === 'string' && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">{renderColumnFilter('username')}</th>
              <th className="px-4 py-2 border">{renderColumnFilter('email')}</th>
              <th className="px-4 py-2 border">
                {renderColumnFilter('role', [
                  { value: 'viewer', label: 'Viewer' },
                  { value: 'editor', label: 'Editor' },
                  { value: 'admin', label: 'Admin' }
                ])}
              </th>
              <th className="px-4 py-2 border">
                {renderColumnFilter('is_active', [
                  { value: 'true', label: 'Ativo' },
                  { value: 'false', label: 'Inativo' }
                ])}
              </th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 border">{user.username}</td>
                <td className="px-4 py-2 border">{user.email}</td>
                <td className="px-4 py-2 border capitalize">{user.role}</td>
                <td className="px-4 py-2 border">
                  <span 
                    className={`px-2 py-1 rounded ${
                      user.is_active === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.is_active === true ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulário de Edição/Criação */}
      {(editingUser !== null || isAddingUser) && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-bold mb-2">
            {editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
          </h3>
          <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Nome Completo</label>
              <input
                type="text"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Senha {!editingUser && '(Obrigatória)'}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required={!editingUser}
              />
            </div>
            <div>
              <label className="block mb-2">Função</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">Status</label>
              <select
                value={isActive === true ? 'true' : 'false'}
                onChange={(e) => {
                  const newValue = e.target.value === 'true';
                  console.log('Novo valor de is_active:', newValue);
                  setIsActive(newValue);
                }}
                className="w-full p-2 border rounded"
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
            <div className="mt-4 col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="text-white px-4 py-2 rounded hover:opacity-80 mr-2"
                style={{ backgroundColor: buttonColor }}
              >
                {loading ? 'Processando...' : (editingUser ? 'Atualizar' : 'Criar')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
