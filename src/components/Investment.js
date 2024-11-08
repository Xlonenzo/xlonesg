import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { API_URL } from '../config';

const Investment = ({ sidebarColor, buttonColor }) => {
  const [investments, setInvestments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [investmentsPerPage] = useState(10);

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
    investment.investment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investment.impact_measured.toLowerCase().includes(searchTerm.toLowerCase()) ||
    companies.find(c => c.id === investment.company_id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastInvestment = currentPage * investmentsPerPage;
  const indexOfFirstInvestment = indexOfLastInvestment - investmentsPerPage;
  const currentInvestments = filteredInvestments.slice(indexOfFirstInvestment, indexOfLastInvestment);

  // Adicionar campo de busca
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetar para primeira página ao buscar
  };

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

      {/* Adicionar campo de busca */}
      <div className="mb-4 flex items-center">
        <div className="relative flex-1 max-w-xl">
          <input
            type="text"
            placeholder="Buscar investimentos..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-2 pl-10 border rounded"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Formulário completo */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Empresa</label>
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
              <label className="block mb-2">Tipo de Investimento</label>
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
              <label className="block mb-2">Valor Investido</label>
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
              <label className="block mb-2">Moeda</label>
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
              <label className="block mb-2">Data do Investimento</label>
              <input
                type="date"
                value={newInvestment.investment_date}
                onChange={(e) => setNewInvestment({...newInvestment, investment_date: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">ROI Esperado (%)</label>
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
              <label className="block mb-2">ROI Atual (%)</label>
              <input
                type="number"
                value={newInvestment.actual_roi}
                onChange={(e) => setNewInvestment({...newInvestment, actual_roi: parseFloat(e.target.value)})}
                className="w-full p-2 border rounded"
                step="0.01"
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-2">Impacto Medido</label>
              <textarea
                value={newInvestment.impact_measured}
                onChange={(e) => setNewInvestment({...newInvestment, impact_measured: e.target.value})}
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>

            <div>
              <label className="block mb-2">Data da Última Avaliação</label>
              <input
                type="date"
                value={newInvestment.last_assessment_date}
                onChange={(e) => setNewInvestment({...newInvestment, last_assessment_date: e.target.value})}
                className="w-full p-2 border rounded"
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
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Empresa</th>
              <th className="px-4 py-2 border">Tipo</th>
              <th className="px-4 py-2 border">Valor</th>
              <th className="px-4 py-2 border">ROI Esperado</th>
              <th className="px-4 py-2 border">ROI Atual</th>
              <th className="px-4 py-2 border">Impacto Medido</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentInvestments.map(investment => (
              <tr key={investment.id}>
                <td className="px-4 py-2 border">
                  {companies.find(c => c.id === investment.company_id)?.name}
                </td>
                <td className="px-4 py-2 border">{investment.investment_type}</td>
                <td className="px-4 py-2 border">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: investment.currency 
                  }).format(investment.amount_invested)}
                </td>
                <td className="px-4 py-2 border">{investment.expected_roi}%</td>
                <td className="px-4 py-2 border">{investment.actual_roi}%</td>
                <td className="px-4 py-2 border">{investment.impact_measured}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleEdit(investment)}
                    className="text-blue-500 mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(investment.id)}
                    className="text-red-500"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Adicionar paginação */}
      <div className="mt-4 flex justify-center">
        {Array.from({ 
          length: Math.ceil(filteredInvestments.length / investmentsPerPage) 
        }).map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === index + 1 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Adicionar contador de resultados */}
      <div className="mt-2 text-sm text-gray-600 text-center">
        Mostrando {indexOfFirstInvestment + 1} - {
          Math.min(indexOfLastInvestment, filteredInvestments.length)
        } de {filteredInvestments.length} resultados
      </div>
    </div>
  );
};

export default Investment; 