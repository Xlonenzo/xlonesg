import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { API_URL } from '../config';

const Materiality = ({ sidebarColor, buttonColor }) => {
  const [materials, setMaterials] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [materialsPerPage] = useState(12);

  const [newMaterial, setNewMaterial] = useState({
    company_id: '',
    topic: '',
    business_impact: 0,
    external_impact: 0,
    stakeholder_importance: 0,
    priority_level: '',
    regulatory_alignment: false,
    last_updated: new Date().toISOString()
  });

  const priorityLevels = ["Alta", "Média", "Baixa"];

  useEffect(() => {
    fetchMaterials();
    fetchCompanies();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`${API_URL}/materiality`);
      console.log('Dados de materialidade:', response.data);
      setMaterials(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados de materialidade:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/companies`);
      console.log('Dados das empresas:', response.data);
      setCompanies(response.data);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingMaterial) {
        await axios.put(`${API_URL}/materiality/${editingMaterial.id}`, newMaterial);
      } else {
        await axios.post(`${API_URL}/materiality`, newMaterial);
      }
      fetchMaterials();
      setIsFormOpen(false);
      setEditingMaterial(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar materialidade:', error);
      alert(error.response?.data?.detail || 'Erro ao salvar materialidade');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setNewMaterial(material);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        setLoading(true);
        const response = await axios.delete(`${API_URL}/materiality/${id}`);
        
        if (response.status === 200) {
          console.log('Materialidade deletada com sucesso');
          // Atualiza a lista após deletar
          fetchMaterials();
        }
      } catch (error) {
        console.error('Erro ao excluir materialidade:', error);
        const errorMessage = error.response?.data?.detail || 'Erro ao excluir materialidade';
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMaterial(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setNewMaterial({
      company_id: '',
      topic: '',
      business_impact: 0,
      external_impact: 0,
      stakeholder_importance: 0,
      priority_level: '',
      regulatory_alignment: false,
      last_updated: new Date().toISOString()
    });
  };

  // Filtrar e paginar
  const filteredMaterials = materials.filter(material =>
    material.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (material.company?.name || companies.find(c => c.id === material.company_id)?.name || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastMaterial = currentPage * materialsPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - materialsPerPage;
  const currentMaterials = filteredMaterials.slice(indexOfFirstMaterial, indexOfLastMaterial);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderForm = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-start overflow-y-auto pt-10">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h3 className="text-xl font-bold mb-4">
          {editingMaterial ? 'Editar Materialidade' : 'Nova Materialidade'}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Empresa */}
          <div>
            <label className="block mb-1">Empresa</label>
            <select
              name="company_id"
              value={newMaterial.company_id}
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

          {/* Tópico */}
          <div>
            <label className="block mb-1">Tópico</label>
            <input
              type="text"
              name="topic"
              value={newMaterial.topic}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          {/* Impacto no Negócio */}
          <div>
            <label className="block mb-1">Impacto no Negócio (0-10)</label>
            <input
              type="number"
              name="business_impact"
              value={newMaterial.business_impact}
              onChange={handleInputChange}
              min="0"
              max="10"
              className="p-2 border rounded w-full"
              required
            />
          </div>

          {/* Impacto Externo */}
          <div>
            <label className="block mb-1">Impacto Externo (0-10)</label>
            <input
              type="number"
              name="external_impact"
              value={newMaterial.external_impact}
              onChange={handleInputChange}
              min="0"
              max="10"
              className="p-2 border rounded w-full"
              required
            />
          </div>

          {/* Importância Stakeholder */}
          <div>
            <label className="block mb-1">Importância para Stakeholders (0-10)</label>
            <input
              type="number"
              name="stakeholder_importance"
              value={newMaterial.stakeholder_importance}
              onChange={handleInputChange}
              min="0"
              max="10"
              className="p-2 border rounded w-full"
              required
            />
          </div>

          {/* Nível de Prioridade */}
          <div>
            <label className="block mb-1">Nível de Prioridade</label>
            <select
              name="priority_level"
              value={newMaterial.priority_level}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">Selecione a Prioridade</option>
              {priorityLevels.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>

          {/* Alinhamento Regulatório */}
          <div>
            <label className="block mb-1">Alinhamento Regulatório</label>
            <input
              type="checkbox"
              name="regulatory_alignment"
              checked={newMaterial.regulatory_alignment}
              onChange={(e) => handleInputChange({
                target: {
                  name: 'regulatory_alignment',
                  value: e.target.checked
                }
              })}
              className="p-2 border rounded"
            />
          </div>

          {/* Última Atualização */}
          <div>
            <label className="block mb-1">Última Atualização</label>
            <input
              type="date"
              name="last_updated"
              value={newMaterial.last_updated}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="submit"
            className="px-4 py-2 text-white rounded"
            style={{ backgroundColor: buttonColor }}
            disabled={loading}
          >
            {loading ? 'Salvando...' : (editingMaterial ? 'Atualizar' : 'Criar')}
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Matriz de Materialidade</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 text-white rounded flex items-center"
          style={{ backgroundColor: buttonColor }}
        >
          <FaPlus className="mr-2" /> Novo Registro
        </button>
      </div>

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
                <th className="px-4 py-2 border">Empresa</th>
                <th className="px-4 py-2 border">Tópico</th>
                <th className="px-4 py-2 border">Impacto no Negócio</th>
                <th className="px-4 py-2 border">Impacto Externo</th>
                <th className="px-4 py-2 border">Importância Stakeholder</th>
                <th className="px-4 py-2 border">Nível de Prioridade</th>
                <th className="px-4 py-2 border">Alinhamento Regulatório</th>
                <th className="px-4 py-2 border">Última Atualização</th>
                <th className="px-4 py-2 border">Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentMaterials.map(material => (
                <tr key={material.id}>
                  <td className="px-4 py-2 border">
                    {material.company?.name || companies.find(c => c.id === material.company_id)?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-2 border">{material.topic}</td>
                  <td className="px-4 py-2 border">{material.business_impact}</td>
                  <td className="px-4 py-2 border">{material.external_impact}</td>
                  <td className="px-4 py-2 border">{material.stakeholder_importance}</td>
                  <td className="px-4 py-2 border">{material.priority_level}</td>
                  <td className="px-4 py-2 border">{material.regulatory_alignment ? 'Sim' : 'Não'}</td>
                  <td className="px-4 py-2 border">
                    {new Date(material.last_updated).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => handleEdit(material)}
                      className="px-2 py-1 text-blue-500 mr-2"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="px-2 py-1 text-red-500"
                    >
                      <FaTrash />
                    </button>
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