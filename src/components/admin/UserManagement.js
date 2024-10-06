// src/components/admin/UserManagement.js

import React, { useState } from 'react';

const initialRolesData = [
  { id: 1, name: 'Admin', description: 'Acesso total ao sistema' },
  { id: 2, name: 'Editor', description: 'Pode editar conteúdos' },
  { id: 3, name: 'Viewer', description: 'Acesso apenas para visualização' },
];

const initialUsersData = [
  { id: 1, name: 'João Silva', role: 'Admin' },
  { id: 2, name: 'Maria Souza', role: 'Editor' },
  { id: 3, name: 'Carlos Oliveira', role: 'Viewer' },
];

function UserManagement() {
  const [roles, setRoles] = useState(initialRolesData);
  const [users, setUsers] = useState(initialUsersData);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState(roles[0]?.name || '');

  // Função para alterar o perfil (role) de um usuário
  const handleRoleChange = (userId, newRole) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, role: newRole } : user
    );
    setUsers(updatedUsers);
  };

  // Função para adicionar um novo perfil (role)
  const handleAddRole = () => {
    if (newRoleName && newRoleDescription) {
      const newRole = {
        id: roles.length + 1,
        name: newRoleName,
        description: newRoleDescription,
      };
      setRoles([...roles, newRole]);
      setNewRoleName(''); // Limpa o campo após adicionar
      setNewRoleDescription(''); // Limpa o campo após adicionar
    } else {
      alert('Por favor, preencha todos os campos para adicionar um novo perfil.');
    }
  };

  // Função para adicionar um novo usuário
  const handleAddUser = () => {
    if (newUserName && newUserRole) {
      const newUser = {
        id: users.length + 1,
        name: newUserName,
        role: newUserRole,
      };
      setUsers([...users, newUser]);
      setNewUserName(''); // Limpa o campo após adicionar
      setNewUserRole(roles[0]?.name || ''); // Reseta o campo de role
    } else {
      alert('Por favor, preencha todos os campos para adicionar um novo usuário.');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gerenciamento de Perfis e Usuários</h2>
      
      {/* Gerenciamento de Usuários */}
      <h3 className="text-xl font-bold mb-2">Usuários</h3>
      <table className="min-w-full bg-white shadow-md rounded mb-6">
        <thead>
          <tr>
            <th className="text-left p-4">Nome</th>
            <th className="text-left p-4">Perfil</th>
            <th className="text-left p-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b">
              <td className="p-4">{user.name}</td>
              <td className="p-4">{user.role}</td>
              <td className="p-4">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="border p-2 rounded"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Adicionar Novo Usuário */}
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">Adicionar Novo Usuário</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome do Usuário"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            className="border p-2 rounded"
          />
          <select
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value)}
            className="border p-2 rounded"
          >
            {roles.map(role => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAddUser}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Adicionar Usuário
        </button>
      </div>

      {/* Gerenciamento de Perfis */}
      <h3 className="text-xl font-bold mt-8 mb-2">Perfis</h3>
      <table className="min-w-full bg-white shadow-md rounded">
        <thead>
          <tr>
            <th className="text-left p-4">Perfil</th>
            <th className="text-left p-4">Descrição</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role.id} className="border-b">
              <td className="p-4">{role.name}</td>
              <td className="p-4">{role.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Adicionar Novo Perfil */}
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">Adicionar Novo Perfil</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome do Perfil"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Descrição do Perfil"
            value={newRoleDescription}
            onChange={(e) => setNewRoleDescription(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={handleAddRole}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Adicionar Perfil
        </button>
      </div>
    </div>
  );
}

export default UserManagement;
