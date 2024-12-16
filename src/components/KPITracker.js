import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaStar, FaPlus, FaFilter, FaCopy, FaExclamationCircle, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { API_URL } from '../config';

function KPITracker({ sidebarColor, buttonColor }) {
  const [kpiEntries, setKpiEntries] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    template_id: '',
    cnpj: '',
    actual_value: '',
    target_value: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    isfavorite: false,
    project_id: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(12);
  const [filters, setFilters] = useState({
    template_name: '',
    cnpj: '',
    actual_value: '',
    target_value: '',
    year: '',
    month: '',
    project_id: ''
  });
  const [projects, setProjects] = useState([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'none'
  });

  useEffect(() => {
    fetchKPIEntries();
    fetchTemplates();
    fetchCompanies();
    fetchProjects();
  }, []);

  const fetchKPIEntries = async () => {
    try {
      const response = await axios.get(`${API_URL}/kpi-entries?limit=1000`);
      console.log('Número de KPIs recebidos:', response.data.length);  // Log para debug
      setKpiEntries(response.data);
    } catch (error) {
      console.error('Erro ao buscar entradas de KPI:', error);
      alert('Erro ao carregar as entradas de KPI. Por favor, tente novamente.');
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API_URL}/kpi-templates?limit=1000`);
      console.log('Número de templates de KPI recebidos:', response.data.length);
      setTemplates(response.data);
    } catch (error) {
      console.error('Erro ao buscar templates de KPI:', error);
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

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/project-tracking`);
      setProjects(response.data);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEntry(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEntry) {
        await axios.put(`${API_URL}/kpi-entries/${editingEntry.entry_id}`, newEntry);
        alert('KPI atualizado com sucesso!');
      } else {
        await axios.post(`${API_URL}/kpi-entries`, newEntry);
        alert('Novo KPI adicionado com sucesso!');
      }
      fetchKPIEntries();
      setIsFormOpen(false);
      setEditingEntry(null);
      setNewEntry({
        template_id: '',
        cnpj: '',
        actual_value: '',
        target_value: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        isfavorite: false,
        project_id: null
      });
    } catch (error) {
      console.error('Erro ao salvar entrada de KPI:', error);
      alert('Erro ao salvar entrada de KPI. Por favor, tente novamente.');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setNewEntry({
      template_id: entry.template_id,
      cnpj: entry.cnpj,
      actual_value: entry.actual_value,
      target_value: entry.target_value,
      year: entry.year,
      month: entry.month,
      isfavorite: entry.isfavorite,
      project_id: entry.project_id || null
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (entryId) => {
    if (window.confirm('Tem certeza que deseja excluir esta entrada?')) {
      try {
        await axios.delete(`${API_URL}/kpi-entries/${entryId}`);
        fetchKPIEntries();
        alert('Entrada de KPI excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir entrada de KPI:', error);
        alert('Erro ao excluir entrada de KPI. Por favor, tente novamente.');
      }
    }
  };

  const toggleFavorite = async (entry) => {
    try {
      const updatedEntry = { ...entry, isfavorite: !entry.isfavorite };
      await axios.put(`${API_URL}/kpi-entries/${entry.entry_id}`, updatedEntry);
      fetchKPIEntries();
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
      alert('Erro ao atualizar favorito. Por favor, tente novamente.');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredAndSearchedEntries = kpiEntries.filter(entry => {
    const templateName = templates.find(t => t.id === entry.template_id)?.name.toLowerCase() || '';
    return (
      (filters.template_name === '' || templateName.includes(filters.template_name.toLowerCase())) &&
      (filters.cnpj === '' || entry.cnpj.includes(filters.cnpj)) &&
      (filters.project_id === '' || entry.project_id === parseInt(filters.project_id))
    );
  });

  const renderSortIcon = (columnKey) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'ascending' ? 
        <FaChevronUp size={12} className="text-gray-400" /> : 
        <FaChevronDown size={12} className="text-gray-400" />;
    }
    return null;
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Atualizar a lógica de paginação
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredAndSearchedEntries.slice(indexOfFirstEntry, indexOfLastEntry);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDuplicate = async (entry) => {
    try {
      const duplicatedEntry = {
        template_id: entry.template_id,
        cnpj: entry.cnpj,
        actual_value: entry.actual_value,
        target_value: entry.target_value,
        year: entry.year,
        month: entry.month,
        isfavorite: false,
        project_id: entry.project_id
      };
      await axios.post(`${API_URL}/kpi-entries`, duplicatedEntry);
      fetchKPIEntries();
      alert('KPI duplicado com sucesso!');
    } catch (error) {
      console.error('Erro ao duplicar entrada de KPI:', error);
      alert('Erro ao duplicar entrada de KPI. Por favor, tente novamente.');
    }
  };

  const resetForm = () => {
    setNewEntry({
      template_id: '',
      cnpj: '',
      actual_value: '',
      target_value: '',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      isfavorite: false,
      project_id: null
    });
    setEditingEntry(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium text-gray-800">KPI Tracker</h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="text-white px-4 py-2 rounded hover:opacity-80 transition-all flex items-center gap-2 text-sm"
          style={{ backgroundColor: buttonColor }}
        >
          <FaPlus size={16} />
          {isFormOpen ? 'Fechar Formulário' : 'Adicionar Nova Entrada'}
        </button>
      </div>
      
      {/* Seção de Filtros */}
      <div className="bg-white rounded-lg shadow-sm mb-4 border border-gray-100">
        <button
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          style={{ color: buttonColor }}
        >
          <div className="flex items-center gap-2">
            <FaFilter size={16} style={{ color: buttonColor }} />
            <span className="font-medium text-sm" style={{ color: buttonColor }}>Filtros</span>
          </div>
          {isFilterExpanded ? 
            <FaChevronUp size={16} style={{ color: buttonColor }} /> : 
            <FaChevronDown size={16} style={{ color: buttonColor }} />
          }
        </button>
        
        {isFilterExpanded && (
          <div className="p-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Template</label>
                <input
                  type="text"
                  name="template_name"
                  value={filters.template_name}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                  placeholder="Filtrar por template..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">CNPJ</label>
                <input
                  type="text"
                  name="cnpj"
                  value={filters.cnpj}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                  placeholder="Filtrar por CNPJ..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Projeto</label>
                <select
                  name="project_id"
                  value={filters.project_id}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                >
                  <option value="">Todos os projetos</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setFilters({
                  template_name: '',
                  cnpj: '',
                  project_id: '',
                  actual_value: '',
                  target_value: '',
                  year: '',
                  month: ''
                })}
                className="px-4 py-2 text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-bold mb-2">
            {editingEntry ? 'Editar Entrada de KPI' : 'Nova Entrada de KPI'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 flex items-center">
                  Template KPI
                  <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </label>
                <select
                  name="template_id"
                  value={newEntry.template_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Selecione um template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 flex items-center">
                  Empresa (CNPJ)
                  <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </label>
                <select
                  name="cnpj"
                  value={newEntry.cnpj}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.cnpj}>{company.name} ({company.cnpj})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 flex items-center">
                  Valor Atual
                  <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </label>
                <input
                  type="number"
                  name="actual_value"
                  value={newEntry.actual_value}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 flex items-center">
                  Valor Alvo
                  <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </label>
                <input
                  type="number"
                  name="target_value"
                  value={newEntry.target_value}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 flex items-center">
                  Ano
                  <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </label>
                <input
                  type="number"
                  name="year"
                  value={newEntry.year}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 flex items-center">
                  Mês
                  <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </label>
                <input
                  type="number"
                  name="month"
                  value={newEntry.month}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  min="1"
                  max="12"
                  required
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isfavorite"
                    checked={newEntry.isfavorite}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Favorito
                </label>
              </div>
              <div>
                <label className="block mb-2">Projeto</label>
                <select
                  name="project_id"
                  value={newEntry.project_id || ''}
                  onChange={(e) => handleInputChange({
                    target: {
                      name: 'project_id',
                      value: e.target.value ? Number(e.target.value) : null
                    }
                  })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Selecione um projeto</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {companies.find(c => c.id === project.company_id)?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 space-x-2">
              <button
                type="submit"
                className="text-white px-4 py-2 rounded hover:opacity-80"
                style={{ backgroundColor: buttonColor }}
              >
                {editingEntry ? 'Atualizar' : 'Adicionar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-100 rounded-lg">
          <thead>
            <tr>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group whitespace-nowrap w-[200px]"
                onClick={() => handleSort('template_name')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1">
                  <span>Template</span>
                  {renderSortIcon('template_name')}
                </div>
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group whitespace-nowrap w-[150px]"
                onClick={() => handleSort('cnpj')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1">
                  <span>CNPJ</span>
                  {renderSortIcon('cnpj')}
                </div>
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group whitespace-nowrap w-[150px]"
                onClick={() => handleSort('project_id')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1">
                  <span>Projeto</span>
                  {renderSortIcon('project_id')}
                </div>
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group whitespace-nowrap w-[120px]"
                onClick={() => handleSort('actual_value')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1">
                  <span>Valor Atual</span>
                  {renderSortIcon('actual_value')}
                </div>
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group whitespace-nowrap w-[120px]"
                onClick={() => handleSort('target_value')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1">
                  <span>Valor Alvo</span>
                  {renderSortIcon('target_value')}
                </div>
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group whitespace-nowrap w-[80px]"
                onClick={() => handleSort('year')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1">
                  <span>Ano</span>
                  {renderSortIcon('year')}
                </div>
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group whitespace-nowrap w-[80px]"
                onClick={() => handleSort('month')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1">
                  <span>Mês</span>
                  {renderSortIcon('month')}
                </div>
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-center text-sm font-medium text-gray-600 whitespace-nowrap w-[80px]"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Favorito
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-center text-sm font-medium text-gray-600 whitespace-nowrap w-[120px]"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.map(entry => (
              <tr key={entry.entry_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{entry.template_name}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{entry.cnpj}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  {projects.find(p => p.id === entry.project_id)?.name || '-'}
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  {entry.actual_value}
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  {entry.target_value}
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  {entry.year}
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  {entry.month}
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-center text-sm font-medium text-gray-600 whitespace-nowrap">
                  <button 
                    onClick={() => toggleFavorite(entry)}
                    className="focus:outline-none"
                  >
                    <FaStar 
                      className={`transition-colors duration-300 ${entry.isfavorite ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-center text-sm font-medium text-gray-600 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.entry_id)}
                    className="text-red-500 hover:text-red-700 mr-2"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => handleDuplicate(entry)}
                    className="text-green-500 hover:text-green-700"
                  >
                    <FaCopy />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação no estilo do CompanyManagement */}
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
            disabled={currentPage === Math.ceil(filteredAndSearchedEntries.length / entriesPerPage)}
            className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === Math.ceil(filteredAndSearchedEntries.length / entriesPerPage)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Próximo
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{indexOfFirstEntry + 1}</span> até{' '}
              <span className="font-medium">
                {Math.min(indexOfLastEntry, filteredAndSearchedEntries.length)}
              </span>{' '}
              de <span className="font-medium">{filteredAndSearchedEntries.length}</span> resultados
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
                <FaChevronUp className="h-5 w-5 rotate-90" />
              </button>
              {Array.from(
                { length: Math.ceil(filteredAndSearchedEntries.length / entriesPerPage) },
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
                disabled={currentPage === Math.ceil(filteredAndSearchedEntries.length / entriesPerPage)}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  currentPage === Math.ceil(filteredAndSearchedEntries.length / entriesPerPage)
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                <span className="sr-only">Próximo</span>
                <FaChevronDown className="h-5 w-5 rotate-90" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KPITracker;
