import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaFilter, FaChevronUp, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL } from '../config';

function Suppliers({ sidebarColor, buttonColor }) {
  const [suppliers, setSuppliers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [suppliersPerPage] = useState(12);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    project: '',
    risk_level: '',
    compliance_status: ''
  });

  const [newSupplier, setNewSupplier] = useState({
    project_id: '',
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
    const loadData = async () => {
      try {
        await fetchProjects();
        await fetchSuppliers();
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      }
    };
    
    loadData();
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

  const fetchProjects = async () => {
    try {
      console.log('Iniciando busca de projetos...');
      const response = await axios.get(`${API_URL}/project-tracking`);
      console.log('Resposta dos projetos:', response.data);
      setProjects(response.data);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error.response || error);
      alert('Erro ao carregar projetos. Por favor, verifique o console.');
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
      project_id: '',
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
      // Lista de campos obrigatórios
      const requiredFields = [
        'project_id',
        'name',
        'risk_level',
        'esg_score',
        'location',
        'compliance_status',
        'impact_assessment'
      ];

      // Verificar campos vazios
      const missingFields = requiredFields.filter(field => !newSupplier[field]);
      
      if (missingFields.length > 0) {
        alert(`Por favor, preencha todos os campos obrigatórios: ${missingFields.join(', ')}`);
        return;
      }

      console.log('URL da API:', API_URL);
      console.log('Enviando dados:', newSupplier);
      const formattedData = {
        project_id: parseInt(newSupplier.project_id),
        name: String(newSupplier.name).trim(),
        risk_level: String(newSupplier.risk_level).trim(),
        esg_score: parseFloat(newSupplier.esg_score),
        location: String(newSupplier.location).trim(),
        compliance_status: String(newSupplier.compliance_status).trim(),
        esg_reporting: Boolean(newSupplier.esg_reporting),
        impact_assessment: String(newSupplier.impact_assessment).trim()
      };
      console.log('Dados formatados:', formattedData);

      let response;
      if (editingSupplier) {
        // Se estiver editando, faz PUT para atualizar
        console.log('Atualizando fornecedor:', editingSupplier.id);
        response = await axios.put(
          `${API_URL}/suppliers/${editingSupplier.id}`, 
          formattedData
        );
      } else {
        // Se não estiver editando, faz POST para criar
        console.log('Criando novo fornecedor');
        response = await axios.post(`${API_URL}/suppliers`, formattedData);
      }

      console.log('Resposta do servidor:', response.data);
      
      fetchSuppliers(); // Atualiza a lista
      setIsFormOpen(false);
      setEditingSupplier(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert(error.message);
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
    return (
      (!filters.name || supplier.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.project || projects.find(p => p.id === supplier.project_id)?.name.toLowerCase().includes(filters.project.toLowerCase())) &&
      (!filters.risk_level || supplier.risk_level === filters.risk_level) &&
      (!filters.compliance_status || supplier.compliance_status === filters.compliance_status)
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

      {/* Seção de Filtros Expansível */}
      <div className="bg-white rounded-lg shadow-sm mb-4 border border-gray-100">
        <button
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          style={{ color: buttonColor }}
        >
          <div className="flex items-center gap-2">
            <FaFilter size={16} style={{ color: buttonColor }} />
            <span className="font-medium text-sm">Filtros</span>
          </div>
          {isFilterExpanded ? 
            <FaChevronUp size={16} /> : 
            <FaChevronDown size={16} />
          }
        </button>
        
        {isFilterExpanded && (
          <div className="p-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nome</label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => setFilters(prev => ({...prev, name: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                placeholder="Filtrar por nome"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Projeto</label>
              <input
                type="text"
                value={filters.project}
                onChange={(e) => setFilters(prev => ({...prev, project: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                placeholder="Filtrar por projeto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nível de Risco</label>
              <select
                value={filters.risk_level}
                onChange={(e) => setFilters(prev => ({...prev, risk_level: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
              >
                <option value="">Todos</option>
                {riskLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              <select
                value={filters.compliance_status}
                onChange={(e) => setFilters(prev => ({...prev, compliance_status: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
              >
                <option value="">Todos</option>
                {complianceStatus.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campos do formulário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Projeto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    Projeto
                    <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                  </div>
                </label>
                <select
                  name="project_id"
                  value={newSupplier.project_id}
                  onChange={handleInputChange}
                  className="p-2 border rounded w-full"
                  required
                >
                  <option value="">Selecione o Projeto</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title || project.name || `Projeto ${project.id}`}
                    </option>
                  ))}
                </select>
                {projects.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    Nenhum projeto encontrado. Crie um projeto primeiro.
                  </p>
                )}
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    Nome do Fornecedor
                    <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                  </div>
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
                  <div className="flex items-center">
                    Nível de Risco
                    <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                  </div>
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
                  <div className="flex items-center">
                    Score ESG
                    <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                  </div>
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
                  <div className="flex items-center">
                    Localização
                    <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                  </div>
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
                  <div className="flex items-center">
                    Status de Conformidade
                    <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                  </div>
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
                  <div className="flex items-center">
                    Avaliação de Impacto
                    <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                  </div>
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
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Projeto
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Nome
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Nível de Risco
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Score ESG
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Localização
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Status
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Relatório ESG
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-center text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {currentSuppliers.map(supplier => (
              <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">
                    {projects.find(p => p.id === supplier.project_id)?.title || 
                     projects.find(p => p.id === supplier.project_id)?.name || 
                     'N/A'}
                  </div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{supplier.name}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{supplier.risk_level}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{supplier.esg_score}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{supplier.location}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{supplier.compliance_status}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">
                    {supplier.esg_reporting ? 'Sim' : 'Não'}
                  </div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
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

      {/* Paginação */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Anterior
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredSuppliers.length / suppliersPerPage)}
            className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === Math.ceil(filteredSuppliers.length / suppliersPerPage)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Próximo
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{indexOfFirstSupplier + 1}</span> até{' '}
              <span className="font-medium">
                {Math.min(indexOfLastSupplier, filteredSuppliers.length)}
              </span>{' '}
              de <span className="font-medium">{filteredSuppliers.length}</span> resultados
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  currentPage === 1 ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <span className="sr-only">Anterior</span>
                <ChevronLeft size={16} className="stroke-[1.5]" />
              </button>
              {Array.from(
                { length: Math.ceil(filteredSuppliers.length / suppliersPerPage) },
                (_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === i + 1
                        ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              )}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredSuppliers.length / suppliersPerPage)}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  currentPage === Math.ceil(filteredSuppliers.length / suppliersPerPage)
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                <span className="sr-only">Próximo</span>
                <ChevronRight size={16} className="stroke-[1.5]" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Suppliers; 