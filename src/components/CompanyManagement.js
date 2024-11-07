import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { API_URL } from '../config';

function CompanyManagement({ buttonColor }) {
  const [companies, setCompanies] = useState([]);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
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
  const [filters, setFilters] = useState({
    cnpj: '',
    name: '',
    trade_name: '',
    city: '',
    state: '',
    is_active: ''
  });

  // Adicionar opções de tamanho
  const sizeOptions = ['Micro', 'Pequena', 'Média', 'Grande'];

  // Adicionar opções de setores
  const sectorOptions = [
    'Tecnologia da Informação (TI)',
    'Saúde',
    'Bens de Capital',
    'Consumo Cíclico',
    'Consumo Não-Cíclico',
    'Energia',
    'Financeiro',
    'Materiais Básicos',
    'Imobiliário',
    'Serviços',
    'Utilidades Públicas',
    'Telecomunicações',
    'Transporte e Logística',
    'Setor Público'
  ];

  // Adicionar estados para mensagens de erro
  const [errors, setErrors] = useState({
    email: '',
    website: ''
  });

  // Função para validar email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função para validar website
  const validateWebsite = (website) => {
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return urlRegex.test(website);
  };

  // Função para lidar com mudança no email
  const handleEmailChange = (e, isEditing) => {
    const email = e.target.value;
    if (email && !validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Email inválido' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }

    if (isEditing) {
      setEditingCompany({ ...editingCompany, email });
    } else {
      setNewCompany({ ...newCompany, email });
    }
  };

  // Função para lidar com mudança no website
  const handleWebsiteChange = (e, isEditing) => {
    const website = e.target.value;
    if (website && !validateWebsite(website)) {
      setErrors(prev => ({ ...prev, website: 'Website inválido' }));
    } else {
      setErrors(prev => ({ ...prev, website: '' }));
    }

    if (isEditing) {
      setEditingCompany({ ...editingCompany, website });
    } else {
      setNewCompany({ ...newCompany, website });
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/companies`);
      setCompanies(response.data);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    }
  };

  const handleAddCompany = async () => {
    // Validar antes de enviar
    if (newCompany.email && !validateEmail(newCompany.email)) {
      setErrors(prev => ({ ...prev, email: 'Email inválido' }));
      return;
    }
    if (newCompany.website && !validateWebsite(newCompany.website)) {
      setErrors(prev => ({ ...prev, website: 'Website inválido' }));
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/companies/hierarchy`, {
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
      setIsAddingCompany(false);
    } catch (error) {
      console.error('Erro ao adicionar empresa:', error);
      alert(error.response?.data?.detail || 'Erro ao adicionar empresa. Verifique os dados e tente novamente.');
    }
  };

  const handleUpdateCompany = async () => {
    try {
      const response = await axios.put(`${API_URL}/companies/${editingCompany.id}`, {
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
        await axios.delete(`${API_URL}/companies/${id}`);
        setCompanies(companies.filter((company) => company.id !== id));
      } catch (error) {
        console.error('Erro ao deletar empresa:', error);
        alert(error.response?.data?.detail || 'Erro ao deletar empresa');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const renderColumnFilter = (columnName, placeholder) => (
    <div className="flex items-center">
      <input
        type="text"
        name={columnName}
        value={filters[columnName]}
        onChange={handleFilterChange}
        className="w-full p-1 text-sm border rounded"
        placeholder={`Filtrar ${placeholder}`}
      />
      <FaFilter className="ml-1 text-gray-500" />
    </div>
  );

  const filteredCompanies = companies.filter(company => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      if (key === 'is_active') {
        const filterValue = filters[key].toLowerCase();
        const isActive = company[key] ? 'sim' : 'não';
        return isActive.includes(filterValue);
      }
      return company[key]?.toString().toLowerCase().includes(filters[key].toLowerCase());
    });
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gerenciamento de Empresas</h2>

      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => setIsAddingCompany(!isAddingCompany)}
          className="text-white px-4 py-2 rounded hover:opacity-90 transition-all"
          style={{ backgroundColor: buttonColor }}
        >
          {isAddingCompany ? 'Cancelar' : 'Adicionar Nova Empresa'}
        </button>
      </div>

      {(isAddingCompany || editingCompany) && (
        <div className="mt-4 p-6 bg-gray-50 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold mb-4">
            {editingCompany ? 'Editar Empresa' : 'Adicionar Nova Empresa'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={editingCompany ? editingCompany.cnpj : newCompany.cnpj}
              onChange={(e) => editingCompany 
                ? setEditingCompany({...editingCompany, cnpj: e.target.value})
                : setNewCompany({...newCompany, cnpj: e.target.value})}
              placeholder="CNPJ"
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="text"
              value={editingCompany ? editingCompany.name : newCompany.name}
              onChange={(e) => editingCompany
                ? setEditingCompany({...editingCompany, name: e.target.value})
                : setNewCompany({...newCompany, name: e.target.value})}
              placeholder="Nome da Empresa"
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="text"
              value={editingCompany ? editingCompany.razao_social : newCompany.razao_social}
              onChange={(e) => editingCompany
                ? setEditingCompany({...editingCompany, razao_social: e.target.value})
                : setNewCompany({...newCompany, razao_social: e.target.value})}
              placeholder="Razão Social"
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="text"
              value={editingCompany ? editingCompany.endereco : newCompany.endereco}
              onChange={(e) => editingCompany
                ? setEditingCompany({...editingCompany, endereco: e.target.value})
                : setNewCompany({...newCompany, endereco: e.target.value})}
              placeholder="Endereço"
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="text"
              value={editingCompany ? editingCompany.trade_name : newCompany.trade_name}
              onChange={(e) => editingCompany
                ? setEditingCompany({...editingCompany, trade_name: e.target.value})
                : setNewCompany({...newCompany, trade_name: e.target.value})}
              placeholder="Nome Fantasia"
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="date"
              value={editingCompany ? editingCompany.registration_date : newCompany.registration_date}
              onChange={(e) => editingCompany
                ? setEditingCompany({...editingCompany, registration_date: e.target.value})
                : setNewCompany({...newCompany, registration_date: e.target.value})}
              placeholder="Data de Registro"
              className="w-full p-2 border rounded-lg"
            />
            <select
              value={editingCompany ? editingCompany.sector : newCompany.sector}
              onChange={(e) => editingCompany
                ? setEditingCompany({...editingCompany, sector: e.target.value})
                : setNewCompany({...newCompany, sector: e.target.value})}
              className="w-full p-2 border rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Selecione o Setor</option>
              {sectorOptions.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
            <select
              value={editingCompany ? editingCompany.size : newCompany.size}
              onChange={(e) => editingCompany
                ? setEditingCompany({...editingCompany, size: e.target.value})
                : setNewCompany({...newCompany, size: e.target.value})}
              className="w-full p-2 border rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Selecione o Tamanho</option>
              {sizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={editingCompany ? editingCompany.city : newCompany.city}
              onChange={(e) => editingCompany
                ? setEditingCompany({...editingCompany, city: e.target.value})
                : setNewCompany({...newCompany, city: e.target.value})}
              placeholder="Cidade"
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="text"
              value={editingCompany ? editingCompany.state : newCompany.state}
              onChange={(e) => editingCompany
                ? setEditingCompany({...editingCompany, state: e.target.value})
                : setNewCompany({...newCompany, state: e.target.value})}
              placeholder="Estado"
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="text"
              value={editingCompany ? editingCompany.zip_code : newCompany.zip_code}
              onChange={(e) => editingCompany
                ? setEditingCompany({...editingCompany, zip_code: e.target.value})
                : setNewCompany({...newCompany, zip_code: e.target.value})}
              placeholder="CEP"
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="text"
              value={editingCompany ? editingCompany.phone : newCompany.phone}
              onChange={(e) => editingCompany
                ? setEditingCompany({...editingCompany, phone: e.target.value})
                : setNewCompany({...newCompany, phone: e.target.value})}
              placeholder="Telefone"
              className="w-full p-2 border rounded-lg"
            />
            <div className="relative">
              <input
                type="email"
                value={editingCompany ? editingCompany.email : newCompany.email}
                onChange={(e) => handleEmailChange(e, !!editingCompany)}
                placeholder="Email"
                className={`w-full p-2 border rounded-lg ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
              />
              {errors.email && (
                <span className="text-red-500 text-sm absolute -bottom-5 left-0">
                  {errors.email}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="url"
                value={editingCompany ? editingCompany.website : newCompany.website}
                onChange={(e) => handleWebsiteChange(e, !!editingCompany)}
                placeholder="Website"
                className={`w-full p-2 border rounded-lg ${
                  errors.website ? 'border-red-500' : 'border-gray-300'
                } focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
              />
              {errors.website && (
                <span className="text-red-500 text-sm absolute -bottom-5 left-0">
                  {errors.website}
                </span>
              )}
            </div>
            <div className="mb-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={editingCompany ? editingCompany.is_active : newCompany.is_active}
                  onChange={(e) => editingCompany
                    ? setEditingCompany({...editingCompany, is_active: e.target.checked})
                    : setNewCompany({...newCompany, is_active: e.target.checked})}
                  className="form-checkbox h-5 w-5"
                  style={{ 
                    borderColor: buttonColor,
                    color: buttonColor 
                  }}
                />
                <span className="ml-2 text-gray-700">Ativo</span>
              </label>
            </div>

            <div className="col-span-full flex justify-end space-x-2 mt-4">
              <button
                onClick={editingCompany ? handleUpdateCompany : handleAddCompany}
                className="text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all"
                style={{ backgroundColor: buttonColor }}
              >
                {editingCompany ? 'Atualizar' : 'Adicionar'}
              </button>
              <button
                onClick={() => {
                  setIsAddingCompany(false);
                  setEditingCompany(null);
                }}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 border">{renderColumnFilter('cnpj', 'CNPJ')}</th>
              <th className="px-4 py-2 border">{renderColumnFilter('name', 'Nome')}</th>
              <th className="px-4 py-2 border">{renderColumnFilter('trade_name', 'Nome Fantasia')}</th>
              <th className="px-4 py-2 border">{renderColumnFilter('city', 'Cidade')}</th>
              <th className="px-4 py-2 border">{renderColumnFilter('state', 'Estado')}</th>
              <th className="px-4 py-2 border">{renderColumnFilter('is_active', 'Ativo')}</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
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
                      style={{ color: buttonColor }}
                      className="hover:opacity-80 transition-colors"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
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
