import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSearch, FaFilter, FaCopy } from 'react-icons/fa';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [kpisPerPage] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const matchesSearch = kpi.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          kpi.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          kpi.kpicode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      if (key === 'compliance') {
        return kpi[key] && kpi[key].some(item => item.toLowerCase().includes(filters[key].toLowerCase()));
      }
      return kpi[key]?.toString().toLowerCase().includes(filters[key].toLowerCase());
    });

    return matchesSearch && matchesFilters;
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
        <label className="block mb-2">Nome</label>
        <input
          type="text"
          name="name"
          value={kpi.name}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-2">Unidade</label>
        <select
          name="unit"
          value={kpi.unit}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione uma unidade</option>
          {units.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-2">Categoria</label>
        <select
          name="category"
          value={kpi.category}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="environment">Ambiente</option>
          <option value="social">Social</option>
          <option value="governance">Governança</option>
        </select>
      </div>
      <div>
        <label className="block mb-2">Subcategoria</label>
        <select
          name="subcategory"
          value={kpi.subcategory}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione uma subcategoria</option>
          {subcategories[kpi.category]?.map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
      </div>
      <div className="col-span-2">
        <label className="block mb-2">Descrição</label>
        <textarea
          name="description"
          value={kpi.description}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          rows="3"
        ></textarea>
      </div>
      <div>
        <label className="block mb-2">Frequência</label>
        <select
          name="frequency"
          value={kpi.frequency}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione uma frequência</option>
          {frequencies.map(freq => (
            <option key={freq} value={freq}>{freq}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-2">Método de Coleta</label>
        <select
          name="collection_method"
          value={kpi.collection_method}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione um método</option>
          {collectionMethods.map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-2">Código KPI</label>
        <input
          type="text"
          name="kpicode"
          value={kpi.kpicode}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-2">Categoria da Empresa</label>
        <input
          type="text"
          name="company_category"
          value={kpi.company_category}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-2">Gênero</label>
        <select
          name="genero"
          value={kpi.genero}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione um gênero</option>
          {genderOptions.map(gender => (
            <option key={gender} value={gender}>{gender}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-2">Raça</label>
        <select
          name="raca"
          value={kpi.raca}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione uma raça</option>
          {raceOptions.map(race => (
            <option key={race} value={race}>{race}</option>
          ))}
        </select>
      </div>
      <div className="col-span-2">
        <label className="block mb-2">Compliance</label>
        <MultiSelect
          options={complianceOptions}
          value={kpi.compliance.map(c => ({ label: complianceFullNames[c], value: c }))}
          onChange={handleComplianceChange}
          labelledBy="Selecione"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Gerenciamento de Templates de KPI</h2>
      
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => setIsAddingKPI(!isAddingKPI)} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          style={{ backgroundColor: buttonColor }}
        >
          {isAddingKPI ? 'Cancelar' : 'Adicionar Novo KPI'}
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar KPIs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 pl-8 border rounded"
          />
          <FaSearch className="absolute left-2 top-3 text-gray-400" />
        </div>
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

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">{renderColumnFilter('name')}</th>
                  <th className="px-4 py-2 border">{renderColumnFilter('category')}</th>
                  <th className="px-4 py-2 border">{renderColumnFilter('unit')}</th>
                  <th className="px-4 py-2 border">{renderColumnFilter('frequency')}</th>
                  <th className="px-4 py-2 border">{renderColumnFilter('kpicode')}</th>
                  <th className="px-4 py-2 border">{renderColumnFilter('compliance')}</th>
                  <th className="px-4 py-2 border">{renderColumnFilter('genero')}</th>
                  <th className="px-4 py-2 border">{renderColumnFilter('raca')}</th>
                  <th className="px-4 py-2 border">Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentKPIs.map((kpi) => (
                  <tr key={kpi.id}>
                    <td className="px-4 py-2 border">{kpi.name}</td>
                    <td className="px-4 py-2 border capitalize">{kpi.category}</td>
                    <td className="px-4 py-2 border">{kpi.unit}</td>
                    <td className="px-4 py-2 border">{kpi.frequency}</td>
                    <td className="px-4 py-2 border">{kpi.kpicode}</td>
                    <td className="px-4 py-2 border">{kpi.compliance && kpi.compliance.map(item => complianceFullNames[item] || item).join(', ')}</td>
                    <td className="px-4 py-2 border">{kpi.genero}</td>
                    <td className="px-4 py-2 border">{kpi.raca}</td>
                    <td className="px-4 py-2 border">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="flex justify-center mt-4">
            {Array.from({ length: Math.ceil(filteredAndSearchedKPIs.length / kpisPerPage) }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`mx-1 px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default KPITemplate;
