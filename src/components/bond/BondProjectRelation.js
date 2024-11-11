import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

const BondProjectRelation = ({ sidebarColor, buttonColor }) => {
  const [bonds, setBonds] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedBond, setSelectedBond] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    status: '',
    minScore: '',
    maxScore: '',
    minBudget: '',
    maxBudget: ''
  });
  const [bondProjects, setBondProjects] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [cardFilters, setCardFilters] = useState({
    bondName: '',
    minProjects: '',
    maxProjects: '',
    minBudget: '',
    maxBudget: ''
  });

  const fetchBonds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/bonds`);
      console.log('Títulos recebidos:', response.data);
      setBonds(response.data);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar títulos:', error);
      setError('Falha ao carregar os títulos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/project-tracking`);
      console.log('Projetos recebidos:', response.data);
      setProjects(response.data);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      setError('Falha ao carregar os projetos. Por favor, tente novamente.');
    }
  }, []);

  const fetchBondProjects = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/bonds/relationships`);
      setBondProjects(response.data);
    } catch (error) {
      console.error('Erro ao buscar relacionamentos:', error);
      setError('Falha ao carregar os relacionamentos');
    }
  }, []);

  useEffect(() => {
    fetchBonds();
    fetchProjects();
    fetchBondProjects();
  }, [fetchBonds, fetchProjects, fetchBondProjects]);

  const handleBondSelect = (bondId) => {
    setSelectedBond(bondId);
    setSelectedProjects([]);
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      }
      return [...prev, projectId];
    });
  };

  const calculateProjectScore = (project) => {
    const odsFields = Object.keys(project).filter(key => key.startsWith('ods'));
    const odsValues = odsFields.map(field => Number(project[field]) || 0);
    const totalODS = odsValues.filter(value => value > 0).length;
    
    if (totalODS === 0) return 0;
    return (odsValues.reduce((acc, curr) => acc + curr, 0) / totalODS) / 2;
  };

  const handleSave = async () => {
    if (!selectedBond) {
      alert('Selecione um título');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post(`${API_URL}/api/bonds/${selectedBond}/projects`, {
        project_ids: selectedProjects
      });

      console.log('Resposta do servidor:', response.data);

      if (response.data.message) {
        await fetchBondProjects();
        
        setIsCreating(false);
        setSelectedBond('');
        setSelectedProjects([]);
        
        alert('Relação salva com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar relação:', error);
      const message = error.response?.data?.detail || 'Erro ao salvar relação. Por favor, tente novamente.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value, currency = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  const calculateTotalValue = () => {
    return selectedProjects.reduce((total, projectId) => {
      const project = projects.find(p => p.id === projectId);
      return total + (project?.budget_allocated || 0);
    }, 0);
  };

  const filteredProjects = projects.filter(project => {
    const score = calculateProjectScore(project) * 100;
    const budget = project.budget_allocated || 0;
    
    return (
      (!filters.name || project.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.status || project.status === filters.status) &&
      (!filters.minScore || score >= Number(filters.minScore)) &&
      (!filters.maxScore || score <= Number(filters.maxScore)) &&
      (!filters.minBudget || budget >= Number(filters.minBudget)) &&
      (!filters.maxBudget || budget <= Number(filters.maxBudget))
    );
  });

  const calculateAverageODSScore = (projectIds) => {
    const selectedProjs = projectIds.map(id => projects.find(p => p.id === id)).filter(Boolean);
    if (!selectedProjs.length) return 0;
    return selectedProjs.reduce((acc, proj) => acc + calculateProjectScore(proj), 0) / selectedProjs.length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {error}
        <button 
          onClick={fetchBonds}
          className="ml-4 text-blue-500 hover:text-blue-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Relacionamentos entre Títulos e Projetos</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 text-white rounded-md flex items-center gap-2 hover:opacity-90"
          style={{ backgroundColor: buttonColor || '#3B82F6' }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v16m8-8H4" 
            />
          </svg>
          Novo Relacionamento
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">Filtrar Relacionamentos</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nome do Título</label>
            <input
              type="text"
              value={cardFilters.bondName}
              onChange={(e) => setCardFilters(prev => ({ ...prev, bondName: e.target.value }))}
              className="w-full p-2 border rounded"
              placeholder="Buscar..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Qtd. Projetos</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={cardFilters.minProjects}
                onChange={(e) => setCardFilters(prev => ({ ...prev, minProjects: e.target.value }))}
                className="w-1/2 p-2 border rounded"
                placeholder="Min"
              />
              <input
                type="number"
                value={cardFilters.maxProjects}
                onChange={(e) => setCardFilters(prev => ({ ...prev, maxProjects: e.target.value }))}
                className="w-1/2 p-2 border rounded"
                placeholder="Max"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Orçamento Total</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={cardFilters.minBudget}
                onChange={(e) => setCardFilters(prev => ({ ...prev, minBudget: e.target.value }))}
                className="w-1/2 p-2 border rounded"
                placeholder="Min"
              />
              <input
                type="number"
                value={cardFilters.maxBudget}
                onChange={(e) => setCardFilters(prev => ({ ...prev, maxBudget: e.target.value }))}
                className="w-1/2 p-2 border rounded"
                placeholder="Max"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bonds
          .filter(bond => {
            const projectIds = bondProjects[bond.id] || [];
            const totalBudget = projectIds.reduce((total, projectId) => {
              const project = projects.find(p => p.id === projectId);
              return total + (project?.budget_allocated || 0);
            }, 0);

            return (
              (!cardFilters.bondName || bond.name.toLowerCase().includes(cardFilters.bondName.toLowerCase())) &&
              (!cardFilters.minProjects || projectIds.length >= Number(cardFilters.minProjects)) &&
              (!cardFilters.maxProjects || projectIds.length <= Number(cardFilters.maxProjects)) &&
              (!cardFilters.minBudget || totalBudget >= Number(cardFilters.minBudget)) &&
              (!cardFilters.maxBudget || totalBudget <= Number(cardFilters.maxBudget))
            );
          })
          .map(bond => {
            const projectIds = bondProjects[bond.id] || [];
            const totalBudget = projectIds.reduce((total, projectId) => {
              const project = projects.find(p => p.id === projectId);
              return total + (project?.budget_allocated || 0);
            }, 0);
            const averageODS = calculateAverageODSScore(projectIds);

            return (
              <div key={bond.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{bond.name}</h3>
                    <p className="text-sm text-gray-500">{bond.type}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBond(bond.id);
                      setSelectedProjects(projectIds);
                      setIsCreating(true);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor Total:</span>
                    <span className="font-medium">{formatCurrency(totalBudget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Score ODS Médio:</span>
                    <span className="font-medium">{(averageODS * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Projetos Vinculados:</span>
                    <span className="font-medium">{projectIds.length}</span>
                  </div>
                </div>

                {projectIds.length > 0 && (
                  <div className="mt-4 border-t pt-3">
                    <p className="text-sm font-medium text-gray-600 mb-2">Projetos:</p>
                    <div className="space-y-2">
                      {projectIds.slice(0, 3).map(projectId => {
                        const project = projects.find(p => p.id === projectId);
                        return project ? (
                          <div key={projectId} className="flex items-center text-sm">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            {project.name}
                          </div>
                        ) : null;
                      })}
                      {projectIds.length > 3 && (
                        <p className="text-sm text-blue-500">
                          + {projectIds.length - 3} outros projetos
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {selectedBond ? 'Editar Relacionamento' : 'Novo Relacionamento'}
                </h3>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedBond('');
                    setSelectedProjects([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione um Título
                </label>
                <select
                  value={selectedBond}
                  onChange={(e) => handleBondSelect(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Selecione...</option>
                  {bonds.map(bond => (
                    <option key={bond.id} value={bond.id}>
                      {bond.name} - {bond.type}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBond && (
                <div className="space-y-4">
                  <h4 className="font-medium">Selecione os Projetos</h4>
                  <div className="border rounded-md divide-y">
                    {filteredProjects.map(project => (
                      <div key={project.id} className="p-3 flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project.id)}
                          onChange={() => handleProjectSelect(project.id)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-gray-500">{project.description}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          Score: {(calculateProjectScore(project) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedBond('');
                    setSelectedProjects([]);
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 text-white rounded-md"
                  style={{ backgroundColor: buttonColor || '#3B82F6' }}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BondProjectRelation;