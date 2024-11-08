import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { API_URL } from '../config';

function Suppliers({ sidebarColor, buttonColor }) {
  const [suppliers, setSuppliers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [suppliersPerPage] = useState(12);

  const [newSupplier, setNewSupplier] = useState({
    company_id: '',
    name: '',
    risk_level: '',
    esg_score: 0,
    location: '',
    compliance_status: '',
    esg_reporting: false,
    impact_assessment: ''
  });

  const riskLevels = [
    "Alto",
    "Médio",
    "Baixo"
  ];

  const complianceStatus = [
    "Conforme",
    "Não Conforme"
  ];

  useEffect(() => {
    fetchSuppliers();
    fetchCompanies();
  }, []);

  const fetchSuppliers = async () => {
    try {
      console.log('Buscando fornecedores...');
      const response = await axios.get(`${API_URL}/suppliers`);
      console.log('Fornecedores recebidos:', response.data);
      setSuppliers(response.data);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error.response || error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/companies`);
      setCompanies(response.data);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSupplier(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setNewSupplier({
      company_id: '',
      name: '',
      risk_level: '',
      esg_score: 0,
      location: '',
      compliance_status: '',
      esg_reporting: false,
      impact_assessment: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('URL da API:', API_URL);
      console.log('Enviando dados:', newSupplier);
      const formattedData = {
        company_id: parseInt(newSupplier.company_id),
        name: String(newSupplier.name).trim(),
        risk_level: String(newSupplier.risk_level).trim(),
        esg_score: parseFloat(newSupplier.esg_score),
        location: String(newSupplier.location).trim(),
        compliance_status: String(newSupplier.compliance_status).trim(),
        esg_reporting: Boolean(newSupplier.esg_reporting),
        impact_assessment: String(newSupplier.impact_assessment).trim()
      };
      console.log('Dados formatados:', formattedData);
      console.log('Fazendo requisição POST para:', `${API_URL}/suppliers`);

      const response = await axios.post(`${API_URL}/suppliers`, formattedData);
      console.log('Resposta do servidor:', response.data);
      
      fetchSuppliers();
      setIsFormOpen(false);
      setEditingSupplier(null);
      resetForm();
    } catch (error) {
      console.error('Erro completo:', error);
      console.error('Resposta do erro:', error.response);
      alert(`Erro ao ${editingSupplier ? 'atualizar' : 'criar'} fornecedor: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        await axios.delete(`${API_URL}/suppliers/${id}`);
        alert('Fornecedor excluído com sucesso!');
        fetchSuppliers();
      } catch (error) {
        console.error('Erro ao excluir fornecedor:', error);
        alert('Erro ao excluir fornecedor');
      }
    }
  };

  // Filtragem e Paginação
  const filteredSuppliers = suppliers.filter(supplier => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(searchTermLower) ||
      supplier.location.toLowerCase().includes(searchTermLower) ||
      companies.find(c => c.id === supplier.company_id)?.name.toLowerCase().includes(searchTermLower)
    );
  });

  const indexOfLastSupplier = currentPage * suppliersPerPage;
  const indexOfFirstSupplier = indexOfLastSupplier - suppliersPerPage;
  const currentSuppliers = filteredSuppliers.slice(indexOfFirstSupplier, indexOfLastSupplier);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Fornecedores</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 text-white rounded flex items-center"
          style={{ backgroundColor: buttonColor }}
        >
          <FaPlus className="mr-2" /> Novo Fornecedor
        </button>
      </div>

      {/* Barra de pesquisa */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar fornecedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded pl-10"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campos do formulário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <select
                  name="company_id"
                  value={newSupplier.company_id}
                  onChange={handleInputChange}
                  className="p-2 border rounded w-full"
                  required
                >
                  <option value="">Selecione a Empresa</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Fornecedor
                </label>
                <input
                  type="text"
                  name="name"
                  value={newSupplier.name}
                  onChange={handleInputChange}
                  className="p-2 border rounded w-full"
                  required
                />
              </div>

              {/* Nível de Risco */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível de Risco
                </label>
                <select
                  name="risk_level"
                  value={newSupplier.risk_level}
                  onChange={handleInputChange}
                  className="p-2 border rounded w-full"
                  required
                >
                  <option value="">Selecione o Nível de Risco</option>
                  {riskLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Score ESG */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score ESG
                </label>
                <input
                  type="number"
                  name="esg_score"
                  value={newSupplier.esg_score}
                  onChange={handleInputChange}
                  className="p-2 border rounded w-full"
                  min="0"
                  max="100"
                  required
                />
              </div>

              {/* Localização */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização
                </label>
                <input
                  type="text"
                  name="location"
                  value={newSupplier.location}
                  onChange={handleInputChange}
                  className="p-2 border rounded w-full"
                  required
                />
              </div>

              {/* Status de Conformidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status de Conformidade
                </label>
                <select
                  name="compliance_status"
                  value={newSupplier.compliance_status}
                  onChange={handleInputChange}
                  className="p-2 border rounded w-full"
                  required
                >
                  <option value="">Selecione o Status</option>
                  {complianceStatus.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Relatório ESG */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Possui Relatório ESG?
                </label>
                <input
                  type="checkbox"
                  name="esg_reporting"
                  checked={newSupplier.esg_reporting}
                  onChange={(e) => handleInputChange({
                    target: {
                      name: 'esg_reporting',
                      value: e.target.checked
                    }
                  })}
                  className="p-2"
                />
              </div>

              {/* Avaliação de Impacto */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avaliação de Impacto
                </label>
                <textarea
                  name="impact_assessment"
                  value={newSupplier.impact_assessment}
                  onChange={handleInputChange}
                  className="p-2 border rounded w-full"
                  rows="3"
                  required
                />
              </div>
            </div>

            {/* Botões do formulário */}
            <div className="flex justify-end space-x-2">
              <button
                type="submit"
                className="px-4 py-2 text-white rounded"
                style={{ backgroundColor: buttonColor }}
                disabled={loading}
              >
                {loading ? 'Salvando...' : (editingSupplier ? 'Atualizar' : 'Criar')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingSupplier(null);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela de fornecedores */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Empresa</th>
              <th className="px-4 py-2 border">Nome</th>
              <th className="px-4 py-2 border">Nível de Risco</th>
              <th className="px-4 py-2 border">Score ESG</th>
              <th className="px-4 py-2 border">Localização</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Relatório ESG</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentSuppliers.map(supplier => (
              <tr key={supplier.id}>
                <td className="px-4 py-2 border">
                  {companies.find(c => c.id === supplier.company_id)?.name || 'N/A'}
                </td>
                <td className="px-4 py-2 border">{supplier.name}</td>
                <td className="px-4 py-2 border">{supplier.risk_level}</td>
                <td className="px-4 py-2 border">{supplier.esg_score}</td>
                <td className="px-4 py-2 border">{supplier.location}</td>
                <td className="px-4 py-2 border">{supplier.compliance_status}</td>
                <td className="px-4 py-2 border">
                  {supplier.esg_reporting ? 'Sim' : 'Não'}
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleEdit(supplier)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(supplier.id)}
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

      {/* Paginação */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(filteredSuppliers.length / suppliersPerPage) }, (_, i) => (
          <button
            key={i}
            onClick={() => paginate(i + 1)}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Suppliers; 