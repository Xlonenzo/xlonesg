import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaFilter, FaChevronUp, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL } from '../config';

const Investment = ({ sidebarColor, buttonColor }) => {
  const [investments, setInvestments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [investmentsPerPage] = useState(10);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filters, setFilters] = useState({
    company: '',
    type: '',
    impact: ''
  });

  const [newInvestment, setNewInvestment] = useState({
    company_id: '',
    investment_type: '',
    amount_invested: 0,
    currency: '',
    investment_date: '',
    expected_roi: 0,
    actual_roi: 0,
    impact_measured: '',
    last_assessment_date: new Date().toISOString().split('T')[0]
  });

  const investmentTypes = [
    "Projeto Verde",
    "Tecnologia Sustentável",
    "Energia Renovável",
    "Eficiência Energética",
    "Gestão de Resíduos",
    "Conservação Ambiental"
  ];

  useEffect(() => {
    fetchInvestments();
    fetchCompanies();
  }, []);

  const fetchInvestments = async () => {
    try {
      const response = await axios.get(`${API_URL}/investments`);
      setInvestments(response.data);
    } catch (error) {
      console.error('Erro ao buscar investimentos:', error);
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
      // Lista de campos obrigatórios
      const requiredFields = [
        'company_id',
        'investment_type',
        'amount_invested',
        'currency',
        'investment_date',
        'expected_roi',
        'actual_roi',
        'impact_measured',
        'last_assessment_date'
      ];

      // Verificar campos vazios
      const missingFields = requiredFields.filter(field => !newInvestment[field]);
      
      if (missingFields.length > 0) {
        alert(`Por favor, preencha todos os campos obrigatórios: ${missingFields.join(', ')}`);
        return;
      }

      if (editingInvestment) {
        await axios.put(`${API_URL}/investments/${editingInvestment.id}`, newInvestment);
      } else {
        await axios.post(`${API_URL}/investments`, newInvestment);
      }
      fetchInvestments();
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar investimento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (investment) => {
    setEditingInvestment(investment);
    setNewInvestment({
      company_id: investment.company_id,
      investment_type: investment.investment_type,
      amount_invested: investment.amount_invested,
      currency: investment.currency,
      investment_date: investment.investment_date,
      expected_roi: investment.expected_roi,
      actual_roi: investment.actual_roi,
      impact_measured: investment.impact_measured,
      last_assessment_date: investment.last_assessment_date
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este investimento?')) {
      try {
        await axios.delete(`${API_URL}/investments/${id}`);
        fetchInvestments();
      } catch (error) {
        console.error('Erro ao excluir investimento:', error);
      }
    }
  };

  const resetForm = () => {
    setNewInvestment({
      company_id: '',
      investment_type: '',
      amount_invested: 0,
      currency: '',
      investment_date: '',
      expected_roi: 0,
      actual_roi: 0,
      impact_measured: '',
      last_assessment_date: new Date().toISOString().split('T')[0]
    });
    setEditingInvestment(null);
  };

  // Filtrar e paginar investimentos
  const filteredInvestments = investments.filter(investment =>
    (!filters.company || companies.find(c => c.id === investment.company_id)?.name.toLowerCase().includes(filters.company.toLowerCase())) &&
    (!filters.type || investment.investment_type.toLowerCase().includes(filters.type.toLowerCase())) &&
    (!filters.impact || investment.impact_measured.toLowerCase().includes(filters.impact.toLowerCase()))
  );

  const indexOfLastInvestment = currentPage * investmentsPerPage;
  const indexOfFirstInvestment = indexOfLastInvestment - investmentsPerPage;
  const currentInvestments = filteredInvestments.slice(indexOfFirstInvestment, indexOfLastInvestment);

  // Adicionar paginação
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestão de Investimentos ESG</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 rounded"
          style={{ backgroundColor: buttonColor, color: 'white' }}
        >
          <FaPlus className="inline mr-2" /> Novo Investimento
        </button>
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Empresa</label>
              <input
                type="text"
                value={filters.company}
                onChange={(e) => setFilters(prev => ({...prev, company: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                placeholder="Filtrar por empresa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Investimento</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({...prev, type: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
              >
                <option value="">Todos</option>
                {investmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Impacto</label>
              <input
                type="text"
                value={filters.impact}
                onChange={(e) => setFilters(prev => ({...prev, impact: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                placeholder="Filtrar por impacto"
              />
            </div>
          </div>
        )}
      </div>

      {/* Formulário completo */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">
                <div className="flex items-center">
                  Empresa
                  <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </div>
              </label>
              <select
                value={newInvestment.company_id}
                onChange={(e) => setNewInvestment({...newInvestment, company_id: e.target.value})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione uma empresa</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">
                <div className="flex items-center">
                  Tipo de Investimento
                  <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </div>
              </label>
              <select
                value={newInvestment.investment_type}
                onChange={(e) => setNewInvestment({...newInvestment, investment_type: e.target.value})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione o tipo</option>
                {investmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">
                <div className="flex items-center">
                  Valor Investido
                  <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </div>
              </label>
              <input
                type="number"
                value={newInvestment.amount_invested}
                onChange={(e) => setNewInvestment({...newInvestment, amount_invested: parseFloat(e.target.value)})}
                className="w-full p-2 border rounded"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block mb-2">
                <div className="flex items-center">
                  Moeda
                  <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </div>
              </label>
              <select
                value={newInvestment.currency}
                onChange={(e) => setNewInvestment({...newInvestment, currency: e.target.value})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione a moeda</option>
                <option value="BRL">Real (BRL)</option>
                <option value="USD">Dólar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">
                <div className="flex items-center">
                  Data do Investimento
                  <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </div>
              </label>
              <input
                type="date"
                value={newInvestment.investment_date}
                onChange={(e) => setNewInvestment({...newInvestment, investment_date: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">
                <div className="flex items-center">
                  ROI Esperado (%)
                  <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </div>
              </label>
              <input
                type="number"
                value={newInvestment.expected_roi}
                onChange={(e) => setNewInvestment({...newInvestment, expected_roi: parseFloat(e.target.value)})}
                className="w-full p-2 border rounded"
                required
                step="0.01"
              />
            </div>

            <div>
              <label className="block mb-2">
                <div className="flex items-center">
                  ROI Atual (%)
                  <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </div>
              </label>
              <input
                type="number"
                value={newInvestment.actual_roi}
                onChange={(e) => setNewInvestment({...newInvestment, actual_roi: parseFloat(e.target.value)})}
                className="w-full p-2 border rounded"
                step="0.01"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-2">
                <div className="flex items-center">
                  Impacto Medido
                  <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </div>
              </label>
              <textarea
                value={newInvestment.impact_measured}
                onChange={(e) => setNewInvestment({...newInvestment, impact_measured: e.target.value})}
                className="w-full p-2 border rounded"
                rows="3"
                required
              />
            </div>

            <div>
              <label className="block mb-2">
                <div className="flex items-center">
                  Data da Última Avaliação
                  <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </div>
              </label>
              <input
                type="date"
                value={newInvestment.last_assessment_date}
                onChange={(e) => setNewInvestment({...newInvestment, last_assessment_date: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
              className="px-4 py-2 mr-2 rounded bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded text-white"
              style={{ backgroundColor: buttonColor }}
              disabled={loading}
            >
              {loading ? 'Salvando...' : editingInvestment ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Empresa
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Tipo
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Valor
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                ROI Esperado
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                ROI Atual
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Impacto Medido
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
            {currentInvestments.map(investment => (
              <tr key={investment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">
                    {companies.find(c => c.id === investment.company_id)?.name}
                  </div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{investment.investment_type}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: investment.currency 
                    }).format(investment.amount_invested)}
                  </div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{investment.expected_roi}%</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{investment.actual_roi}%</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{investment.impact_measured}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleEdit(investment)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(investment.id)}
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
            disabled={currentPage === Math.ceil(filteredInvestments.length / investmentsPerPage)}
            className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === Math.ceil(filteredInvestments.length / investmentsPerPage)
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
              Mostrando <span className="font-medium">{indexOfFirstInvestment + 1}</span> até{' '}
              <span className="font-medium">
                {Math.min(indexOfLastInvestment, filteredInvestments.length)}
              </span>{' '}
              de <span className="font-medium">{filteredInvestments.length}</span> resultados
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
                { length: Math.ceil(filteredInvestments.length / investmentsPerPage) },
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
                disabled={currentPage === Math.ceil(filteredInvestments.length / investmentsPerPage)}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  currentPage === Math.ceil(filteredInvestments.length / investmentsPerPage)
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

export default Investment; 