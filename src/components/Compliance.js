import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaFilter, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL } from '../config';

const Compliance = ({ sidebarColor, buttonColor }) => {
  const [compliances, setCompliances] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompliance, setEditingCompliance] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [compliancesPerPage] = useState(10);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filters, setFilters] = useState({
    company: '',
    entity_type: '',
    auditor: '',
    status: ''
  });

  const [newCompliance, setNewCompliance] = useState({
    company_id: '',
    entity_type: '',
    audit_date: '',
    auditor_name: '',
    compliance_status: '',
    findings: '',
    corrective_action_plan: '',
    follow_up_date: ''
  });

  const statusOptions = [
    "Conforme",
    "Não Conforme",
    "Parcialmente Conforme"
  ];

  const entityTypes = [
    "Projeto",
    "Investimento",
    "Emissão"
  ];

  useEffect(() => {
    fetchCompliances();
    fetchCompanies();
  }, []);

  const fetchCompliances = async () => {
    try {
      const response = await axios.get(`${API_URL}/compliance`);
      setCompliances(response.data);
    } catch (error) {
      console.error('Erro ao buscar auditorias de compliance:', error);
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

  const validateForm = () => {
    const requiredFields = [
      'company_id',
      'entity_type',
      'audit_date',
      'auditor_name',
      'compliance_status'
    ];
    
    for (const field of requiredFields) {
      if (!newCompliance[field]) {
        alert(`Por favor, preencha o campo ${field}`);
        return false;
      }
    }

    if (newCompliance.follow_up_date && 
        new Date(newCompliance.follow_up_date) <= new Date(newCompliance.audit_date)) {
        alert('A data de follow-up deve ser posterior à data da auditoria');
        return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requiredFields = [
        'company_id',
        'entity_type',
        'audit_date',
        'auditor_name',
        'compliance_status',
        'findings',
        'corrective_action_plan',
        'follow_up_date'
      ];

      const missingFields = requiredFields.filter(field => !newCompliance[field]);
      
      if (missingFields.length > 0) {
        alert(`Por favor, preencha todos os campos obrigatórios: ${missingFields.join(', ')}`);
        return;
      }

      const formattedCompliance = {
        ...newCompliance,
        audit_date: new Date(newCompliance.audit_date).toISOString().split('T')[0],
        follow_up_date: newCompliance.follow_up_date ? 
          new Date(newCompliance.follow_up_date).toISOString().split('T')[0] : 
          null
      };

      if (editingCompliance) {
        await axios.put(`${API_URL}/compliance/${editingCompliance.id}`, formattedCompliance);
      } else {
        await axios.post(`${API_URL}/compliance`, formattedCompliance);
      }
      fetchCompliances();
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (compliance) => {
    setEditingCompliance(compliance);
    setNewCompliance({
      company_id: compliance.company_id,
      entity_type: compliance.entity_type,
      audit_date: compliance.audit_date,
      auditor_name: compliance.auditor_name,
      compliance_status: compliance.compliance_status,
      findings: compliance.findings,
      corrective_action_plan: compliance.corrective_action_plan,
      follow_up_date: compliance.follow_up_date
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta auditoria?')) {
      try {
        await axios.delete(`${API_URL}/compliance/${id}`);
        fetchCompliances();
      } catch (error) {
        console.error('Erro ao excluir auditoria:', error);
      }
    }
  };

  const resetForm = () => {
    setNewCompliance({
      company_id: '',
      entity_type: '',
      audit_date: '',
      auditor_name: '',
      compliance_status: '',
      findings: '',
      corrective_action_plan: '',
      follow_up_date: ''
    });
    setEditingCompliance(null);
  };

  // Filtrar e paginar auditorias
  const filteredCompliances = compliances.filter(compliance =>
    (!filters.company || companies.find(c => c.id === compliance.company_id)?.name.toLowerCase().includes(filters.company.toLowerCase())) &&
    (!filters.entity_type || compliance.entity_type.toLowerCase().includes(filters.entity_type.toLowerCase())) &&
    (!filters.auditor || compliance.auditor_name.toLowerCase().includes(filters.auditor.toLowerCase())) &&
    (!filters.status || compliance.compliance_status === filters.status)
  );

  const indexOfLastCompliance = currentPage * compliancesPerPage;
  const indexOfFirstCompliance = indexOfLastCompliance - compliancesPerPage;
  const currentCompliances = filteredCompliances.slice(indexOfFirstCompliance, indexOfLastCompliance);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Auditorias de Compliance</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center px-4 py-2 rounded text-white"
          style={{ backgroundColor: buttonColor }}
        >
          <FaPlus className="mr-2" /> Nova Auditoria
        </button>
      </div>

      {/* Formulário */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">
                <div className="flex items-center">
                  Empresa
                  <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </div>
              </label>
              <select
                value={newCompliance.company_id}
                onChange={(e) => setNewCompliance({...newCompliance, company_id: e.target.value})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione a empresa</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">
                <div className="flex items-center">
                  Tipo de Entidade
                  <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </div>
              </label>
              <select
                value={newCompliance.entity_type}
                onChange={(e) => setNewCompliance({...newCompliance, entity_type: e.target.value})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione o tipo</option>
                {entityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">
                <div className="flex items-center">
                  Data da Auditoria
                  <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </div>
              </label>
              <input
                type="date"
                value={newCompliance.audit_date}
                onChange={(e) => setNewCompliance({...newCompliance, audit_date: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">
                <div className="flex items-center">
                  Nome do Auditor
                  <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </div>
              </label>
              <input
                type="text"
                value={newCompliance.auditor_name}
                onChange={(e) => setNewCompliance({...newCompliance, auditor_name: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">
                <div className="flex items-center">
                  Status de Compliance
                  <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </div>
              </label>
              <select
                value={newCompliance.compliance_status}
                onChange={(e) => setNewCompliance({...newCompliance, compliance_status: e.target.value})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione o status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">
                <div className="flex items-center">
                  Data de Follow-up
                  <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                  <span className="text-sm text-gray-500 ml-1">
                    (deve ser posterior à data da auditoria)
                  </span>
                </div>
              </label>
              <input
                type="date"
                value={newCompliance.follow_up_date}
                min={newCompliance.audit_date ? 
                  new Date(newCompliance.audit_date).toISOString().split('T')[0] : 
                  undefined}
                onChange={(e) => setNewCompliance({...newCompliance, follow_up_date: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-2">
                <div className="flex items-center">
                  Descobertas
                  <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </div>
              </label>
              <textarea
                value={newCompliance.findings}
                onChange={(e) => setNewCompliance({...newCompliance, findings: e.target.value})}
                className="w-full p-2 border rounded"
                rows="3"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-2">
                <div className="flex items-center">
                  Plano de Ação Corretiva
                  <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </div>
              </label>
              <textarea
                value={newCompliance.corrective_action_plan}
                onChange={(e) => setNewCompliance({...newCompliance, corrective_action_plan: e.target.value})}
                className="w-full p-2 border rounded"
                rows="3"
                required
              />
            </div>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
              className="px-4 py-2 rounded bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded text-white"
              style={{ backgroundColor: buttonColor }}
              disabled={loading}
            >
              {loading ? 'Salvando...' : editingCompliance ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      )}

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
          <div className="p-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Entidade</label>
              <select
                value={filters.entity_type}
                onChange={(e) => setFilters(prev => ({...prev, entity_type: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
              >
                <option value="">Todos</option>
                {entityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
              >
                <option value="">Todos</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

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
                Tipo de Entidade
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Data da Auditoria
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Auditor
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Status
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
            {currentCompliances.map(compliance => (
              <tr key={compliance.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">
                    {companies.find(c => c.id === compliance.company_id)?.name}
                  </div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{compliance.entity_type}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{compliance.audit_date}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{compliance.auditor_name}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                    compliance.compliance_status === 'Conforme' ? 'bg-green-100 text-green-800' :
                    compliance.compliance_status === 'Não Conforme' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {compliance.compliance_status}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleEdit(compliance)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(compliance.id)}
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
      <div className="flex justify-between items-center mt-4 px-4">
        <div className="text-sm text-gray-600">
          Mostrando {((currentPage - 1) * compliancesPerPage) + 1} a {Math.min(currentPage * compliancesPerPage, filteredCompliances.length)} de {filteredCompliances.length} registros
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} className="stroke-[1.5]" />
          </button>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {Math.ceil(filteredCompliances.length / compliancesPerPage)}
          </span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredCompliances.length / compliancesPerPage)}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} className="stroke-[1.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Compliance; 