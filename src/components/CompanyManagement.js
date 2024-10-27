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
    trade_name: '',
    registration_date: '',
    size: '',
    sector: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: '',
    website: '',
    is_active: true
  });
  const [editingCompany, setEditingCompany] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/companies`);
      setCompanies(response.data);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    }
  };

  const handleAddCompany = async () => {
    console.log('Dados sendo enviados:', newCompany);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/companies/hierarchy`, {
        cnpj: newCompany.cnpj,
        name: newCompany.name,
        razao_social: newCompany.razao_social,
        endereco: newCompany.endereco,
        trade_name: newCompany.trade_name,
        registration_date: newCompany.registration_date,
        size: newCompany.size,
        sector: newCompany.sector,
        city: newCompany.city,
        state: newCompany.state,
        zip_code: newCompany.zip_code,
        phone: newCompany.phone,
        email: newCompany.email,
        website: newCompany.website,
        is_active: newCompany.is_active
      });
      console.log('Resposta da API:', response.data);
      setCompanies([...companies, response.data]);
      setNewCompany({ 
        cnpj: '', 
        name: '', 
        razao_social: '', 
        endereco: '', 
        trade_name: '', 
        registration_date: '', 
        size: '', 
        sector: '', 
        city: '', 
        state: '', 
        zip_code: '', 
        phone: '', 
        email: '', 
        website: '', 
        is_active: true 
      });
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
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/companies/${editingCompany.id}`, {
        cnpj: editingCompany.cnpj,
        name: editingCompany.name,
        razao_social: editingCompany.razao_social,
        endereco: editingCompany.endereco,
        trade_name: editingCompany.trade_name,
        registration_date: editingCompany.registration_date,
        size: editingCompany.size,
        sector: editingCompany.sector,
        city: editingCompany.city,
        state: editingCompany.state,
        zip_code: editingCompany.zip_code,
        phone: editingCompany.phone,
        email: editingCompany.email,
        website: editingCompany.website,
        is_active: editingCompany.is_active
      });
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
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/companies/${id}`);
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
        <input
          type="text"
          value={editingCompany ? editingCompany.razao_social : newCompany.razao_social}
          onChange={(e) => editingCompany
            ? setEditingCompany({...editingCompany, razao_social: e.target.value})
            : setNewCompany({...newCompany, razao_social: e.target.value})}
          placeholder="Razão Social"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          value={editingCompany ? editingCompany.endereco : newCompany.endereco}
          onChange={(e) => editingCompany
            ? setEditingCompany({...editingCompany, endereco: e.target.value})
            : setNewCompany({...newCompany, endereco: e.target.value})}
          placeholder="Endereço"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          value={editingCompany ? editingCompany.trade_name : newCompany.trade_name}
          onChange={(e) => editingCompany
            ? setEditingCompany({...editingCompany, trade_name: e.target.value})
            : setNewCompany({...newCompany, trade_name: e.target.value})}
          placeholder="Nome Fantasia"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="date"
          value={editingCompany ? editingCompany.registration_date : newCompany.registration_date}
          onChange={(e) => editingCompany
            ? setEditingCompany({...editingCompany, registration_date: e.target.value})
            : setNewCompany({...newCompany, registration_date: e.target.value})}
          placeholder="Data de Registro"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          value={editingCompany ? editingCompany.size : newCompany.size}
          onChange={(e) => editingCompany
            ? setEditingCompany({...editingCompany, size: e.target.value})
            : setNewCompany({...newCompany, size: e.target.value})}
          placeholder="Tamanho"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          value={editingCompany ? editingCompany.sector : newCompany.sector}
          onChange={(e) => editingCompany
            ? setEditingCompany({...editingCompany, sector: e.target.value})
            : setNewCompany({...newCompany, sector: e.target.value})}
          placeholder="Setor"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          value={editingCompany ? editingCompany.city : newCompany.city}
          onChange={(e) => editingCompany
            ? setEditingCompany({...editingCompany, city: e.target.value})
            : setNewCompany({...newCompany, city: e.target.value})}
          placeholder="Cidade"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          value={editingCompany ? editingCompany.state : newCompany.state}
          onChange={(e) => editingCompany
            ? setEditingCompany({...editingCompany, state: e.target.value})
            : setNewCompany({...newCompany, state: e.target.value})}
          placeholder="Estado"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          value={editingCompany ? editingCompany.zip_code : newCompany.zip_code}
          onChange={(e) => editingCompany
            ? setEditingCompany({...editingCompany, zip_code: e.target.value})
            : setNewCompany({...newCompany, zip_code: e.target.value})}
          placeholder="CEP"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          value={editingCompany ? editingCompany.phone : newCompany.phone}
          onChange={(e) => editingCompany
            ? setEditingCompany({...editingCompany, phone: e.target.value})
            : setNewCompany({...newCompany, phone: e.target.value})}
          placeholder="Telefone"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="email"
          value={editingCompany ? editingCompany.email : newCompany.email}
          onChange={(e) => editingCompany
            ? setEditingCompany({...editingCompany, email: e.target.value})
            : setNewCompany({...newCompany, email: e.target.value})}
          placeholder="E-mail"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          value={editingCompany ? editingCompany.website : newCompany.website}
          onChange={(e) => editingCompany
            ? setEditingCompany({...editingCompany, website: e.target.value})
            : setNewCompany({...newCompany, website: e.target.value})}
          placeholder="Website"
          className="w-full p-2 border rounded mb-2"
        />
        <div className="mb-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={editingCompany ? editingCompany.is_active : newCompany.is_active}
              onChange={(e) => editingCompany
                ? setEditingCompany({...editingCompany, is_active: e.target.checked})
                : setNewCompany({...newCompany, is_active: e.target.checked})}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Ativo</span>
          </label>
        </div>
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
              <th className="px-4 py-2 border">Nome Fantasia</th>
              <th className="px-4 py-2 border">Cidade</th>
              <th className="px-4 py-2 border">Estado</th>
              <th className="px-4 py-2 border">Ativo</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border">{company.cnpj}</td>
                <td className="px-4 py-2 border">{company.name}</td>
                <td className="px-4 py-2 border">{company.trade_name}</td>
                <td className="px-4 py-2 border">{company.city}</td>
                <td className="px-4 py-2 border">{company.state}</td>
                <td className="px-4 py-2 border">{company.is_active ? 'Sim' : 'Não'}</td>
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
