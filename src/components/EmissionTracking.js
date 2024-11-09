import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { API_URL } from '../config';

function EmissionTracking({ sidebarColor, buttonColor }) {
  const [emissions, setEmissions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmission, setEditingEmission] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [emissionsPerPage] = useState(12);

  const [newEmission, setNewEmission] = useState({
    company_id: '',
    scope: '',
    emission_type: '',
    value: 0,
    unit: '',
    source: '',
    calculation_method: '',
    uncertainty_level: null,
    timestamp: new Date().toISOString(),
    calculated_emission: false,
    reporting_standard: ''
  });

  const emissionTypes = [
    "Emissões Diretas",
    "Emissões Indiretas",
    "Outras Emissões"
  ];

  const emissionStatus = [
    "Em Medição",
    "Verificado",
    "Em Revisão",
    "Finalizado"
  ];

  useEffect(() => {
    fetchEmissions();
    fetchCompanies();
  }, []);

  const fetchEmissions = async () => {
    try {
      const response = await axios.get(`${API_URL}/emissions`);
      setEmissions(response.data);
    } catch (error) {
      console.error('Erro ao buscar emissões:', error);
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

  const resetForm = () => {
    setNewEmission({
      company_id: '',
      scope: '',
      emission_type: '',
      value: 0,
      unit: '',
      source: '',
      calculation_method: '',
      uncertainty_level: null,
      timestamp: new Date().toISOString(),
      calculated_emission: false,
      reporting_standard: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Dados originais:', newEmission);

      if (!emissionTypes.includes(newEmission.emission_type)) {
        throw new Error('Tipo de emissão inválido. Selecione uma das opções disponíveis.');
      }

      if (!emissionStatus.includes(newEmission.status)) {
        throw new Error('Status inválido. Selecione uma das opções disponíveis.');
      }

      const formattedData = {
        company_id: parseInt(newEmission.company_id),
        scope: String(newEmission.scope).trim(),
        emission_type: String(newEmission.emission_type).trim(),
        status: String(newEmission.status).trim(),
        value: parseFloat(newEmission.value),
        unit: String(newEmission.unit).trim(),
        source: String(newEmission.source).trim(),
        calculation_method: String(newEmission.calculation_method).trim(),
        uncertainty_level: parseFloat(newEmission.uncertainty_level) || 0,
        timestamp: new Date(newEmission.timestamp).toISOString(),
        calculated_emission: Boolean(newEmission.calculated_emission),
        reporting_standard: String(newEmission.reporting_standard).trim()
      };

      console.log('Dados formatados:', formattedData);

      if (!formattedData.company_id || isNaN(formattedData.company_id)) {
        throw new Error('Empresa inválida');
      }
      if (!formattedData.scope) {
        throw new Error('Escopo é obrigatório');
      }
      if (!formattedData.emission_type) {
        throw new Error('Tipo de emissão é obrigatório');
      }
      if (!formattedData.status) {
        throw new Error('Status é obrigatório');
      }
      if (isNaN(formattedData.value) || formattedData.value < 0) {
        throw new Error('Valor inválido');
      }
      if (!formattedData.unit) {
        throw new Error('Unidade é obrigatória');
      }
      if (!formattedData.source) {
        throw new Error('Fonte é obrigatória');
      }
      if (!formattedData.calculation_method) {
        throw new Error('Método de cálculo é obrigatório');
      }
      if (!formattedData.reporting_standard) {
        throw new Error('Padrão de relatório é obrigatório');
      }

      if (!emissionTypes.includes(formattedData.emission_type)) {
        throw new Error('Tipo de emissão inválido');
      }

      if (!emissionStatus.includes(formattedData.status)) {
        throw new Error('Status inválido');
      }

      if (editingEmission) {
        await axios.put(`${API_URL}/emissions/${editingEmission.id}`, formattedData);
        alert('Registro atualizado com sucesso!');
      } else {
        const response = await axios.post(`${API_URL}/emissions`, formattedData);
        console.log('Resposta da API:', response.data);
        alert('Registro criado com sucesso!');
      }
      fetchEmissions();
      setIsFormOpen(false);
      setEditingEmission(null);
      resetForm();
    } catch (error) {
      console.error('Erro completo:', error);
      console.error('Dados que causaram erro:', newEmission);
      
      if (error.response?.status === 422) {
        alert('Erro de validação: Verifique se todos os campos estão preenchidos corretamente');
      } else if (error.message.includes('Tipo de emissão')) {
        alert(error.message);
      } else if (error.message.includes('Status')) {
        alert(error.message);
      } else {
        alert(error.response?.data?.detail || error.message || 'Erro ao salvar registro');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (emission) => {
    setEditingEmission(emission);
    setNewEmission(emission);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await axios.delete(`${API_URL}/emissions/${id}`);
        alert('Registro excluído com sucesso!');
        fetchEmissions();
      } catch (error) {
        console.error('Erro ao excluir registro:', error);
        alert('Erro ao excluir registro. Por favor, tente novamente.');
      }
    }
  };

  // Paginação
  const indexOfLastEmission = currentPage * emissionsPerPage;
  const indexOfFirstEmission = indexOfLastEmission - emissionsPerPage;
  const currentEmissions = emissions.slice(indexOfFirstEmission, indexOfLastEmission);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Filtragem e Busca
  const filteredEmissions = emissions.filter(emission => {
    return (
      companies.find(c => c.id === emission.company_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emission.emission_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const renderForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {editingEmission ? 'Editar Registro' : 'Novo Registro'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa
            </label>
            <select
              name="company_id"
              value={newEmission.company_id}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Escopo
            </label>
            <select
              name="scope"
              value={newEmission.scope}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">Selecione o Escopo</option>
              <option value="Escopo 1">Escopo 1</option>
              <option value="Escopo 2">Escopo 2</option>
              <option value="Escopo 3">Escopo 3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Emissão
            </label>
            <select
              name="emission_type"
              value={newEmission.emission_type}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">Selecione o Tipo</option>
              <option value="Emissões Diretas">Emissões Diretas</option>
              <option value="Emissões Indiretas">Emissões Indiretas</option>
              <option value="Outras Emissões">Outras Emissões</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={newEmission.status}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">Selecione o Status</option>
              {emissionStatus.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor
            </label>
            <input
              type="number"
              name="value"
              value={newEmission.value}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidade
            </label>
            <input
              type="text"
              name="unit"
              value={newEmission.unit}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fonte
            </label>
            <input
              type="text"
              name="source"
              value={newEmission.source}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Cálculo
            </label>
            <input
              type="text"
              name="calculation_method"
              value={newEmission.calculation_method}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nível de Incerteza (%)
            </label>
            <input
              type="number"
              name="uncertainty_level"
              value={newEmission.uncertainty_level}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data e Hora
            </label>
            <input
              type="datetime-local"
              name="timestamp"
              value={newEmission.timestamp}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Padrão de Relatório
            </label>
            <input
              type="text"
              name="reporting_standard"
              value={newEmission.reporting_standard}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emissão Calculada
            </label>
            <input
              type="checkbox"
              name="calculated_emission"
              checked={newEmission.calculated_emission}
              onChange={(e) => handleInputChange({
                target: {
                  name: 'calculated_emission',
                  value: e.target.checked
                }
              })}
              className="p-2 border rounded"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="submit"
            className="px-4 py-2 text-white rounded"
            style={{ backgroundColor: buttonColor }}
            disabled={loading}
          >
            {loading ? 'Salvando...' : (editingEmission ? 'Atualizar' : 'Criar')}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsFormOpen(false);
              setEditingEmission(null);
              setNewEmission({
                company_id: '',
                scope: '',
                emission_type: '',
                value: 0,
                unit: '',
                source: '',
                calculation_method: '',
                uncertainty_level: null,
                timestamp: new Date().toISOString(),
                calculated_emission: false,
                reporting_standard: ''
              });
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmission(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dados de Emissões</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 text-white rounded flex items-center"
          style={{ backgroundColor: buttonColor }}
        >
          <FaPlus className="mr-2" /> Novo Registro
        </button>
      </div>

      {/* Barra de pesquisa */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar emissões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded pl-10"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {isFormOpen && renderForm()}

      {/* Tabela de emissões */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Nome</th>
              <th className="px-4 py-2 border">Empresa</th>
              <th className="px-4 py-2 border">Tipo</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Valor</th>
              <th className="px-4 py-2 border">Unidade</th>
              <th className="px-4 py-2 border">Data de Medição</th>
              <th className="px-4 py-2 border">Meta de Redução</th>
              <th className="px-4 py-2 border">Redução Atual</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentEmissions.map(emission => (
              <tr key={emission.id}>
                <td className="px-4 py-2 border">
                  {companies.find(c => c.id === emission.company_id)?.name || 'N/A'}
                </td>
                <td className="px-4 py-2 border">{emission.scope}</td>
                <td className="px-4 py-2 border">
                  {emission.emission_type || 'N/A'}
                </td>
                <td className="px-4 py-2 border">
                  {emission.status || 'N/A'}
                </td>
                <td className="px-4 py-2 border">{emission.value}</td>
                <td className="px-4 py-2 border">{emission.unit}</td>
                <td className="px-4 py-2 border">
                  {new Date(emission.timestamp).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-2 border">{emission.source}</td>
                <td className="px-4 py-2 border">{emission.calculation_method}</td>
                <td className="px-4 py-2 border">{emission.uncertainty_level}%</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleEdit(emission)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(emission.id)}
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
        {Array.from({ length: Math.ceil(filteredEmissions.length / emissionsPerPage) }, (_, i) => (
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

export default EmissionTracking;