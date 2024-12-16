import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus,
  Filter,
  ChevronUp,
  ChevronDown,
  Pen,
  Trash,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Lightbulb,
  HelpCircle
} from 'lucide-react';
import { API_URL } from '../config';
import helpData from '../data/help.json';

function CompanyManagement({ buttonColor }) {
  const [companies, setCompanies] = useState([]);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({
    cnpj: '',
    name: '',
    razao_social: '',
    endereco: '',
    trade_name: '',
    registration_date: '',
    size: '',
    sector: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: '',
    website: '',
    is_active: true
  });
  const [editingCompany, setEditingCompany] = useState(null);
  const [filters, setFilters] = useState({
    cnpj: '',
    name: '',
    trade_name: '',
    city: '',
    state: '',
    is_active: ''
  });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'none' // 'none', 'asc' ou 'desc'
  });
  const [showHelp, setShowHelp] = useState(false);

  // Adicionar opções de tamanho
  const sizeOptions = ['Micro', 'Pequena', 'Média', 'Grande'];

  // Adicionar opçes de setores
  const sectorOptions = [
    'Tecnologia da Informação (TI)',
    'Saúde',
    'Bens de Capital',
    'Consumo Cíclico',
    'Consumo Não-Cíclico',
    'Energia',
    'Financeiro',
    'Materiais Básicos',
    'Imobiliário',
    'Serviços',
    'Utilidades Públicas',
    'Telecomunicações',
    'Transporte e Logística',
    'Setor Público'
  ];

  // Adicionar estados para mensagens de erro
  const [errors, setErrors] = useState({
    email: '',
    website: ''
  });

  // Função para validar email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função para validar website
  const validateWebsite = (website) => {
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return urlRegex.test(website);
  };

  // Função para lidar com mudança no email
  const handleEmailChange = (e, isEditing) => {
    const email = e.target.value;
    if (email && !validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Email inválido' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }

    if (isEditing) {
      setEditingCompany({ ...editingCompany, email });
    } else {
      setNewCompany({ ...newCompany, email });
    }
  };

  // Função para lidar com mudança no website
  const handleWebsiteChange = (e, isEditing) => {
    const website = e.target.value;
    if (website && !validateWebsite(website)) {
      setErrors(prev => ({ ...prev, website: 'Website inválido' }));
    } else {
      setErrors(prev => ({ ...prev, website: '' }));
    }

    if (isEditing) {
      setEditingCompany({ ...editingCompany, website });
    } else {
      setNewCompany({ ...newCompany, website });
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/companies`);
      setCompanies(response.data);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    }
  };

  const handleAddCompany = async () => {
    // Log dos dados antes da validação
    console.log('Dados originais:', {
        cnpj: newCompany.cnpj,
        name: newCompany.name,
        razao_social: newCompany.razao_social,
        endereco: newCompany.endereco,
        trade_name: newCompany.trade_name,
        registration_date: newCompany.registration_date,
        size: newCompany.size,
        sector: newCompany.sector,
        city: newCompany.city,
        state: newCompany.state,
        zip_code: newCompany.zip_code,
        phone: newCompany.phone,
        email: newCompany.email,
        website: newCompany.website,
        is_active: newCompany.is_active
    });

    // Validar campos obrigatórios
    if (!newCompany.cnpj || !newCompany.name) {
        alert('CNPJ e Nome são campos obrigatórios');
        return;
    }

    // Validar antes de enviar
    if (newCompany.email && !validateEmail(newCompany.email)) {
        setErrors(prev => ({ ...prev, email: 'Email inválido' }));
        return;
    }
    if (newCompany.website && !validateWebsite(newCompany.website)) {
        setErrors(prev => ({ ...prev, website: 'Website inválido' }));
        return;
    }

    try {
        // Formatar os dados antes de enviar
        const formattedCompany = {
            ...newCompany,
            cnpj: newCompany.cnpj.replace(/\D/g, ''), // Remove caracteres não numéricos
            name: newCompany.name.trim(),
            is_active: newCompany.is_active === undefined ? true : newCompany.is_active
        };

        // Log dos dados formatados antes do envio
        console.log('Dados formatados para envio:', formattedCompany);

        const response = await axios.post(`${API_URL}/companies/hierarchy`, formattedCompany);
        console.log('Resposta do servidor:', response.data);

        setCompanies([...companies, response.data]);
        setNewCompany({ 
            cnpj: '', 
            name: '', 
            razao_social: '', 
            endereco: '', 
            trade_name: '', 
            registration_date: '', 
            size: '', 
            sector: '', 
            city: '', 
            state: '', 
            zip_code: '', 
            phone: '', 
            email: '', 
            website: '', 
            is_active: true 
        });
        setIsAddingCompany(false);
    } catch (error) {
        console.error('Erro detalhado:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            validationError: error.response?.data?.detail
        });
        alert(error.response?.data?.detail || 'Erro ao adicionar empresa. Verifique os dados e tente novamente.');
    }
  };

  const handleUpdateCompany = async () => {
    try {
      const response = await axios.put(`${API_URL}/companies/${editingCompany.id}`, {
        cnpj: editingCompany.cnpj,
        name: editingCompany.name,
        razao_social: editingCompany.razao_social,
        endereco: editingCompany.endereco,
        trade_name: editingCompany.trade_name,
        registration_date: editingCompany.registration_date,
        size: editingCompany.size,
        sector: editingCompany.sector,
        city: editingCompany.city,
        state: editingCompany.state,
        zip_code: editingCompany.zip_code,
        phone: editingCompany.phone,
        email: editingCompany.email,
        website: editingCompany.website,
        is_active: editingCompany.is_active
      });
      setCompanies(companies.map(company => company.id === editingCompany.id ? response.data : company));
      setEditingCompany(null);
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      alert(error.response?.data?.detail || 'Erro ao atualizar empresa');
    }
  };

  const handleDeleteCompany = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      try {
        await axios.delete(`${API_URL}/companies/${id}`);
        setCompanies(companies.filter((company) => company.id !== id));
      } catch (error) {
        console.error('Erro ao deletar empresa:', error);
        alert(error.response?.data?.detail || 'Erro ao deletar empresa');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const renderColumnFilter = (columnName, placeholder) => (
    <div className="flex items-center">
      <input
        type="text"
        name={columnName}
        value={filters[columnName]}
        onChange={handleFilterChange}
        className="w-full p-1 text-sm border rounded"
        placeholder={`Filtrar ${placeholder}`}
      />
      <Filter size={16} className="ml-1 text-gray-500" />
    </div>
  );

  const filteredCompanies = companies.filter(company => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      if (key === 'is_active') {
        const filterValue = filters[key].toLowerCase();
        const isActive = company[key] ? 'sim' : 'não';
        return isActive.includes(filterValue);
      }
      return company[key]?.toString().toLowerCase().includes(filters[key].toLowerCase());
    });
  });

  useEffect(() => {
    setTotalPages(Math.ceil(filteredCompanies.length / itemsPerPage));
  }, [filteredCompanies, itemsPerPage]);

  const getCurrentPageItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Função para ordenar os dados
  const sortData = (data, key, direction) => {
    if (direction === 'none') return data;
    
    return [...data].sort((a, b) => {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      
      const aValue = typeof a[key] === 'string' ? a[key].toLowerCase() : a[key];
      const bValue = typeof b[key] === 'string' ? b[key].toLowerCase() : b[key];
      
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Função para lidar com o clique no cabeçalho da coluna
  const handleSort = (key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = 'none';
      else direction = 'asc';
    }
    
    setSortConfig({ key, direction });
  };

  // Função para renderizar o ícone de ordenação
  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown size={14} className="stroke-[1.5] opacity-50" />;
    }
    
    if (sortConfig.direction === 'asc') {
      return <ArrowUp size={14} className="stroke-[1.5]" />;
    }
    
    if (sortConfig.direction === 'desc') {
      return <ArrowDown size={14} className="stroke-[1.5]" />;
    }
    
    return <ArrowUpDown size={14} className="stroke-[1.5] opacity-50" />;
  };

  // Estilo comum para todos os inputs e selects
  const inputStyle = "w-full p-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const gridStyle = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4";

  // Estilos
  const headerContainerStyle = "flex justify-between items-center mb-6";
  const titleGroupStyle = "flex items-center gap-3";
  const titleStyle = "text-2xl font-medium text-gray-800";
  const helpIconStyle = "text-yellow-500/70 hover:text-yellow-500/90 cursor-help transition-all duration-200";
  const tooltipStyle = `
    fixed z-50 max-w-2xl max-h-[80vh] overflow-y-auto p-6 text-sm bg-white rounded-lg shadow-xl border border-gray-100
    left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
    transition-opacity duration-200 ease-in-out
  `;

  return (
    <div className="p-6">
      <div className={headerContainerStyle}>
        <div className={titleGroupStyle}>
          <h1 className={titleStyle}>Gestão de Empresas</h1>
          <div className="relative group">
            <HelpCircle
              size={20}
              strokeWidth={2}
              className={helpIconStyle}
            />
            <div className="
              invisible group-hover:visible opacity-0 group-hover:opacity-100
              transition-all duration-200 ease-in-out
              absolute left-0 top-full mt-2
              w-[480px] p-5 rounded-lg
              bg-white shadow-lg border border-gray-100
              z-50
              max-h-[650px] overflow-y-auto
              no-scrollbar
            ">
              {/* Seta do tooltip */}
              <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
              
              {/* Conteúdo do tooltip */}
              <div className="relative">
                <h3 className="font-medium text-gray-900 mb-3">
                  {helpData.companyManagement.title}
                </h3>
                
                <div className="text-sm text-gray-600 space-y-5 pr-2">
                  <div>
                    <p className="leading-relaxed">
                      {helpData.companyManagement.description}
                    </p>
                    
                    <p className="leading-relaxed text-gray-500 italic text-xs mt-2">
                      {helpData.companyManagement.importance}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100">
                    <span className="block text-xs font-medium text-gray-900 mb-2">
                      Campos do Formulário:
                    </span>
                    <ul className="text-xs space-y-2">
                      {Object.entries(helpData.companyManagement.fields)
                        .map(([key, field]) => (
                          <li key={key} className="flex items-start gap-2">
                            <span className="text-blue-500/80">•</span>
                            <div>
                              <span className="font-medium">{field.title}</span>
                              <div className="text-gray-500 text-[11px] leading-relaxed">
                                <p>{field.importance}</p>
                                {field.placeholder && (
                                  <p className="text-blue-500/70 mt-1">
                                    {field.placeholder}
                                  </p>
                                )}
                                {field.example && (
                                  <p className="text-gray-400 italic mt-0.5">
                                    {field.example}
                                  </p>
                                )}
                                {field.options && (
                                  <p className="text-gray-400 mt-0.5">
                                    Opções: {field.options.join(", ")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <span className="block text-xs font-medium text-gray-900 mb-2">
                      Validações:
                    </span>
                    <ul className="text-xs space-y-1">
                      {Object.entries(helpData.companyManagement.validations).map(([field, rule]) => (
                        <li key={field} className="text-gray-500">
                          <span className="font-medium text-gray-700">{field}:</span> {rule}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <span className="block text-xs font-medium text-gray-900 mb-2">
                      Ações Disponíveis:
                    </span>
                    <ul className="text-xs space-y-1">
                      {Object.entries(helpData.companyManagement.actions).map(([action, description]) => (
                        <li key={action} className="text-gray-500">
                          <span className="font-medium text-gray-700">{action}:</span> {description}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          <button
            onClick={() => setIsAddingCompany(!isAddingCompany)}
            className="text-white px-4 py-2 rounded-md hover:opacity-80 transition-all flex items-center gap-2 text-sm"
            style={{ backgroundColor: buttonColor }}
          >
            <Plus size={16} className="stroke-[1.5]" />
            {isAddingCompany ? 'Cancelar' : 'Adicionar Nova Empresa'}
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
            <Filter size={16} className="stroke-[1.5] opacity-70" />
            <span className="font-medium text-sm">Filtros</span>
          </div>
          {isFilterExpanded ? 
            <ChevronUp size={16} className="stroke-[1.5] opacity-70" /> : 
            <ChevronDown size={16} className="stroke-[1.5] opacity-70" />
          }
        </button>
        
        {isFilterExpanded && (
          <div className="p-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">CNPJ</label>
                <input
                  type="text"
                  value={filters.cnpj}
                  onChange={(e) => handleFilterChange('cnpj', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                  style={{ focusRing: buttonColor }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Filtrar por Nome"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  name="trade_name"
                  value={filters.trade_name}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Filtrar por Nome Fantasia"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Filtrar por Cidade"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <input
                  type="text"
                  name="state"
                  value={filters.state}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Filtrar por Estado"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="is_active"
                  value={filters.is_active}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Todos</option>
                  <option value="sim">Ativo</option>
                  <option value="não">Inativo</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setFilters({
                  cnpj: '',
                  name: '',
                  trade_name: '',
                  city: '',
                  state: '',
                  is_active: ''
                })}
                className="px-4 py-2 text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {(isAddingCompany || editingCompany) && (
        <div className="mt-4 p-6 bg-gray-50 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold mb-4">
            {editingCompany ? 'Editar Empresa' : 'Adicionar Nova Empresa'}
          </h3>
          
          <div className={gridStyle}>
            <div>
                <label className={labelStyle}>
                    CNPJ
                    <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </label>
                <input
                    type="text"
                    value={editingCompany ? editingCompany.cnpj : newCompany.cnpj}
                    onChange={(e) => editingCompany 
                        ? setEditingCompany({...editingCompany, cnpj: e.target.value})
                        : setNewCompany({...newCompany, cnpj: e.target.value})}
                    placeholder="CNPJ"
                    className={inputStyle}
                    required
                />
            </div>

            <div>
                <label className={labelStyle}>
                    Nome da Empresa
                    <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </label>
                <input
                    type="text"
                    value={editingCompany ? editingCompany.name : newCompany.name}
                    onChange={(e) => editingCompany
                        ? setEditingCompany({...editingCompany, name: e.target.value})
                        : setNewCompany({...newCompany, name: e.target.value})}
                    placeholder="Nome da Empresa"
                    className={inputStyle}
                    required
                />
            </div>

            <div>
                <label className={labelStyle}>
                    Data de Registro
                    <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
                </label>
                <input
                    type="date"
                    value={editingCompany ? editingCompany.registration_date : newCompany.registration_date}
                    onChange={(e) => editingCompany
                        ? setEditingCompany({...editingCompany, registration_date: e.target.value})
                        : setNewCompany({...newCompany, registration_date: e.target.value})}
                    className={inputStyle}
                    required
                />
            </div>

            <div>
                <label className={labelStyle}>Razão Social</label>
                <input
                    type="text"
                    value={editingCompany ? editingCompany.razao_social : newCompany.razao_social}
                    onChange={(e) => editingCompany
                        ? setEditingCompany({...editingCompany, razao_social: e.target.value})
                        : setNewCompany({...newCompany, razao_social: e.target.value})}
                    placeholder="Razão Social"
                    className={inputStyle}
                />
            </div>

            <div>
                <label className={labelStyle}>Endereço</label>
                <input
                    type="text"
                    value={editingCompany ? editingCompany.endereco : newCompany.endereco}
                    onChange={(e) => editingCompany
                        ? setEditingCompany({...editingCompany, endereco: e.target.value})
                        : setNewCompany({...newCompany, endereco: e.target.value})}
                    placeholder="Endereço"
                    className={inputStyle}
                />
            </div>

            <div>
                <label className={labelStyle}>Nome Fantasia</label>
                <input
                    type="text"
                    value={editingCompany ? editingCompany.trade_name : newCompany.trade_name}
                    onChange={(e) => editingCompany
                        ? setEditingCompany({...editingCompany, trade_name: e.target.value})
                        : setNewCompany({...newCompany, trade_name: e.target.value})}
                    placeholder="Nome Fantasia"
                    className={inputStyle}
                />
            </div>

            <div>
                <label className={labelStyle}>Setor</label>
                <select
                    value={editingCompany ? editingCompany.sector : newCompany.sector}
                    onChange={(e) => editingCompany
                        ? setEditingCompany({...editingCompany, sector: e.target.value})
                        : setNewCompany({...newCompany, sector: e.target.value})}
                    className={`${inputStyle} bg-white`}
                >
                    <option value="">Selecione o Setor</option>
                    {sectorOptions.map((sector) => (
                        <option key={sector} value={sector}>{sector}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className={labelStyle}>Tamanho</label>
                <select
                    value={editingCompany ? editingCompany.size : newCompany.size}
                    onChange={(e) => editingCompany
                        ? setEditingCompany({...editingCompany, size: e.target.value})
                        : setNewCompany({...newCompany, size: e.target.value})}
                    className={inputStyle}
                >
                    <option value="">Selecione o Tamanho</option>
                    {sizeOptions.map((size) => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className={labelStyle}>Cidade</label>
                <input
                    type="text"
                    value={editingCompany ? editingCompany.city : newCompany.city}
                    onChange={(e) => editingCompany
                        ? setEditingCompany({...editingCompany, city: e.target.value})
                        : setNewCompany({...newCompany, city: e.target.value})}
                    placeholder="Cidade"
                    className={inputStyle}
                />
            </div>

            <div>
                <label className={labelStyle}>Estado</label>
                <input
                    type="text"
                    value={editingCompany ? editingCompany.state : newCompany.state}
                    onChange={(e) => editingCompany
                        ? setEditingCompany({...editingCompany, state: e.target.value})
                        : setNewCompany({...newCompany, state: e.target.value})}
                    placeholder="Estado"
                    className={inputStyle}
                />
            </div>

            <div>
                <label className={labelStyle}>CEP</label>
                <input
                    type="text"
                    value={editingCompany ? editingCompany.zip_code : newCompany.zip_code}
                    onChange={(e) => editingCompany
                        ? setEditingCompany({...editingCompany, zip_code: e.target.value})
                        : setNewCompany({...newCompany, zip_code: e.target.value})}
                    placeholder="CEP"
                    className={inputStyle}
                />
            </div>

            <div>
                <label className={labelStyle}>Telefone</label>
                <input
                    type="text"
                    value={editingCompany ? editingCompany.phone : newCompany.phone}
                    onChange={(e) => editingCompany
                        ? setEditingCompany({...editingCompany, phone: e.target.value})
                        : setNewCompany({...newCompany, phone: e.target.value})}
                    placeholder="Telefone"
                    className={inputStyle}
                />
            </div>

            <div>
                <label className={labelStyle}>Email</label>
                <input
                    type="email"
                    value={editingCompany ? editingCompany.email : newCompany.email}
                    onChange={(e) => handleEmailChange(e, !!editingCompany)}
                    placeholder="Email"
                    className={`${inputStyle} ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.email && (
                    <span className="text-red-500 text-sm">{errors.email}</span>
                )}
            </div>

            <div>
                <label className={labelStyle}>Website</label>
                <input
                    type="url"
                    value={editingCompany ? editingCompany.website : newCompany.website}
                    onChange={(e) => handleWebsiteChange(e, !!editingCompany)}
                    placeholder="Website"
                    className={`${inputStyle} ${
                        errors.website ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.website && (
                    <span className="text-red-500 text-sm">{errors.website}</span>
                )}
            </div>

            <div className="mb-2">
                <label className="inline-flex items-center">
                    <input
                        type="checkbox"
                        checked={editingCompany ? editingCompany.is_active : newCompany.is_active}
                        onChange={(e) => editingCompany
                            ? setEditingCompany({...editingCompany, is_active: e.target.checked})
                            : setNewCompany({...newCompany, is_active: e.target.checked})}
                        className="form-checkbox h-5 w-5"
                        style={{ 
                            borderColor: buttonColor,
                            color: buttonColor 
                        }}
                    />
                    <span className="ml-2 text-gray-700">Ativo</span>
                </label>
            </div>

            <div className="col-span-full flex justify-end space-x-2 mt-4">
                <button
                    onClick={editingCompany ? handleUpdateCompany : handleAddCompany}
                    className="text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all"
                    style={{ backgroundColor: buttonColor }}
                >
                    {editingCompany ? 'Atualizar' : 'Adicionar'}
                </button>
                <button
                    onClick={() => {
                        setIsAddingCompany(false);
                        setEditingCompany(null);
                    }}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all"
                >
                    Cancelar
                </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        <table className="w-full bg-white border border-gray-100 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th 
                className="h-10 px-4 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group whitespace-nowrap"
                onClick={() => handleSort('cnpj')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1 h-full">
                  <span>CNPJ</span>
                  <span className="transition-opacity">
                    {renderSortIcon('cnpj')}
                  </span>
                </div>
              </th>
              <th 
                className="h-10 px-4 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group whitespace-nowrap"
                onClick={() => handleSort('name')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1 h-full">
                  <span>Nome</span>
                  <span className="transition-opacity">
                    {renderSortIcon('name')}
                  </span>
                </div>
              </th>
              <th 
                className="h-10 px-4 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group hidden md:table-cell whitespace-nowrap"
                onClick={() => handleSort('trade_name')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1 h-full">
                  <span>Nome Fantasia</span>
                  <span className="transition-opacity">
                    {renderSortIcon('trade_name')}
                  </span>
                </div>
              </th>
              <th 
                className="h-10 px-4 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group hidden sm:table-cell whitespace-nowrap"
                onClick={() => handleSort('city')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1 h-full">
                  <span>Cidade</span>
                  <span className="transition-opacity">
                    {renderSortIcon('city')}
                  </span>
                </div>
              </th>
              <th 
                className="h-10 px-4 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group hidden sm:table-cell whitespace-nowrap"
                onClick={() => handleSort('state')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1 h-full">
                  <span>Estado</span>
                  <span className="transition-opacity">
                    {renderSortIcon('state')}
                  </span>
                </div>
              </th>
              <th 
                className="h-10 px-4 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group whitespace-nowrap"
                onClick={() => handleSort('is_active')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1 h-full">
                  <span>Ativo</span>
                  <span className="transition-opacity">
                    {renderSortIcon('is_active')}
                  </span>
                </div>
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-center text-sm font-medium text-gray-600"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {sortData(getCurrentPageItems(), sortConfig.key, sortConfig.direction).map((company) => (
              <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  {company.cnpj}
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  {company.name}
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600 hidden md:table-cell">
                  {company.trade_name}
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600 hidden sm:table-cell">
                  {company.city}
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600 hidden sm:table-cell">
                  {company.state}
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  {company.is_active ? 'Sim' : 'Não'}
                </td>
                <td className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setEditingCompany(company)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Editar"
                    >
                      <Pen size={16} className="stroke-[1.5]" />
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Excluir"
                    >
                      <Trash size={16} className="stroke-[1.5]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4 px-4">
          <div className="text-sm text-gray-600">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredCompanies.length)} de {filteredCompanies.length} registros
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} className="stroke-[1.5]" />
            </button>
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} className="stroke-[1.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyManagement;
