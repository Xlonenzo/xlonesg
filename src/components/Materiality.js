import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { AlertCircle } from 'lucide-react';
import { API_URL } from '../config';

const Materiality = ({ sidebarColor, buttonColor }) => {
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [materialsPerPage] = useState(12);
  const [errors, setErrors] = useState({});

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
    material.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    projects.find(p => p.id === material.project_id)?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar materialidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded pl-10"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Form */}
      {isFormOpen && renderForm()}

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <span className="text-gray-600">Carregando...</span>
          </div>
        ) : (
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="w-1/4 px-4 py-2 border">Projeto</th>
                <th className="w-1/6 px-4 py-2 border">Tópico</th>
                <th className="w-20 px-4 py-2 border">Impacto Negócio</th>
                <th className="w-20 px-4 py-2 border">Impacto Externo</th>
                <th className="w-20 px-4 py-2 border">Importância Stakeholder</th>
                <th className="w-24 px-4 py-2 border">Prioridade</th>
                <th className="w-20 px-4 py-2 border">Regulatório</th>
                <th className="w-20 px-4 py-2 border">Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentMaterials.map(material => (
                <tr key={material.id}>
                  <td className="w-1/4 px-4 py-2 border truncate">
                    {projects.find(p => p.id === material.project_id)?.name || 'N/A'}
                  </td>
                  <td className="w-1/6 px-4 py-2 border truncate">{material.topic}</td>
                  <td className="w-20 px-4 py-2 border text-center">{material.business_impact}</td>
                  <td className="w-20 px-4 py-2 border text-center">{material.external_impact}</td>
                  <td className="w-20 px-4 py-2 border text-center">{material.stakeholder_importance}</td>
                  <td className="w-24 px-4 py-2 border text-center">{material.priority_level}</td>
                  <td className="w-20 px-4 py-2 border text-center">{material.regulatory_alignment ? 'Sim' : 'Não'}</td>
                  <td className="w-20 px-4 py-2 border">
                    <div className="flex justify-center items-center space-x-2">
                      <button
                        onClick={() => handleEdit(material)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="text-red-500 hover:text-red-700"
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
      <div className="flex justify-center mt-4">
        {Array.from({ 
          length: Math.ceil(filteredMaterials.length / materialsPerPage) 
        }).map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Materiality;