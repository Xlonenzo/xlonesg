import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { API_URL } from '../config';

// Definir bondTypes fora do componente para evitar recriação a cada render
const bondTypes = [
  'Cédula de Crédito Bancário (CCB)',
  'Certificado de Recebíveis do Agronegócio - CRA',
  'Certificado de Recebíveis Imobiliários - CRI',
  'Certificado de Operações Estruturadas - COE',
  'Certificado de Direitos Creditórios do Agronegócio - CDCA',
  'Colateral de CDB (CDB_COLLATERAL)',
  'Colateral de Títulos Públicos',
  'Créditos de Descarbonização',
  'Debêntures',
  'Duplicata Escritural',
  'Fundo de Investimento em Direitos Creditórios - FIDC',
  'Letra de Crédito do Agronegócio - LCA',
  'Letra de Crédito Imobiliário - LCI',
  'Letra Financeira - LF'
];

function BondManagement({ sidebarColor, buttonColor }) {
  const [bonds, setBonds] = useState([]);
  const [isAddingBond, setIsAddingBond] = useState(false);
  const [editingBond, setEditingBond] = useState(null);
  const [newBond, setNewBond] = useState({
    name: '',
    type: '',
    value: 0,
    esg_percentage: 0,
    issue_date: '',
    compliance_verified: false,
    regulator: '',
    social_impact_type: '',
    estimated_social_impact: '',
    social_report_issued: false,
    project_description: '',
    project_eligibility: '',
    project_selection_date: '',
    resource_allocation_approved: false,
    resource_manager: '',
    separate_account: false,
    social_impact_achieved: '',
    social_impact_measured_date: '',
    audit_completed: false,
    audit_result: '',
    report_frequency: '',
    interest_rate: 0,
    guarantee_value: 0,
    issuer_name: '',
    issuer_cnpj: '',
    issuer_address: '',
    issuer_contact: '',
    intermediary_name: '',
    intermediary_cnpj: '',
    intermediary_contact: '',
    financial_institution_name: '',
    financial_institution_cnpj: '',
    financial_institution_contact: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [bondsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBonds = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/bonds`);
      setBonds(response.data);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar títulos:', error);
      setError('Falha ao carregar os títulos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBonds();
  }, [fetchBonds]);

  const handleAddBond = async () => {
    try {
      const response = await axios.post(`${API_URL}/bonds`, newBond);
      setBonds([...bonds, response.data]);
      setIsAddingBond(false);
      setNewBond({
        // Reset do estado inicial
        name: '',
        type: '',
        value: 0,
        // ... outros campos ...
      });
    } catch (error) {
      console.error('Erro ao adicionar título:', error);
    }
  };

  const handleUpdateBond = async () => {
    try {
      const response = await axios.put(`${API_URL}/bonds/${editingBond.id}`, editingBond);
      setBonds(bonds.map(bond => bond.id === editingBond.id ? response.data : bond));
      setEditingBond(null);
    } catch (error) {
      console.error('Erro ao atualizar título:', error);
    }
  };

  const handleDeleteBond = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este título?')) {
      try {
        await axios.delete(`${API_URL}/bonds/${id}`);
        setBonds(bonds.filter(bond => bond.id !== id));
      } catch (error) {
        console.error('Erro ao excluir título:', error);
      }
    }
  };

  const renderBondForm = (bond, isAdding = false) => (
    <div className="grid grid-cols-2 gap-4">
      {/* Informações Básicas */}
      <div className="col-span-2 bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="font-bold mb-3">Informações Básicas</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Título</label>
            <input
              type="text"
              value={bond.name}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, name: e.target.value}) : 
                setEditingBond({...editingBond, name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo do Título</label>
            <select
              value={bond.type}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, type: e.target.value}) : 
                setEditingBond({...editingBond, type: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            >
              <option value="">Selecione um tipo</option>
              {bondTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Valor</label>
            <input
              type="number"
              value={bond.value}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, value: parseFloat(e.target.value)}) : 
                setEditingBond({...editingBond, value: parseFloat(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Porcentagem ESG</label>
            <input
              type="number"
              value={bond.esg_percentage}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, esg_percentage: parseFloat(e.target.value)}) : 
                setEditingBond({...editingBond, esg_percentage: parseFloat(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="0%"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Data de Emissão</label>
            <div className="relative">
              <input
                type="date"
                value={bond.issue_date}
                onChange={(e) => isAdding ? 
                  setNewBond({...newBond, issue_date: e.target.value}) : 
                  setEditingBond({...editingBond, issue_date: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
                Data de Emissão
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Taxa de Juros</label>
            <input
              type="number"
              value={bond.interest_rate}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, interest_rate: parseFloat(e.target.value)}) : 
                setEditingBond({...editingBond, interest_rate: parseFloat(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="0,00%"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Valor da Garantia</label>
            <input
              type="number"
              value={bond.guarantee_value}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, guarantee_value: parseFloat(e.target.value)}) : 
                setEditingBond({...editingBond, guarantee_value: parseFloat(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="R$ 0,00"
              required
            />
          </div>
        </div>
      </div>

      {/* Informações do Emissor */}
      <div className="col-span-2 bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="font-bold mb-3">Informações do Emissor</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Emissor</label>
            <input
              type="text"
              value={bond.issuer_name}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, issuer_name: e.target.value}) : 
                setEditingBond({...editingBond, issuer_name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">CNPJ do Emissor</label>
            <input
              type="text"
              value={bond.issuer_cnpj}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, issuer_cnpj: e.target.value}) : 
                setEditingBond({...editingBond, issuer_cnpj: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
              pattern="\d{14}"
              title="CNPJ deve conter 14 dígitos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Endereço do Emissor</label>
            <input
              type="text"
              value={bond.issuer_address}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, issuer_address: e.target.value}) : 
                setEditingBond({...editingBond, issuer_address: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contato do Emissor</label>
            <input
              type="text"
              value={bond.issuer_contact}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, issuer_contact: e.target.value}) : 
                setEditingBond({...editingBond, issuer_contact: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
        </div>
      </div>

      {/* Informações do Intermediário */}
      <div className="col-span-2 bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="font-bold mb-3">Informações do Intermediário</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Intermediário</label>
            <input
              type="text"
              value={bond.intermediary_name}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, intermediary_name: e.target.value}) : 
                setEditingBond({...editingBond, intermediary_name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">CNPJ do Intermediário</label>
            <input
              type="text"
              value={bond.intermediary_cnpj}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, intermediary_cnpj: e.target.value}) : 
                setEditingBond({...editingBond, intermediary_cnpj: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
              pattern="\d{14}"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contato do Intermediário</label>
            <input
              type="text"
              value={bond.intermediary_contact}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, intermediary_contact: e.target.value}) : 
                setEditingBond({...editingBond, intermediary_contact: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
        </div>
      </div>

      {/* Informações da Instituição Financeira */}
      <div className="col-span-2 bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="font-bold mb-3">Informações da Instituição Financeira</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome da Instituição</label>
            <input
              type="text"
              value={bond.financial_institution_name}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, financial_institution_name: e.target.value}) : 
                setEditingBond({...editingBond, financial_institution_name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">CNPJ da Instituição</label>
            <input
              type="text"
              value={bond.financial_institution_cnpj}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, financial_institution_cnpj: e.target.value}) : 
                setEditingBond({...editingBond, financial_institution_cnpj: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
              pattern="\d{14}"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contato da Instituição</label>
            <input
              type="text"
              value={bond.financial_institution_contact}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, financial_institution_contact: e.target.value}) : 
                setEditingBond({...editingBond, financial_institution_contact: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
        </div>
      </div>

      {/* Informações do Projeto e Impacto Social */}
      <div className="col-span-2 bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="font-bold mb-3">Informações do Projeto e Impacto Social</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição do Projeto</label>
            <textarea
              value={bond.project_description}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, project_description: e.target.value}) : 
                setEditingBond({...editingBond, project_description: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Elegibilidade do Projeto</label>
            <input
              type="text"
              value={bond.project_eligibility}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, project_eligibility: e.target.value}) : 
                setEditingBond({...editingBond, project_eligibility: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Data de Seleção do Projeto</label>
            <div className="relative">
              <input
                type="date"
                value={bond.project_selection_date}
                onChange={(e) => isAdding ? 
                  setNewBond({...newBond, project_selection_date: e.target.value}) : 
                  setEditingBond({...editingBond, project_selection_date: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
                Data de Seleão
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Impacto Social</label>
            <input
              type="text"
              value={bond.social_impact_type}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, social_impact_type: e.target.value}) : 
                setEditingBond({...editingBond, social_impact_type: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Impacto Social Estimado</label>
            <input
              type="text"
              value={bond.estimated_social_impact}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, estimated_social_impact: e.target.value}) : 
                setEditingBond({...editingBond, estimated_social_impact: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Impacto Social Alcançado</label>
            <input
              type="text"
              value={bond.social_impact_achieved}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, social_impact_achieved: e.target.value}) : 
                setEditingBond({...editingBond, social_impact_achieved: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Data de Medição do Impacto Social</label>
            <div className="relative">
              <input
                type="date"
                value={bond.social_impact_measured_date || ''}
                onChange={(e) => isAdding ? 
                  setNewBond({...newBond, social_impact_measured_date: e.target.value}) : 
                  setEditingBond({...editingBond, social_impact_measured_date: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
                Data de Medição
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informações de Compliance e Auditoria */}
      <div className="col-span-2 bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="font-bold mb-3">Compliance e Auditoria</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Regulador</label>
            <input
              type="text"
              value={bond.regulator}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, regulator: e.target.value}) : 
                setEditingBond({...editingBond, regulator: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gestor de Recursos</label>
            <input
              type="text"
              value={bond.resource_manager}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, resource_manager: e.target.value}) : 
                setEditingBond({...editingBond, resource_manager: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Frequência de Relatórios</label>
            <input
              type="text"
              value={bond.report_frequency || ''}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, report_frequency: e.target.value}) : 
                setEditingBond({...editingBond, report_frequency: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Resultado da Auditoria</label>
            <input
              type="text"
              value={bond.audit_result || ''}
              onChange={(e) => isAdding ? 
                setNewBond({...newBond, audit_result: e.target.value}) : 
                setEditingBond({...editingBond, audit_result: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={bond.compliance_verified}
                onChange={(e) => isAdding ? 
                  setNewBond({...newBond, compliance_verified: e.target.checked}) : 
                  setEditingBond({...editingBond, compliance_verified: e.target.checked})}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Compliance Verificado
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={bond.social_report_issued}
                onChange={(e) => isAdding ? 
                  setNewBond({...newBond, social_report_issued: e.target.checked}) : 
                  setEditingBond({...editingBond, social_report_issued: e.target.checked})}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Relatório Social Emitido
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={bond.resource_allocation_approved}
                onChange={(e) => isAdding ? 
                  setNewBond({...newBond, resource_allocation_approved: e.target.checked}) : 
                  setEditingBond({...editingBond, resource_allocation_approved: e.target.checked})}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Alocação de Recursos Aprovada
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={bond.separate_account}
                onChange={(e) => isAdding ? 
                  setNewBond({...newBond, separate_account: e.target.checked}) : 
                  setEditingBond({...editingBond, separate_account: e.target.checked})}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Conta Separada
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={bond.audit_completed}
                onChange={(e) => isAdding ? 
                  setNewBond({...newBond, audit_completed: e.target.checked}) : 
                  setEditingBond({...editingBond, audit_completed: e.target.checked})}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Auditoria Concluída
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Filtragem e paginação
  const filteredBonds = bonds.filter(bond =>
    bond.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bond.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastBond = currentPage * bondsPerPage;
  const indexOfFirstBond = indexOfLastBond - bondsPerPage;
  const currentBonds = filteredBonds.slice(indexOfFirstBond, indexOfLastBond);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Títulos</h2>
        <button
          onClick={() => setIsAddingBond(true)}
          className="px-4 py-2 text-white rounded"
          style={{ backgroundColor: buttonColor }}
        >
          Adicionar Novo Título
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <FaSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Pesquisar títulos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      {(isAddingBond || editingBond) && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-bold mb-4">
            {isAddingBond ? 'Adicionar Novo Título' : 'Editar Título'}
          </h3>
          {renderBondForm(isAddingBond ? newBond : editingBond, isAddingBond)}
          <div className="mt-4 space-x-2">
            <button
              onClick={isAddingBond ? handleAddBond : handleUpdateBond}
              className="px-4 py-2 text-white rounded"
              style={{ backgroundColor: buttonColor }}
            >
              {isAddingBond ? 'Adicionar' : 'Atualizar'}
            </button>
            <button
              onClick={() => {
                setIsAddingBond(false);
                setEditingBond(null);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded"
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
              <th className="px-4 py-2 border">Nome</th>
              <th className="px-4 py-2 border">Tipo</th>
              <th className="px-4 py-2 border">Valor</th>
              <th className="px-4 py-2 border">% ESG</th>
              <th className="px-4 py-2 border">Data de Emissão</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentBonds.map((bond) => (
              <tr key={bond.id}>
                <td className="px-4 py-2 border">{bond.name}</td>
                <td className="px-4 py-2 border">{bond.type}</td>
                <td className="px-4 py-2 border">{bond.value}</td>
                <td className="px-4 py-2 border">{bond.esg_percentage}%</td>
                <td className="px-4 py-2 border">{bond.issue_date}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => setEditingBond(bond)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteBond(bond.id)}
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

      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(filteredBonds.length / bondsPerPage) }, (_, i) => (
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

export default BondManagement;
