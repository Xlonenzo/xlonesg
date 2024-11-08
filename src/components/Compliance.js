import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { API_URL } from '../config';

const Compliance = ({ sidebarColor, buttonColor }) => {
  const [compliances, setCompliances] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompliance, setEditingCompliance] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [compliancesPerPage] = useState(10);

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
    if (!validateForm()) return;
    
    setLoading(true);
    try {
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
      console.error('Erro ao salvar auditoria:', error.response?.data || error);
      alert(error.response?.data?.detail || 'Erro ao salvar auditoria');
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
    compliance.auditor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    compliance.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    companies.find(c => c.id === compliance.company_id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              <label className="block mb-2">Empresa</label>
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
              <label className="block mb-2">Tipo de Entidade</label>
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
              <label className="block mb-2">Data da Auditoria</label>
              <input
                type="date"
                value={newCompliance.audit_date}
                onChange={(e) => setNewCompliance({...newCompliance, audit_date: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Nome do Auditor</label>
              <input
                type="text"
                value={newCompliance.auditor_name}
                onChange={(e) => setNewCompliance({...newCompliance, auditor_name: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Status de Compliance</label>
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
                Data de Follow-up
                <span className="text-sm text-gray-500 ml-1">
                  (deve ser posterior à data da auditoria)
                </span>
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
              <label className="block mb-2">Descobertas</label>
              <textarea
                value={newCompliance.findings}
                onChange={(e) => setNewCompliance({...newCompliance, findings: e.target.value})}
                className="w-full p-2 border rounded"
                rows="3"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-2">Plano de Ação Corretiva</label>
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

      {/* Barra de pesquisa */}
      <div className="mb-4">
        <div className="flex items-center border rounded p-2">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Pesquisar auditorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Empresa</th>
              <th className="px-4 py-2 border">Tipo de Entidade</th>
              <th className="px-4 py-2 border">Data da Auditoria</th>
              <th className="px-4 py-2 border">Auditor</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentCompliances.map(compliance => (
              <tr key={compliance.id}>
                <td className="px-4 py-2 border">
                  {companies.find(c => c.id === compliance.company_id)?.name}
                </td>
                <td className="px-4 py-2 border">{compliance.entity_type}</td>
                <td className="px-4 py-2 border">{compliance.audit_date}</td>
                <td className="px-4 py-2 border">{compliance.auditor_name}</td>
                <td className="px-4 py-2 border">{compliance.compliance_status}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleEdit(compliance)}
                    className="text-blue-500 mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(compliance.id)}
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

      {/* Paginação */}
      <div className="mt-4 flex justify-center">
        {Array.from({ length: Math.ceil(filteredCompliances.length / compliancesPerPage) }).map((_, index) => (
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

export default Compliance; 