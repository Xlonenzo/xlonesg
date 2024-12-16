import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaFilter, FaChevronUp, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL } from '../config';

const Materiality = ({ sidebarColor, buttonColor }) => {
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [materialsPerPage] = useState(12);
  const [errors, setErrors] = useState({});
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filters, setFilters] = useState({
    project: '',
    topic: '',
    priority: ''
  });

  const [newMaterial, setNewMaterial] = useState({
    project_id: '',
    topic: '',
    business_impact: 0,
    external_impact: 0,
    stakeholder_importance: 0,
    priority_level: '',
    regulatory_alignment: false
  });

  const priorityLevels = ["Alta", "Média", "Baixa"];

  useEffect(() => {
    console.log('API URL:', API_URL);
    fetchMaterials();
    fetchProjects();
  }, []);

  const fetchMaterials = async () => {
    try {
      console.log('Fetching materials from:', `${API_URL}/materiality`);
      const response = await axios.get(`${API_URL}/materiality`);
      console.log('Response:', response);
      
      if (!Array.isArray(response.data)) {
        console.error('Invalid data format:', response.data);
        throw new Error('Dados recebidos em formato inválido');
      }
      
      const validatedMaterials = response.data.map(material => ({
        ...material,
        business_impact: parseFloat(material.business_impact || 0),
        external_impact: parseFloat(material.external_impact || 0),
        stakeholder_importance: parseFloat(material.stakeholder_importance || 0),
        regulatory_alignment: Boolean(material.regulatory_alignment)
      }));
      
      setMaterials(validatedMaterials);
    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Erro ao carregar dados. ';
      if (error.response?.status === 404) {
        errorMessage += 'Endpoint não encontrado.';
      } else if (error.response?.data?.detail) {
        errorMessage += error.response.data.detail;
      } else {
        errorMessage += 'Por favor, tente novamente.';
      }
      
      alert(errorMessage);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/project-tracking`);
      console.log('Dados dos projetos:', response.data);
      setProjects(response.data);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    }
  };

  const validateMaterial = (material) => {
    const errors = {};
    
    if (!material.project_id || isNaN(parseInt(material.project_id))) {
      errors.project_id = 'Projeto é obrigatório';
    }
    
    if (!material.topic || material.topic.trim().length < 3) {
      errors.topic = 'Tópico deve ter pelo menos 3 caracteres';
    }
    
    ['business_impact', 'external_impact', 'stakeholder_importance'].forEach(field => {
      const value = parseFloat(material[field]);
      if (isNaN(value) || value < 0 || value > 10) {
        errors[field] = 'Valor deve estar entre 0 e 10';
      }
    });
    
    if (!material.priority_level || !priorityLevels.includes(material.priority_level)) {
      errors.priority_level = 'Nível de prioridade inválido';
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    
    if (type === 'checkbox') {
      processedValue = checked;
    } else if (['business_impact', 'external_impact', 'stakeholder_importance'].includes(name)) {
      const numValue = parseFloat(value);
      processedValue = !isNaN(numValue) ? Math.min(Math.max(numValue, 0), 10) : 0;
    } else if (name === 'project_id') {
      const numValue = parseInt(value);
      processedValue = !isNaN(numValue) ? numValue : '';
    }

    setNewMaterial(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const resetForm = () => {
    setNewMaterial({
      project_id: '',
      topic: '',
      business_impact: 0,
      external_impact: 0,
      stakeholder_importance: 0,
      priority_level: '',
      regulatory_alignment: false
    });
    setErrors({});
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setNewMaterial({
      ...material,
      project_id: material.project_id.toString(),
      business_impact: Number(material.business_impact),
      external_impact: Number(material.external_impact),
      stakeholder_importance: Number(material.stakeholder_importance)
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/materiality/${id}`);
        await fetchMaterials();
        alert('Registro excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir registro:', error);
        alert('Erro ao excluir registro. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Lista de campos obrigatórios
    const requiredFields = [
      'project_id',
      'topic',
      'business_impact',
      'external_impact',
      'stakeholder_importance',
      'priority_level'
    ];

    // Verificar campos vazios
    const missingFields = requiredFields.filter(field => !newMaterial[field]);
    
    if (missingFields.length > 0) {
      alert(`Por favor, preencha todos os campos obrigatórios: ${missingFields.join(', ')}`);
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        project_id: parseInt(newMaterial.project_id),
        topic: String(newMaterial.topic).trim(),
        business_impact: parseFloat(newMaterial.business_impact),
        external_impact: parseFloat(newMaterial.external_impact),
        stakeholder_importance: parseFloat(newMaterial.stakeholder_importance),
        priority_level: String(newMaterial.priority_level),
        regulatory_alignment: Boolean(newMaterial.regulatory_alignment)
      };

      if (!payload.project_id || isNaN(payload.project_id)) {
        throw new Error('ID do projeto inválido');
      }

      console.log('Sending payload:', payload);

      let response;
      if (editingMaterial) {
        response = await axios.put(
          `${API_URL}/materiality/${editingMaterial.id}`, 
          payload
        );
      } else {
        response = await axios.post(`${API_URL}/materiality`, payload);
      }

      console.log('Response:', response.data);
      
      await fetchMaterials();
      setIsFormOpen(false);
      setEditingMaterial(null);
      resetForm();
      alert(editingMaterial ? 'Registro atualizado com sucesso!' : 'Registro criado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar materialidade:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Erro ao salvar materialidade';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(material =>
    (!filters.project || projects.find(p => p.id === material.project_id)?.name?.toLowerCase().includes(filters.project.toLowerCase())) &&
    (!filters.topic || material.topic.toLowerCase().includes(filters.topic.toLowerCase())) &&
    (!filters.priority || material.priority_level === filters.priority)
  );

  const indexOfLastMaterial = currentPage * materialsPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - materialsPerPage;
  const currentMaterials = filteredMaterials.slice(indexOfFirstMaterial, indexOfLastMaterial);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-bold mb-4">
        {editingMaterial ? 'Editar Materialidade' : 'Nova Materialidade'}
      </h3>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center">
              Projeto
              <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </div>
          </label>
          <select
            name="project_id"
            value={newMaterial.project_id}
            onChange={handleInputChange}
            className={`p-2 border rounded w-full ${errors.project_id ? 'border-red-500' : ''}`}
            required
          >
            <option value="">Selecione o Projeto</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.title || project.name || `Projeto ${project.id}`}
              </option>
            ))}
          </select>
          {errors.project_id && (
            <span className="text-red-500 text-sm">{errors.project_id}</span>
          )}
        </div>

        {/* Tópico */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center">
              Tópico
              <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </div>
          </label>
          <input
            type="text"
            name="topic"
            value={newMaterial.topic}
            onChange={handleInputChange}
            className={`p-2 border rounded w-full ${errors.topic ? 'border-red-500' : ''}`}
            required
          />
          {errors.topic && (
            <span className="text-red-500 text-sm">{errors.topic}</span>
          )}
        </div>

        {/* Impacto no Negócio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center">
              Impacto no Negócio (0-10)
              <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </div>
          </label>
          <input
            type="number"
            name="business_impact"
            value={newMaterial.business_impact}
            onChange={handleInputChange}
            min="0"
            max="10"
            className={`p-2 border rounded w-full ${errors.business_impact ? 'border-red-500' : ''}`}
            required
          />
          {errors.business_impact && (
            <span className="text-red-500 text-sm">{errors.business_impact}</span>
          )}
        </div>

        {/* Impacto Externo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center">
              Impacto Externo (0-10)
              <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </div>
          </label>
          <input
            type="number"
            name="external_impact"
            value={newMaterial.external_impact}
            onChange={handleInputChange}
            min="0"
            max="10"
            className={`p-2 border rounded w-full ${errors.external_impact ? 'border-red-500' : ''}`}
            required
          />
          {errors.external_impact && (
            <span className="text-red-500 text-sm">{errors.external_impact}</span>
          )}
        </div>

        {/* Importância Stakeholder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center">
              Importância para Stakeholders (0-10)
              <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </div>
          </label>
          <input
            type="number"
            name="stakeholder_importance"
            value={newMaterial.stakeholder_importance}
            onChange={handleInputChange}
            min="0"
            max="10"
            className={`p-2 border rounded w-full ${errors.stakeholder_importance ? 'border-red-500' : ''}`}
            required
          />
          {errors.stakeholder_importance && (
            <span className="text-red-500 text-sm">{errors.stakeholder_importance}</span>
          )}
        </div>

        {/* Nível de Prioridade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center">
              Nível de Prioridade
              <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </div>
          </label>
          <select
            name="priority_level"
            value={newMaterial.priority_level}
            onChange={handleInputChange}
            className={`p-2 border rounded w-full ${errors.priority_level ? 'border-red-500' : ''}`}
            required
          >
            <option value="">Selecione a Prioridade</option>
            {priorityLevels.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
          {errors.priority_level && (
            <span className="text-red-500 text-sm">{errors.priority_level}</span>
          )}
        </div>

        {/* Alinhamento Regulatório */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alinhamento Regulatório
          </label>
          <input
            type="checkbox"
            name="regulatory_alignment"
            checked={newMaterial.regulatory_alignment}
            onChange={handleInputChange}
            className="p-2"
          />
        </div>

        {/* Form buttons - Update to match EmissionTracking style */}
        <div className="col-span-2 flex justify-end space-x-2 mt-4">
          <button
            type="submit"
            className="px-4 py-2 text-white rounded hover:opacity-90"
            style={{ backgroundColor: buttonColor }}
            disabled={loading}
          >
            {loading ? 'Salvando...' : (editingMaterial ? 'Atualizar' : 'Adicionar')}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsFormOpen(false);
              setEditingMaterial(null);
              resetForm();
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-row-reverse justify-between items-center mb-6">
        <button
          onClick={() => {
            setIsFormOpen(true);
            setEditingMaterial(null);
            resetForm();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-flex items-center h-10"
          style={{ backgroundColor: buttonColor }}
        >
          <FaPlus size={16} className="mr-2" />
          <span className="leading-none">Novo Registro</span>
        </button>
        <h2 className="text-2xl font-bold">Matriz de Materialidade</h2>
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
          <div className="p-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Tópico</label>
              <input
                type="text"
                value={filters.topic}
                onChange={(e) => setFilters(prev => ({...prev, topic: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                placeholder="Filtrar por tópico"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Prioridade</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({...prev, priority: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
              >
                <option value="">Todas</option>
                {priorityLevels.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      {isFormOpen && renderForm()}

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <span className="text-gray-600">Carregando...</span>
          </div>
        ) : (
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
                  Tópico
                </th>
                <th 
                  className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                  style={{ backgroundColor: `${buttonColor}15` }}
                >
                  Impacto Negócio
                </th>
                <th 
                  className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                  style={{ backgroundColor: `${buttonColor}15` }}
                >
                  Impacto Externo
                </th>
                <th 
                  className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                  style={{ backgroundColor: `${buttonColor}15` }}
                >
                  Importância Stakeholder
                </th>
                <th 
                  className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                  style={{ backgroundColor: `${buttonColor}15` }}
                >
                  Prioridade
                </th>
                <th 
                  className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                  style={{ backgroundColor: `${buttonColor}15` }}
                >
                  Regulatório
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
              {currentMaterials.map(material => (
                <tr key={material.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900">
                      {projects.find(p => p.id === material.project_id)?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900">{material.topic}</div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900">{material.business_impact}</div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900">{material.external_impact}</div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900">{material.stakeholder_importance}</div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900">{material.priority_level}</div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900">{material.regulatory_alignment ? 'Sim' : 'Não'}</div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEdit(material)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
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
        )}
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
            disabled={currentPage === Math.ceil(filteredMaterials.length / materialsPerPage)}
            className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === Math.ceil(filteredMaterials.length / materialsPerPage)
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
              Mostrando <span className="font-medium">{indexOfFirstMaterial + 1}</span> até{' '}
              <span className="font-medium">
                {Math.min(indexOfLastMaterial, filteredMaterials.length)}
              </span>{' '}
              de <span className="font-medium">{filteredMaterials.length}</span> resultados
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
                { length: Math.ceil(filteredMaterials.length / materialsPerPage) },
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
                disabled={currentPage === Math.ceil(filteredMaterials.length / materialsPerPage)}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  currentPage === Math.ceil(filteredMaterials.length / materialsPerPage)
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
};

export default Materiality;