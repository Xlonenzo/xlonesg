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
    name: '',
    emission_type: '',
    measurement_date: '',
    value: 0,
    unit: '',
    source: '',
    status: '',
    reduction_target: null,
    actual_reduction: null,
    notes: '',
    company_id: ''
  });

  const emissionTypes = [
    { id: 1, name: "Escopo 1 - Emissões Diretas" },
    { id: 2, name: "Escopo 2 - Emissões Indiretas" },
    { id: 3, name: "Escopo 3 - Outras Emissões" }
  ];

  const emissionStatus = [
    { id: 1, name: "Em Medição" },
    { id: 2, name: "Verificado" },
    { id: 3, name: "Em Revisão" },
    { id: 4, name: "Finalizado" }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingEmission) {
        await axios.put(`${API_URL}/emissions/${editingEmission.id}`, newEmission);
        alert('Registro atualizado com sucesso!');
      } else {
        await axios.post(`${API_URL}/emissions`, newEmission);
        alert('Registro criado com sucesso!');
      }
      fetchEmissions();
      setIsFormOpen(false);
      setEditingEmission(null);
      setNewEmission({
        name: '',
        emission_type: '',
        measurement_date: '',
        value: 0,
        unit: '',
        source: '',
        status: '',
        reduction_target: null,
        actual_reduction: null,
        notes: '',
        company_id: ''
      });
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      alert('Erro ao salvar registro. Por favor, tente novamente.');
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
    return emission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           emission.emission_type.toLowerCase().includes(searchTerm.toLowerCase());
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
              Nome do Registro
            </label>
            <input
              type="text"
              name="name"
              value={newEmission.name}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>

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
              {emissionTypes.map(type => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
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
                <option key={status.id} value={status.name}>
                  {status.name}
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
              Data de Medição
            </label>
            <input
              type="date"
              name="measurement_date"
              value={newEmission.measurement_date}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta de Redução (%)
            </label>
            <input
              type="number"
              name="reduction_target"
              value={newEmission.reduction_target || ''}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Redução Atual (%)
            </label>
            <input
              type="number"
              name="actual_reduction"
              value={newEmission.actual_reduction || ''}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            name="notes"
            value={newEmission.notes || ''}
            onChange={handleInputChange}
            className="p-2 border rounded w-full"
            rows="3"
          />
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
                name: '',
                emission_type: '',
                measurement_date: '',
                value: 0,
                unit: '',
                source: '',
                status: '',
                reduction_target: null,
                actual_reduction: null,
                notes: '',
                company_id: ''
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
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentEmissions.map(emission => {
              const company = companies.find(c => c.id === emission.company_id);
              return (
                <tr key={emission.id}>
                  <td className="px-4 py-2 border">{emission.name}</td>
                  <td className="px-4 py-2 border">{company?.name || 'N/A'}</td>
                  <td className="px-4 py-2 border">{emission.emission_type}</td>
                  <td className="px-4 py-2 border">{emission.status}</td>
                  <td className="px-4 py-2 border">{emission.value}</td>
                  <td className="px-4 py-2 border">{emission.unit}</td>
                  <td className="px-4 py-2 border">
                    {new Date(emission.measurement_date).toLocaleDateString()}
                  </td>
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
              );
            })}
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

      {isFormOpen && renderForm()}
    </div>
  );
}

export default EmissionTracking;