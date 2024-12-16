import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaFilter, FaCopy, FaExclamationCircle, FaPlus, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { MultiSelect } from "react-multi-select-component";
import { API_URL } from '../config';

function KPITemplate({ sidebarColor, buttonColor }) {
  const [kpis, setKpis] = useState([]);
  const [isAddingKPI, setIsAddingKPI] = useState(false);
  const [editingKPI, setEditingKPI] = useState(null);
  const [newKPI, setNewKPI] = useState({
    name: '',
    unit: '',
    category: 'environment',
    subcategory: '',
    description: '',
    frequency: '',
    collection_method: '',
    kpicode: '',
    company_category: '',
    compliance: [],
    genero: '',
    raca: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [kpisPerPage] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const units = [
    'kg', 'ton', 'm³', 'kWh', '%', '€', '$', 'unidades', 'tCO2e', 'MWh', 
    'hectares', 'kgCO2e/€', 'kWh/m²', 'kgCO2e/unidade', 'pontos', 'horas', 
    'taxa', 'unidade'
  ];
  const frequencies = ['Diária', 'Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual', 'Quadrimestral'];
  const collectionMethods = ['Manual', 'Automático', 'Semi-automático', 'Estimativa', 'Cálculo', 'Medição', 'Soma', 'Contagem', 'Média'];
  const subcategories = {
    environment: [
      'Mudanças climáticas',
      'Energia',
      'Água e recursos marinhos',
      'Uso de recursos e economia circular',
      'Poluição',
      'Biodiversidade e ecossistemas',
      'Conformidade ambiental'
    ],
    social: [
      'DEI (Diversidade, Equidade e Inclusão)',
      'Práticas Trabalhistas',
      'Saúde e Segurança',
      'Desenvolvimento de Capital Humano',
      'Relações com Clientes',
      'Impacto de Produtos e Serviços',
      'Direitos Humanos',
      'Desenvolvimento Comunitário'
    ],
    governance: [
      'Estrutura de Governança',
      'Diversidade e Inclusão',
      'Remuneração',
      'Ética e Integridade',
      'Transparência',
      'Gestão de Cadeia de Suprimentos',
      'Segurança de Dados',
      'Engajamento',
      'Gestão de Riscos'
    ]
  };

  const complianceOptions = [
    { label: "CSRD", value: "csrd" },
    { label: "IDiversa", value: "idiversa" },
    { label: "Social Bond Principles", value: "social_bond_principles" },
    { label: "Green Bond Principles", value: "green_bond_principles" },
  ];

  const complianceFullNames = {
    'csrd': 'CSRD',
    'idiversa': 'IDiversa',
    'social_bond_principles': 'Social Bond Principles',
    'green_bond_principles': 'Green Bond Principles'
  };

  // Adicione estas duas novas constantes
  const genderOptions = ['Masculino', 'Feminino', 'Outros', 'Não aplicável'];
  const raceOptions = ['Branco', 'Preto', 'Pardo', 'Amarela', 'Indígena', 'Outros', 'Não aplicável'];

  const [filters, setFilters] = useState({
    name: '',
    category: '',
    unit: '',
    frequency: '',
    kpicode: '',
    compliance: '',
    genero: '',
    raca: '',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredAndSearchedKPIs = kpis.filter(kpi => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      if (key === 'compliance') {
        return kpi[key] && kpi[key].some(item => 
          item.toLowerCase().includes(filters[key].toLowerCase())
        );
      }
      return kpi[key]?.toString().toLowerCase().includes(filters[key].toLowerCase());
    });
  });

  const renderColumnFilter = (columnName) => (
    <div className="flex items-center">
      <input
        type="text"
        name={columnName}
        value={filters[columnName]}
        onChange={handleFilterChange}
        className="w-full p-1 text-sm border rounded"
        placeholder={`Filtrar ${columnName}`}
      />
      <FaFilter className="ml-1 text-gray-500" />
    </div>
  );

  const fetchKPIs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/kpi-templates?limit=1000`);
      console.log('Número de KPIs recebidos:', response.data.length);
      setKpis(response.data);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar KPI Templates:', error);
      setError('Falha ao carregar os KPIs. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  // Calcular currentKPIs baseado nos KPIs filtrados e pesquisados
  const indexOfLastKPI = currentPage * kpisPerPage;
  const indexOfFirstKPI = indexOfLastKPI - kpisPerPage;
  const currentKPIs = filteredAndSearchedKPIs.slice(indexOfFirstKPI, indexOfLastKPI);

  // Atualizar a função de paginação
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingKPI) {
      setEditingKPI(prev => ({ ...prev, [name]: value }));
    } else {
      setNewKPI(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleComplianceChange = (selected) => {
    const complianceValues = selected.map(item => item.value);
    if (editingKPI) {
      setEditingKPI(prev => ({ ...prev, compliance: complianceValues }));
    } else {
      setNewKPI(prev => ({ ...prev, compliance: complianceValues }));
    }
  };

  const handleAddKPI = async () => {
    try {
      const response = await axios.post(`${API_URL}/kpi-templates`, newKPI);
      setKpis([...kpis, response.data]);
      setIsAddingKPI(false);
      setNewKPI({
        name: '',
        unit: '',
        category: 'environment',
        subcategory: '',
        description: '',
        frequency: '',
        collection_method: '',
        kpicode: '',
        company_category: '',
        compliance: [],
        genero: '',
        raca: '',
      });
    } catch (error) {
      console.error('Erro ao adicionar KPI Template:', error);
    }
  };

  const handleUpdateKPI = async () => {
    if (editingKPI) {
      try {
        const response = await axios.put(`${API_URL}/kpi-templates/${editingKPI.id}`, editingKPI);
        setKpis(prevKPIs => prevKPIs.map(kpi => (kpi.id === editingKPI.id ? response.data : kpi)));
        setEditingKPI(null);
      } catch (error) {
        console.error('Erro ao atualizar KPI Template:', error);
      }
    }
  };

  const handleDeleteKPI = async (id) => {
    if (window.confirm('Tem certeza de que deseja excluir este KPI Template?')) {
      try {
        await axios.delete(`${API_URL}/kpi-templates/${id}`);
        setKpis(prevKPIs => prevKPIs.filter(kpi => kpi.id !== id));
      } catch (error) {
        console.error('Erro ao excluir KPI Template:', error);
      }
    }
  };

  const handleDuplicate = async (kpi) => {
    try {
      const duplicatedKPI = {
        ...kpi,
        id: undefined,
        name: `${kpi.name} (Cópia)`,
        kpicode: '',
        compliance: [...kpi.compliance]
      };
      const response = await axios.post(`${API_URL}/kpi-templates`, duplicatedKPI);
      const newKPI = response.data;
      setKpis([...kpis, newKPI]);
      setEditingKPI(newKPI);
      alert('KPI Template duplicado com sucesso! Por favor, insira um novo código para o KPI.');
    } catch (error) {
      console.error('Erro ao duplicar KPI Template:', error);
      alert('Erro ao duplicar KPI Template. Por favor, tente novamente.');
    }
  };

  const renderKPIForm = (kpi, isAdding) => (
    <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block mb-2 flex items-center">
                Nome
                <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </label>
            <input
                type="text"
                name="name"
                value={kpi.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
            />
        </div>

        <div>
            <label className="block mb-2 flex items-center">
                Unidade
                <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </label>
            <select
                name="unit"
                value={kpi.unit}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
            >
                <option value="">Selecione uma unidade</option>
                {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                ))}
            </select>
        </div>

        <div>
            <label className="block mb-2 flex items-center">
                Categoria
                <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </label>
            <select
                name="category"
                value={kpi.category}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
            >
                <option value="environment">Ambiente</option>
                <option value="social">Social</option>
                <option value="governance">Governança</option>
            </select>
        </div>

        <div>
            <label className="block mb-2 flex items-center">
                Subcategoria
                <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </label>
            <select
                name="subcategory"
                value={kpi.subcategory}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
            >
                <option value="">Selecione uma subcategoria</option>
                {subcategories[kpi.category]?.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                ))}
            </select>
        </div>

        <div className="col-span-2">
            <label className="block mb-2 flex items-center">
                Descrição
                <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </label>
            <textarea
                name="description"
                value={kpi.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows="3"
                required
            ></textarea>
        </div>

        <div>
            <label className="block mb-2 flex items-center">
                Frequência
                <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </label>
            <select
                name="frequency"
                value={kpi.frequency}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
            >
                <option value="">Selecione uma frequência</option>
                {frequencies.map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
                ))}
            </select>
        </div>

        <div>
            <label className="block mb-2 flex items-center">
                Método de Coleta
                <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </label>
            <select
                name="collection_method"
                value={kpi.collection_method}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
            >
                <option value="">Selecione um método</option>
                {collectionMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                ))}
            </select>
        </div>

        <div>
            <label className="block mb-2 flex items-center">
                Código KPI
                <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </label>
            <input
                type="text"
                name="kpicode"
                value={kpi.kpicode}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
            />
        </div>

        <div>
            <label className="block mb-2 flex items-center">
                Categoria da Empresa
                <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </label>
            <input
                type="text"
                name="company_category"
                value={kpi.company_category}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
            />
        </div>

        <div>
            <label className="block mb-2 flex items-center">
                Gênero
                <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </label>
            <select
                name="genero"
                value={kpi.genero}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
            >
                <option value="">Selecione um gênero</option>
                {genderOptions.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                ))}
            </select>
        </div>

        <div>
            <label className="block mb-2 flex items-center">
                Raça
                <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </label>
            <select
                name="raca"
                value={kpi.raca}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
            >
                <option value="">Selecione uma raça</option>
                {raceOptions.map(race => (
                    <option key={race} value={race}>{race}</option>
                ))}
            </select>
        </div>

        <div className="col-span-2">
            <label className="block mb-2 flex items-center">
                Compliance
                <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
            </label>
            <MultiSelect
                options={complianceOptions}
                value={kpi.compliance.map(c => ({ label: complianceFullNames[c], value: c }))}
                onChange={handleComplianceChange}
                labelledBy="Selecione"
                required
            />
        </div>
    </div>
  );

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium text-gray-800">Gerenciamento de Templates de KPI</h2>
        <button 
          onClick={() => setIsAddingKPI(!isAddingKPI)} 
          className="text-white px-4 py-2 rounded hover:opacity-80 transition-all flex items-center gap-2 text-sm"
          style={{ backgroundColor: buttonColor }}
        >
          <FaPlus size={16} />
          {isAddingKPI ? 'Cancelar' : 'Adicionar Novo KPI'}
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
                <label className="block text-sm font-medium text-gray-600 mb-2">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                  placeholder="Filtrar por nome..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Categoria</label>
                <input
                  type="text"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                  placeholder="Filtrar por categoria..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Unidade</label>
                <input
                  type="text"
                  name="unit"
                  value={filters.unit}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                  placeholder="Filtrar por unidade..."
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setFilters({
                  name: '',
                  category: '',
                  unit: '',
                  frequency: '',
                  kpicode: '',
                  compliance: '',
                  genero: '',
                  raca: '',
                })}
                className="px-4 py-2 text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {isLoading && <p>Carregando KPIs...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!isLoading && !error && (
        <>
          {(isAddingKPI || editingKPI) && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="text-lg font-bold mb-2">
                {isAddingKPI ? 'Adicionar Novo Template de KPI' : 'Editar Template de KPI'}
              </h3>
              {renderKPIForm(isAddingKPI ? newKPI : editingKPI, isAddingKPI)}
              <div className="mt-4 space-x-2">
                <button
                  onClick={isAddingKPI ? handleAddKPI : handleUpdateKPI}
                  className="text-white px-4 py-2 rounded hover:opacity-80"
                  style={{ backgroundColor: buttonColor }}
                >
                  {isAddingKPI ? 'Adicionar' : 'Atualizar'}
                </button>
                <button
                  onClick={() => {
                    setIsAddingKPI(false);
                    setEditingKPI(null);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
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
                    Categoria
                  </th>
                  <th 
                    className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                    style={{ backgroundColor: `${buttonColor}15` }}
                  >
                    Unidade
                  </th>
                  <th 
                    className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                    style={{ backgroundColor: `${buttonColor}15` }}
                  >
                    Frequência
                  </th>
                  <th 
                    className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                    style={{ backgroundColor: `${buttonColor}15` }}
                  >
                    Código KPI
                  </th>
                  <th 
                    className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                    style={{ backgroundColor: `${buttonColor}15` }}
                  >
                    Compliance
                  </th>
                  <th 
                    className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                    style={{ backgroundColor: `${buttonColor}15` }}
                  >
                    Gênero
                  </th>
                  <th 
                    className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                    style={{ backgroundColor: `${buttonColor}15` }}
                  >
                    Raça
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
                {currentKPIs.map((kpi) => (
                  <tr key={kpi.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                      <div className="text-sm text-gray-900">{kpi.name}</div>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                      <div className="text-sm text-gray-900 capitalize">{kpi.category}</div>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                      <div className="text-sm text-gray-900">{kpi.unit}</div>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                      <div className="text-sm text-gray-900">{kpi.frequency}</div>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                      <div className="text-sm text-gray-900">{kpi.kpicode}</div>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                      <div className="text-sm text-gray-900">
                        {kpi.compliance && kpi.compliance.map(item => complianceFullNames[item] || item).join(', ')}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                      <div className="text-sm text-gray-900">{kpi.genero}</div>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                      <div className="text-sm text-gray-900">{kpi.raca}</div>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setEditingKPI(kpi)}
                          className="text-blue-500 hover:text-blue-700 mr-2"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteKPI(kpi.id)}
                          className="text-red-500 hover:text-red-700 mr-2"
                        >
                          <FaTrash />
                        </button>
                        <button
                          onClick={() => handleDuplicate(kpi)}
                          className="text-green-500 hover:text-green-700"
                        >
                          <FaCopy />
                        </button>
                      </div>
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
                disabled={currentPage === Math.ceil(filteredAndSearchedKPIs.length / kpisPerPage)}
                className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                  currentPage === Math.ceil(filteredAndSearchedKPIs.length / kpisPerPage)
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
                  Mostrando <span className="font-medium">{indexOfFirstKPI + 1}</span> até{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastKPI, filteredAndSearchedKPIs.length)}
                  </span>{' '}
                  de <span className="font-medium">{filteredAndSearchedKPIs.length}</span> resultados
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
                    { length: Math.ceil(filteredAndSearchedKPIs.length / kpisPerPage) },
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
                    disabled={currentPage === Math.ceil(filteredAndSearchedKPIs.length / kpisPerPage)}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                      currentPage === Math.ceil(filteredAndSearchedKPIs.length / kpisPerPage)
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
        </>
      )}
    </div>
  );
}

export default KPITemplate;
