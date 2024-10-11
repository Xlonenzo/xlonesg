import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';

function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({ 
    cnpj: '', 
    name: '', 
    razao_social: '', 
    endereco: '', 
    parent_id: '' 
  });
  const [editingCompany, setEditingCompany] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    }
  };

  const handleAddCompany = async () => {
    console.log('Dados sendo enviados:', newCompany);
    try {
      const response = await axios.post('http://localhost:8000/api/companies/hierarchy', newCompany);
      console.log('Resposta da API:', response.data);
      setCompanies([...companies, response.data]);
      setNewCompany({ cnpj: '', name: '', razao_social: '', endereco: '', parent_id: '' });
    } catch (error) {
      console.error('Erro completo:', error);
      if (error.response && error.response.data) {
        alert(`Erro ao adicionar empresa: ${JSON.stringify(error.response.data)}`);
      } else {
        alert('Erro ao adicionar empresa. Verifique os dados e tente novamente.');
      }
    }
  };

  const handleUpdateCompany = async () => {
    try {
      const response = await axios.put(`http://localhost:8000/api/companies/${editingCompany.id}`, editingCompany);
      setCompanies(companies.map(company => company.id === editingCompany.id ? response.data : company));
      setEditingCompany(null);
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      alert(error.response?.data?.detail || 'Erro ao atualizar empresa');
    }
  };

  const handleDeleteCompany = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      try {
        await axios.delete(`http://localhost:8000/api/companies/${id}`);
        setCompanies(companies.filter((company) => company.id !== id));
      } catch (error) {
        console.error('Erro ao deletar empresa:', error);
        alert(error.response?.data?.detail || 'Erro ao deletar empresa');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gerenciamento de Empresas</h2>

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-bold mb-2">
          {editingCompany ? 'Editar Empresa' : 'Adicionar Nova Empresa'}
        </h3>
        <input
          type="text"
          value={editingCompany ? editingCompany.cnpj : newCompany.cnpj}
          onChange={(e) => editingCompany 
            ? setEditingCompany({...editingCompany, cnpj: e.target.value})
            : setNewCompany({...newCompany, cnpj: e.target.value})}
          placeholder="CNPJ"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          value={editingCompany ? editingCompany.name : newCompany.name}
          onChange={(e) => editingCompany
            ? setEditingCompany({...editingCompany, name: e.target.value})
            : setNewCompany({...newCompany, name: e.target.value})}
          placeholder="Nome da Empresa"
          className="w-full p-2 border rounded mb-2"
        />
        <select
          value={editingCompany ? editingCompany.parent_id : newCompany.parent_id}
          onChange={(e) => {
            const value = e.target.value;
            if (editingCompany) {
              setEditingCompany({...editingCompany, parent_id: value});
            } else {
              setNewCompany({...newCompany, parent_id: value});
            }
          }}
          className="w-full p-2 border rounded mb-2"
        >
          <option value="">Selecione a Empresa Pai (opcional)</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name} - {company.cnpj}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newCompany.razao_social}
          onChange={(e) => setNewCompany({...newCompany, razao_social: e.target.value})}
          placeholder="Razão Social"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          value={newCompany.endereco}
          onChange={(e) => setNewCompany({...newCompany, endereco: e.target.value})}
          placeholder="Endereço"
          className="w-full p-2 border rounded mb-2"
        />
        <button
          onClick={editingCompany ? handleUpdateCompany : handleAddCompany}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {editingCompany ? 'Atualizar Empresa' : 'Adicionar Empresa'}
        </button>
        {editingCompany && (
          <button
            onClick={() => setEditingCompany(null)}
            className="ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">CNPJ</th>
              <th className="px-4 py-2 border">Nome</th>
              <th className="px-4 py-2 border">Empresa Pai</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border">{company.cnpj}</td>
                <td className="px-4 py-2 border">{company.name}</td>
                <td className="px-4 py-2 border">
                  {company.parent_id 
                    ? companies.find(c => c.id === company.parent_id)?.name 
                    : 'N/A'}
                </td>
                <td className="px-4 py-2 border">
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={() => setEditingCompany(company)}
                      className="text-yellow-500 hover:text-yellow-700"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompanyManagement;
