import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaStar, FaPlus, FaSearch, FaFilter, FaCopy } from 'react-icons/fa';
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
    project_id: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
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
        project_id: ''
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
      project_id: entry.project_id || ''
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
    const searchTermMatch = searchTerm === '' || 
      (entry.template_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       entry.cnpj?.toLowerCase().includes(searchTerm.toLowerCase()));

    const templateMatch = !filters.template_name || 
      entry.template_name?.toLowerCase().includes(filters.template_name.toLowerCase());
    
    const cnpjMatch = !filters.cnpj || 
      entry.cnpj?.toLowerCase().includes(filters.cnpj.toLowerCase());
    
    const actualValueMatch = !filters.actual_value || 
      entry.actual_value?.toString().includes(filters.actual_value);
    
    const targetValueMatch = !filters.target_value || 
      entry.target_value?.toString().includes(filters.target_value);
    
    const yearMatch = !filters.year || 
      entry.year?.toString().includes(filters.year);
    
    const monthMatch = !filters.month || 
      entry.month?.toString().includes(filters.month);
    
    const projectMatch = !filters.project_id || 
      entry.project_id?.toString() === filters.project_id;

    return searchTermMatch && 
           templateMatch && 
           cnpjMatch && 
           actualValueMatch && 
           targetValueMatch && 
           yearMatch && 
           monthMatch &&
           projectMatch;
  });

  const renderColumnFilter = (columnName, placeholder) => (
    <div className="flex items-center">
      <input
        type={columnName.includes('value') || columnName === 'year' || columnName === 'month' ? 'number' : 'text'}
        name={columnName}
        value={filters[columnName]}
        onChange={handleFilterChange}
        className="w-full p-1 text-sm border rounded"
        placeholder={placeholder}
        min={columnName === 'month' ? 1 : undefined}
        max={columnName === 'month' ? 12 : undefined}
      />
      <FaFilter className="ml-1 text-gray-500" />
    </div>
  );

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">KPI Tracker</h2>
      
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          style={{ backgroundColor: buttonColor }}
        >
          <FaPlus className="mr-2" /> {isFormOpen ? 'Fechar Formulário' : 'Adicionar Nova Entrada'}
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar entradas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 pl-8 border rounded"
          />
          <FaSearch className="absolute left-2 top-3 text-gray-400" />
        </div>
      </div>

      {isFormOpen && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-bold mb-2">
            {editingEntry ? 'Editar Entrada de KPI' : 'Nova Entrada de KPI'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Template KPI</label>
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
                <label className="block mb-2">Empresa (CNPJ)</label>
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
                <label className="block mb-2">Valor Atual</label>
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
                <label className="block mb-2">Valor Alvo</label>
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
                <label className="block mb-2">Ano</label>
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
                <label className="block mb-2">Mês</label>
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
                  value={newEntry.project_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Selecione um projeto (opcional)</option>
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
                onClick={() => {
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
                    project_id: ''
                  });
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">{renderColumnFilter('template_name', 'Filtrar template')}</th>
              <th className="px-4 py-2 border">{renderColumnFilter('cnpj', 'Filtrar CNPJ')}</th>
              <th className="px-4 py-2 border">
                <div className="flex items-center">
                  <select
                    name="project_id"
                    value={filters.project_id}
                    onChange={handleFilterChange}
                    className="w-full p-1 text-sm border rounded"
                  >
                    <option value="">Todos os projetos</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <FaFilter className="ml-1 text-gray-500" />
                </div>
              </th>
              <th className="px-4 py-2 border">{renderColumnFilter('actual_value', 'Filtrar valor atual')}</th>
              <th className="px-4 py-2 border">{renderColumnFilter('target_value', 'Filtrar valor alvo')}</th>
              <th className="px-4 py-2 border">{renderColumnFilter('year', 'Filtrar ano')}</th>
              <th className="px-4 py-2 border">{renderColumnFilter('month', 'Filtrar mês')}</th>
              <th className="px-4 py-2 border">Favorito</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.map(entry => (
              <tr key={entry.entry_id}>
                <td className="px-4 py-2 border">{entry.template_name}</td>
                <td className="px-4 py-2 border">{entry.cnpj}</td>
                <td className="px-4 py-2 border">
                  {projects.find(p => p.id === entry.project_id)?.name || '-'}
                </td>
                <td className="px-4 py-2 border">{entry.actual_value}</td>
                <td className="px-4 py-2 border">{entry.target_value}</td>
                <td className="px-4 py-2 border">{entry.year}</td>
                <td className="px-4 py-2 border">{entry.month}</td>
                <td className="px-4 py-2 border">
                  <button 
                    onClick={() => toggleFavorite(entry)}
                    className="focus:outline-none"
                  >
                    <FaStar 
                      className={`transition-colors duration-300 ${entry.isfavorite ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                </td>
                <td className="px-4 py-2 border">
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

      {/* Paginação */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(filteredAndSearchedEntries.length / entriesPerPage) }, (_, i) => (
          <button
            key={i}
            onClick={() => paginate(i + 1)}
            className={`mx-1 px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default KPITracker;
