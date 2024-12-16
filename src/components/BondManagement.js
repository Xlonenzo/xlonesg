import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaExclamationCircle, FaPlus, FaFilter, FaChevronUp, FaChevronDown } from 'react-icons/fa';
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

// Função para formatar valor em moeda
const formatCurrencyInput = (value) => {
  try {
    // Remove tudo exceto números
    let numericValue = value.toString().replace(/\D/g, '');
    
    // Se não houver valor, retorna zero formatado
    if (!numericValue) return 'R$ 0,00';
    
    // Garante que o valor tenha pelo menos 3 dígitos (incluindo centavos)
    numericValue = numericValue.padStart(3, '0');
    
    // Separa os centavos
    const decimal = numericValue.slice(-2);
    // Pega a parte inteira mantendo todos os dígitos
    const integer = numericValue.slice(0, -2);
    
    // Formata com separadores de milhar
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `R$ ${formattedInteger || '0'},${decimal}`;
  } catch (error) {
    console.error('Erro na formatação:', error);
    return 'R$ 0,00';
  }
};

// Função para extrair valor numérico
const parseCurrencyValue = (formattedValue) => {
  try {
    // Remove R$, pontos e espaços, troca vírgula por ponto
    const cleanValue = formattedValue
      .replace(/[R$\s.]/g, '')
      .replace(',', '.');
    
    // Converte para número mantendo a precisão
    const value = parseFloat(cleanValue);
    
    // Retorna 0 se não for um número válido
    return isNaN(value) ? 0 : value;
  } catch (error) {
    console.error('Erro no parsing:', error);
    return 0;
  }
};

// Função para formatar taxa de juros
const formatInterestRate = (value) => {
  const numericValue = parseFloat(value);
  return isNaN(numericValue) ? '0.00' : numericValue.toFixed(2);
};

// Função para formatar CNPJ durante digitação
const formatCNPJ = (value) => {
  // Remove tudo que não é número
  const numericValue = value.replace(/\D/g, '');
  
  // Aplica a máscara XX.XXX.XXX/XXXX-XX
  return numericValue
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18); // Limita ao tamanho máximo do CNPJ formatado
};

// Função para remover formatação do CNPJ
const removeCNPJFormat = (value) => {
  return value.replace(/\D/g, '');
};

// Definição dos campos obrigatórios com suas mensagens
const REQUIRED_FIELDS = {
  name: 'Nome do Título',
  type: 'Tipo do Título',
  value: 'Valor',
  esg_percentage: 'Porcentagem ESG',
  issue_date: 'Data de Emissão',
  regulator: 'Regulador',
  social_impact_type: 'Tipo de Impacto Social',
  estimated_social_impact: 'Impacto Social Estimado',
  project_description: 'Descrição do Projeto',
  project_eligibility: 'Elegibilidade do Projeto',
  project_selection_date: 'Data de Seleção do Projeto',
  resource_manager: 'Gestor de Recursos',
  social_impact_achieved: 'Impacto Social Alcançado',
  interest_rate: 'Taxa de Juros',
  guarantee_value: 'Valor da Garantia',
  issuer_name: 'Nome do Emissor',
  issuer_cnpj: 'CNPJ do Emissor',
  issuer_address: 'Endereço do Emissor',
  issuer_contact: 'Contato do Emissor',
  intermediary_name: 'Nome do Intermediário',
  intermediary_cnpj: 'CNPJ do Intermediário',
  intermediary_contact: 'Contato do Intermediário',
  financial_institution_name: 'Nome da Instituição Financeira',
  financial_institution_cnpj: 'CNPJ da Instituição Financeira',
  financial_institution_contact: 'Contato da Instituição Financeira'
};

// Componente para label com indicador de obrigatório
const RequiredFieldLabel = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block mb-2 flex items-center">
        {children}
        <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} />
    </label>
);

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
    issuer_cnpj_formatted: '',
    issuer_address: '',
    issuer_contact: '',
    intermediary_name: '',
    intermediary_cnpj: '',
    intermediary_cnpj_formatted: '',
    financial_institution_name: '',
    financial_institution_cnpj: '',
    financial_institution_cnpj_formatted: '',
    financial_institution_contact: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [bondsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    type: '',
    value: '',
    esg_percentage: '',
    issue_date: ''
  });

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

  // Função de validação
  const validateBond = (bond) => {
    const errors = [];

    // Validação dos campos obrigatórios
    Object.entries(REQUIRED_FIELDS).forEach(([field, label]) => {
      if (!bond[field] && bond[field] !== 0) {
        errors.push(`O campo "${label}" é obrigatório`);
      }
    });

    // Validações específicas para campos numéricos
    if (bond.value <= 0) {
      errors.push('O Valor deve ser maior que zero');
    }

    if (bond.esg_percentage < 0 || bond.esg_percentage > 100) {
      errors.push('A Porcentagem ESG deve estar entre 0 e 100');
    }

    if (bond.interest_rate < 0) {
      errors.push('A Taxa de Juros não pode ser negativa');
    }

    if (bond.guarantee_value <= 0) {
      errors.push('O Valor da Garantia deve ser maior que zero');
    }

    // Validação de CNPJ
    const validateCNPJ = (cnpj) => {
      return cnpj.replace(/\D/g, '').length === 14;
    };

    if (!validateCNPJ(bond.issuer_cnpj)) {
      errors.push('CNPJ do Emissor inválido');
    }
    if (!validateCNPJ(bond.intermediary_cnpj)) {
      errors.push('CNPJ do Intermediário inválido');
    }
    if (!validateCNPJ(bond.financial_institution_cnpj)) {
      errors.push('CNPJ da Instituição Financeira inválido');
    }

    return errors;
  };

  // Atualizar handleAddBond e handleUpdateBond
  const handleAddBond = async () => {
    const errors = validateBond(newBond);
    setValidationErrors(errors);

    if (errors.length > 0) {
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/bonds`, newBond);
      setBonds([...bonds, response.data]);
      setIsAddingBond(false);
      setNewBond({
        // Reset do estado inicial com todos os campos obrigatórios
        name: '',
        type: '',
        value: 0,
        // ... outros campos ...
      });
      setValidationErrors([]);
    } catch (error) {
      console.error('Erro ao adicionar título:', error);
      setValidationErrors(['Erro ao salvar o título. Por favor, tente novamente.']);
    }
  };

  const handleUpdateBond = async () => {
    const errors = validateBond(editingBond);
    setValidationErrors(errors);

    if (errors.length > 0) {
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/bonds/${editingBond.id}`, editingBond);
      setBonds(bonds.map(bond => bond.id === editingBond.id ? response.data : bond));
      setEditingBond(null);
      setValidationErrors([]);
    } catch (error) {
      console.error('Erro ao atualizar título:', error);
      setValidationErrors(['Erro ao atualizar o título. Por favor, tente novamente.']);
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

  const handleCurrencyInput = (e, field, isAdding) => {
    try {
      // Pega apenas os números do input
      const rawValue = e.target.value.replace(/\D/g, '');
      
      // Formata o valor
      const formattedValue = formatCurrencyInput(rawValue);
      
      // Extrai o valor numérico
      const numericValue = parseCurrencyValue(formattedValue);
      
      console.log('Input:', {
        raw: rawValue,
        formatted: formattedValue,
        numeric: numericValue
      });

      if (isAdding) {
        setNewBond(prev => ({
          ...prev,
          [field]: numericValue,
          [`${field}_formatted`]: formattedValue
        }));
      } else {
        setEditingBond(prev => ({
          ...prev,
          [field]: numericValue,
          [`${field}_formatted`]: formattedValue
        }));
      }
    } catch (error) {
      console.error('Erro no handleCurrencyInput:', error);
    }
  };

  const handleCurrencyBlur = (e, field, isAdding) => {
    try {
      const currentValue = isAdding ? newBond[field] : editingBond[field];
      console.log('Blur - valor atual:', currentValue);
      
      // Garante que o valor seja tratado como string com todos os dígitos
      const formattedValue = formatCurrencyInput(currentValue.toFixed(2).replace('.', ''));
      
      console.log('Blur - valor formatado:', formattedValue);

      if (isAdding) {
        setNewBond(prev => ({
          ...prev,
          [`${field}_formatted`]: formattedValue
        }));
      } else {
        setEditingBond(prev => ({
          ...prev,
          [`${field}_formatted`]: formattedValue
        }));
      }
    } catch (error) {
      console.error('Erro no handleCurrencyBlur:', error);
    }
  };

  const handleCNPJInput = (e, field, isAdding) => {
    const formattedValue = formatCNPJ(e.target.value);
    const numericValue = removeCNPJFormat(formattedValue);
    
    if (isAdding) {
      setNewBond(prev => ({
        ...prev,
        [field]: numericValue, // Salva apenas números
        [`${field}_formatted`]: formattedValue // Mantém valor formatado para exibição
      }));
    } else {
      setEditingBond(prev => ({
        ...prev,
        [field]: numericValue, // Salva apenas números
        [`${field}_formatted`]: formattedValue // Mantém valor formatado para exibição
      }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const renderBondForm = (bond, isAdding = false) => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <RequiredFieldLabel htmlFor="name">Nome do Título</RequiredFieldLabel>
        <input
          id="name"
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
        <RequiredFieldLabel htmlFor="type">Tipo do Título</RequiredFieldLabel>
        <select
          id="type"
          value={bond.type}
          onChange={(e) => isAdding ? 
            setNewBond({...newBond, type: e.target.value}) : 
            setEditingBond({...editingBond, type: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        >
          <option value="">Selecione um tipo</option>
          {bondTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <RequiredFieldLabel htmlFor="value">Valor</RequiredFieldLabel>
        <input
          id="value"
          type="text"
          value={bond.value_formatted || formatCurrencyInput(String(bond.value || 0))}
          onChange={(e) => handleCurrencyInput(e, 'value', isAdding)}
          onBlur={(e) => handleCurrencyBlur(e, 'value', isAdding)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <RequiredFieldLabel htmlFor="esg_percentage">Porcentagem ESG (%)</RequiredFieldLabel>
        <input
          id="esg_percentage"
          type="number"
          value={bond.esg_percentage}
          onChange={(e) => {
            const value = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
            if (isAdding) {
              setNewBond({...newBond, esg_percentage: value});
            } else {
              setEditingBond({...editingBond, esg_percentage: value});
            }
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          min="0"
          max="100"
          step="1"
          placeholder="0"
          required
        />
      </div>

      <div>
        <RequiredFieldLabel htmlFor="issue_date">Data de Emissão</RequiredFieldLabel>
        <div className="relative">
          <input
            id="issue_date"
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
        <RequiredFieldLabel htmlFor="interest_rate">Taxa de Juros (%)</RequiredFieldLabel>
        <input
          id="interest_rate"
          type="number"
          value={formatInterestRate(bond.interest_rate)}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            if (isAdding) {
              setNewBond({...newBond, interest_rate: value});
            } else {
              setEditingBond({...editingBond, interest_rate: value});
            }
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          min="0"
          step="0.01"
          placeholder="0.00"
          required
        />
        <span className="text-sm text-gray-500">
          Ex: 5.25 para 5,25%
        </span>
      </div>

      <div>
        <RequiredFieldLabel htmlFor="guarantee_value">Valor da Garantia</RequiredFieldLabel>
        <input
          id="guarantee_value"
          type="text"
          value={bond.guarantee_value_formatted || formatCurrencyInput(String(bond.guarantee_value || 0))}
          onChange={(e) => handleCurrencyInput(e, 'guarantee_value', isAdding)}
          onBlur={(e) => handleCurrencyBlur(e, 'guarantee_value', isAdding)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="R$ 0,00"
          required
        />
      </div>

      <div>
        <RequiredFieldLabel htmlFor="issuer_name">Nome do Emissor</RequiredFieldLabel>
        <input
          id="issuer_name"
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
        <RequiredFieldLabel htmlFor="issuer_cnpj">CNPJ do Emissor</RequiredFieldLabel>
        <input
          id="issuer_cnpj"
          type="text"
          value={bond.issuer_cnpj_formatted || formatCNPJ(bond.issuer_cnpj || '')}
          onChange={(e) => handleCNPJInput(e, 'issuer_cnpj', isAdding)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="00.000.000/0000-00"
          maxLength={18}
          required
        />
      </div>

      <div>
        <RequiredFieldLabel htmlFor="issuer_address">Endereço do Emissor</RequiredFieldLabel>
        <input
          id="issuer_address"
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
        <RequiredFieldLabel htmlFor="issuer_contact">Contato do Emissor</RequiredFieldLabel>
        <input
          id="issuer_contact"
          type="text"
          value={bond.issuer_contact}
          onChange={(e) => isAdding ? 
            setNewBond({...newBond, issuer_contact: e.target.value}) : 
            setEditingBond({...editingBond, issuer_contact: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <RequiredFieldLabel htmlFor="intermediary_name">Nome do Intermediário</RequiredFieldLabel>
        <input
          id="intermediary_name"
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
        <RequiredFieldLabel htmlFor="intermediary_cnpj">CNPJ do Intermediário</RequiredFieldLabel>
        <input
          id="intermediary_cnpj"
          type="text"
          value={bond.intermediary_cnpj_formatted || formatCNPJ(bond.intermediary_cnpj || '')}
          onChange={(e) => handleCNPJInput(e, 'intermediary_cnpj', isAdding)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="00.000.000/0000-00"
          maxLength={18}
          required
        />
      </div>

      <div>
        <RequiredFieldLabel htmlFor="intermediary_contact">Contato do Intermediário</RequiredFieldLabel>
        <input
          id="intermediary_contact"
          type="text"
          value={bond.intermediary_contact}
          onChange={(e) => isAdding ? 
            setNewBond({...newBond, intermediary_contact: e.target.value}) : 
            setEditingBond({...editingBond, intermediary_contact: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <RequiredFieldLabel htmlFor="financial_institution_name">Nome da Instituição</RequiredFieldLabel>
        <input
          id="financial_institution_name"
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
        <RequiredFieldLabel htmlFor="financial_institution_cnpj">CNPJ da Instituição</RequiredFieldLabel>
        <input
          id="financial_institution_cnpj"
          type="text"
          value={bond.financial_institution_cnpj_formatted || formatCNPJ(bond.financial_institution_cnpj || '')}
          onChange={(e) => handleCNPJInput(e, 'financial_institution_cnpj', isAdding)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="00.000.000/0000-00"
          maxLength={18}
          required
        />
      </div>

      <div>
        <RequiredFieldLabel htmlFor="financial_institution_contact">Contato da Instituição</RequiredFieldLabel>
        <input
          id="financial_institution_contact"
          type="text"
          value={bond.financial_institution_contact}
          onChange={(e) => isAdding ? 
            setNewBond({...newBond, financial_institution_contact: e.target.value}) : 
            setEditingBond({...editingBond, financial_institution_contact: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <RequiredFieldLabel htmlFor="project_description">Descrição do Projeto</RequiredFieldLabel>
        <textarea
          id="project_description"
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
        <RequiredFieldLabel htmlFor="project_eligibility">Elegibilidade do Projeto</RequiredFieldLabel>
        <input
          id="project_eligibility"
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
        <RequiredFieldLabel htmlFor="project_selection_date">Data de Seleção do Projeto</RequiredFieldLabel>
        <div className="relative">
          <input
            id="project_selection_date"
            type="date"
            value={bond.project_selection_date}
            onChange={(e) => isAdding ? 
              setNewBond({...newBond, project_selection_date: e.target.value}) : 
              setEditingBond({...editingBond, project_selection_date: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
            Data de Seleção
          </span>
        </div>
      </div>

      <div>
        <RequiredFieldLabel htmlFor="social_impact_type">Tipo de Impacto Social</RequiredFieldLabel>
        <input
          id="social_impact_type"
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
        <RequiredFieldLabel htmlFor="estimated_social_impact">Impacto Social Estimado</RequiredFieldLabel>
        <input
          id="estimated_social_impact"
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
        <RequiredFieldLabel htmlFor="social_impact_achieved">Impacto Social Alcançado</RequiredFieldLabel>
        <input
          id="social_impact_achieved"
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
        <label htmlFor="social_impact_measured_date" className="block text-sm font-medium text-gray-700">
          Data de Medição do Impacto Social
        </label>
        <div className="relative">
          <input
            id="social_impact_measured_date"
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

      <div>
        <RequiredFieldLabel htmlFor="regulator">Regulador</RequiredFieldLabel>
        <input
          id="regulator"
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
        <RequiredFieldLabel htmlFor="resource_manager">Gestor de Recursos</RequiredFieldLabel>
        <input
          id="resource_manager"
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
        <label htmlFor="report_frequency" className="block text-sm font-medium text-gray-700">
          Frequência de Relatórios
        </label>
        <input
          id="report_frequency"
          type="text"
          value={bond.report_frequency || ''}
          onChange={(e) => isAdding ? 
            setNewBond({...newBond, report_frequency: e.target.value}) : 
            setEditingBond({...editingBond, report_frequency: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="audit_result" className="block text-sm font-medium text-gray-700">
          Resultado da Auditoria
        </label>
        <input
          id="audit_result"
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
            id="compliance_verified"
            type="checkbox"
            checked={bond.compliance_verified}
            onChange={(e) => isAdding ? 
              setNewBond({...newBond, compliance_verified: e.target.checked}) : 
              setEditingBond({...editingBond, compliance_verified: e.target.checked})}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="compliance_verified" className="ml-2 block text-sm text-gray-900">
            Compliance Verificado
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="social_report_issued"
            type="checkbox"
            checked={bond.social_report_issued}
            onChange={(e) => isAdding ? 
              setNewBond({...newBond, social_report_issued: e.target.checked}) : 
              setEditingBond({...editingBond, social_report_issued: e.target.checked})}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="social_report_issued" className="ml-2 block text-sm text-gray-900">
            Relatório Social Emitido
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="resource_allocation_approved"
            type="checkbox"
            checked={bond.resource_allocation_approved}
            onChange={(e) => isAdding ? 
              setNewBond({...newBond, resource_allocation_approved: e.target.checked}) : 
              setEditingBond({...editingBond, resource_allocation_approved: e.target.checked})}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="resource_allocation_approved" className="ml-2 block text-sm text-gray-900">
            Alocação de Recursos Aprovada
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="separate_account"
            type="checkbox"
            checked={bond.separate_account}
            onChange={(e) => isAdding ? 
              setNewBond({...newBond, separate_account: e.target.checked}) : 
              setEditingBond({...editingBond, separate_account: e.target.checked})}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="separate_account" className="ml-2 block text-sm text-gray-900">
            Conta Separada
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="audit_completed"
            type="checkbox"
            checked={bond.audit_completed}
            onChange={(e) => isAdding ? 
              setNewBond({...newBond, audit_completed: e.target.checked}) : 
              setEditingBond({...editingBond, audit_completed: e.target.checked})}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="audit_completed" className="ml-2 block text-sm text-gray-900">
            Auditoria Concluída
          </label>
        </div>
      </div>

      {/* Legenda dos campos obrigatórios */}
      <div className="col-span-2 mt-4 flex items-center gap-2 text-sm text-gray-500">
        <FaExclamationCircle className="text-red-500 opacity-60" size={12} />
        <span>Campos obrigatórios</span>
      </div>
    </div>
  );

  // Filtragem e paginação
  const filteredBonds = bonds;

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
    <div className="space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium text-gray-800">Gerenciamento de Títulos</h2>
        <button
          onClick={() => setIsAddingBond(true)}
          className="text-white px-4 py-2 rounded hover:opacity-80 transition-all flex items-center gap-2 text-sm"
          style={{ backgroundColor: buttonColor }}
        >
          <FaPlus size={16} />
          Adicionar Novo Título
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
                <label className="block text-sm font-medium text-gray-600 mb-2">Nome do Título</label>
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
                <label className="block text-sm font-medium text-gray-600 mb-2">Tipo</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                >
                  <option value="">Todos os tipos</option>
                  {bondTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Data de Emissão</label>
                <input
                  type="date"
                  name="issue_date"
                  value={filters.issue_date}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setFilters({
                  name: '',
                  type: '',
                  value: '',
                  esg_percentage: '',
                  issue_date: ''
                })}
                className="px-4 py-2 text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
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
                % ESG
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Data de Emissão
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
            {currentBonds.map((bond) => (
              <tr key={bond.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{bond.name}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{bond.type}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{formatCurrencyInput(String(bond.value))}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{bond.esg_percentage}%</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{bond.issue_date}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-center">
                  <div className="flex items-center justify-center gap-3">
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
                  </div>
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

      {/* Exibição de erros de validação */}
      {validationErrors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Erros de validação:</strong>
          <ul className="list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default BondManagement;
