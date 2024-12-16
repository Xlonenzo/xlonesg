import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaExclamationCircle, FaFilter, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL } from '../config';

// Helper para gerenciar valores ODS
const ODSHelper = {
  validValues: [0, 0.5, 1, 1.5, 2],
  
  // Gera objeto com todos os ODS zerados
  getEmptyODS() {
    return Array.from({length: 17}, (_, i) => [`ods${i + 1}`, 0])
      .reduce((acc, [key, value]) => ({...acc, [key]: value}), {});
  },
  
  // Formata número para 2 casas decimais
  formatNumber(value) {
    if (value === null || value === undefined) return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : parseFloat(num.toFixed(2));
  },
  
  // Formata e valida valores ODS
  formatValues(project) {
    const odsValues = {};
    
    for (let i = 1; i <= 17; i++) {
      const key = `ods${i}`;
      const value = this.formatNumber(project[key]);
      
      if (!this.validValues.includes(value)) {
        console.warn(`Valor inválido para ${key}: ${value}, usando 0`);
        odsValues[key] = 0;
      } else {
        odsValues[key] = value;
      }
    }
    
    return odsValues;
  },
  
  // Verifica se os valores foram salvos corretamente
  validateSavedValues(sent, received) {
    if (!received) {
      console.error('Resposta do servidor está vazia');
      return false;
    }

    const comparison = {};
    let hasErrors = false;
    
    for (let i = 1; i <= 17; i++) {
      const key = `ods${i}`;
      const sentValue = this.formatNumber(sent[key]);
      const receivedValue = this.formatNumber(received[key]);
      
      comparison[key] = {
        sent: sentValue,
        received: receivedValue,
        match: Math.abs(sentValue - receivedValue) < 0.01 // Tolerância para diferenças de arredondamento
      };
      
      if (!comparison[key].match) {
        hasErrors = true;
        console.error(`Erro no ${key}:`, {
          enviado: sentValue,
          recebido: receivedValue,
          tipoEnviado: typeof sent[key],
          tipoRecebido: typeof received[key]
        });
      }
    }
    
    console.log('Comparação completa:', comparison);
    return !hasErrors;
  }
};

const PROJECT_TYPES = {
  AMBIENTAL: 'Ambiental',
  SOCIAL: 'Social',
  GOVERNANCA: 'Governança'
};

function ESGProjects({ sidebarColor, buttonColor }) {
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    company_id: '',
    project_type: '',
    start_date: '',
    end_date: '',
    budget_allocated: 0,
    currency: 'BRL',
    status: '',
    progress_percentage: 0,
    expected_impact: '',
    actual_impact: '',
    last_audit_date: '',
    ods1: 0,
    ods2: 0,
    ods3: 0,
    ods4: 0,
    ods5: 0,
    ods6: 0,
    ods7: 0,
    ods8: 0,
    ods9: 0,
    ods10: 0,
    ods11: 0,
    ods12: 0,
    ods13: 0,
    ods14: 0,
    ods15: 0,
    ods16: 0,
    ods17: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(10);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Estados dos filtros
  const [filters, setFilters] = useState({
    name: '',
    company_id: '',
    project_type: '',
    status: ''
  });

  // Função para lidar com mudanças nos filtros
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
  };

  // Aplicar filtros aos projetos
  const filteredProjects = projects.filter(project => {
    return (
      project.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      (filters.company_id === '' || project.company_id.toString() === filters.company_id) &&
      (filters.project_type === '' || project.project_type === filters.project_type) &&
      (filters.status === '' || project.status === filters.status)
    );
  });

  // Calcular projetos da página atual (usando projetos filtrados)
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

  useEffect(() => {
    console.log('Estado atual do newProject:', newProject);
  }, [newProject]);

  useEffect(() => {
    fetchProjects();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true
      };

      const response = await axios.get(`${API_URL}/companies`, config);
      console.log('Companies data:', response.data);
      setCompanies(response.data);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      console.error('Detalhes do erro:', error.response?.data);
      setCompanies([]);
    }
  };

  const fetchProjects = async () => {
    try {
      console.log('Iniciando busca de projetos...');
      setLoading(true);
      
      const response = await axios.get(`${API_URL}/project-tracking`);
      console.log('Resposta da API:', response);
      console.log('Dados recebidos:', response.data);
      
      if (Array.isArray(response.data)) {
        setProjects(response.data);
        console.log('Projetos atualizados no estado:', response.data);
      } else {
        console.error('Resposta não é um array:', response.data);
        setProjects([]);
      }
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      console.error('Detalhes do erro:', error.response?.data);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Simplificação do handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Formatar valores ODS
      const odsValues = ODSHelper.formatValues(newProject);
      console.log('Valores ODS formatados:', odsValues);

      // Preparar dados para envio - removendo campos inválidos
      const formData = {
        name: newProject.name,
        company_id: parseInt(newProject.company_id),
        project_type: newProject.project_type,
        start_date: newProject.start_date,
        end_date: newProject.end_date,
        budget_allocated: parseFloat(newProject.budget_allocated),
        currency: newProject.currency,
        status: newProject.status,
        progress_percentage: parseFloat(newProject.progress_percentage),
        expected_impact: newProject.expected_impact,
        actual_impact: newProject.actual_impact,
        last_audit_date: newProject.last_audit_date,
        // Adicionar valores ODS individualmente
        ods1: odsValues.ods1,
        ods2: odsValues.ods2,
        ods3: odsValues.ods3,
        ods4: odsValues.ods4,
        ods5: odsValues.ods5,
        ods6: odsValues.ods6,
        ods7: odsValues.ods7,
        ods8: odsValues.ods8,
        ods9: odsValues.ods9,
        ods10: odsValues.ods10,
        ods11: odsValues.ods11,
        ods12: odsValues.ods12,
        ods13: odsValues.ods13,
        ods14: odsValues.ods14,
        ods15: odsValues.ods15,
        ods16: odsValues.ods16,
        ods17: odsValues.ods17
      };

      console.log('Dados completos para envio:', formData);

      // Enviar requisição
      const url = `${API_URL}/project-tracking${editingProject ? `/${editingProject.id}` : ''}`;
      const method = editingProject ? 'put' : 'post';
      
      console.log(`Enviando ${method.toUpperCase()} para ${url}`);
      
      const response = await axios[method](url, formData);
      
      console.log('Resposta do servidor:', response.data);

      // Validar resposta
      if (!response.data) {
        throw new Error('Resposta vazia do servidor');
      }

      // Atualizar UI
      await fetchProjects();
      setIsFormOpen(false);
      setEditingProject(null);
      setNewProject({
        name: '',
        company_id: '',
        project_type: '',
        start_date: '',
        end_date: '',
        budget_allocated: 0,
        currency: 'BRL',
        status: '',
        progress_percentage: 0,
        expected_impact: '',
        actual_impact: '',
        last_audit_date: '',
        ...ODSHelper.getEmptyODS()
      });

      alert(editingProject ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!');
    } catch (error) {
      console.error('Erro detalhado:', error);
      console.error('Resposta do servidor:', error.response?.data);
      alert(error.message || 'Erro ao salvar projeto');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Nome do Projeto
              <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} title="Campo obrigatório" />
            </label>
            <input
              type="text"
              name="name"
              value={newProject.name}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Empresa
              <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} title="Campo obrigatório" />
            </label>
            <select
              name="company_id"
              value={newProject.company_id}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">Selecione uma empresa</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Tipo de Projeto
              <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} title="Campo obrigatório" />
            </label>
            <select
              name="project_type"
              value={newProject.project_type}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">Selecione o tipo</option>
              {Object.values(PROJECT_TYPES).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Status
              <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} title="Campo obrigatório" />
            </label>
            <select
              name="status"
              value={newProject.status}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">Selecione o Status</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Planejado">Planejado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Data de Início
              <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} title="Campo obrigatório" />
            </label>
            <input
              type="date"
              name="start_date"
              value={newProject.start_date}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Data de Término
              <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} title="Campo obrigatório" />
            </label>
            <input
              type="date"
              name="end_date"
              value={newProject.end_date}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Orçamento
              <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} title="Campo obrigatório" />
            </label>
            <input
              type="number"
              name="budget_allocated"
              value={newProject.budget_allocated}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Moeda
              <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} title="Campo obrigatório" />
            </label>
            <select
              name="currency"
              value={newProject.currency}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            >
              <option value="BRL">Real (BRL)</option>
              <option value="USD">Dólar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Progresso (%)
              <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} title="Campo obrigatório" />
            </label>
            <input
              type="number"
              name="progress_percentage"
              value={newProject.progress_percentage}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Data da Última Auditoria
              <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} title="Campo obrigatório" />
            </label>
            <input
              type="date"
              name="last_audit_date"
              value={newProject.last_audit_date}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Impacto Esperado
              <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} title="Campo obrigatório" />
            </label>
            <textarea
              name="expected_impact"
              value={newProject.expected_impact}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              rows="3"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Impacto Real
              <FaExclamationCircle className="ml-1 text-red-500 opacity-60" size={12} title="Campo obrigatório" />
            </label>
            <textarea
              name="actual_impact"
              value={newProject.actual_impact}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              rows="3"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <h3 className="text-lg font-semibold col-span-full">Contribuição para ODS</h3>
          
          {[
            { num: 1, name: "Erradicação da Pobreza" },
            { num: 2, name: "Fome Zero e Agricultura Sustentável" },
            { num: 3, name: "Saúde e Bem-Estar" },
            { num: 4, name: "Educação de Qualidade" },
            { num: 5, name: "Igualdade de Gênero" },
            { num: 6, name: "Água Potável e Saneamento" },
            { num: 7, name: "Energia Limpa e Acessível" },
            { num: 8, name: "Trabalho Decente e Crescimento Econômico" },
            { num: 9, name: "Indústria, Inovação e Infraestrutura" },
            { num: 10, name: "Redução das Desigualdades" },
            { num: 11, name: "Cidades e Comunidades Sustentáveis" },
            { num: 12, name: "Consumo e Produção Responsáveis" },
            { num: 13, name: "Ação Contra a Mudança Global do Clima" },
            { num: 14, name: "Vida na Água" },
            { num: 15, name: "Vida Terrestre" },
            { num: 16, name: "Paz, Justiça e Instituições Eficazes" },
            { num: 17, name: "Parcerias e Meios de Implementação" }
          ].map(ods => (
            <div 
              key={ods.num} 
              className="flex flex-col space-y-2 p-4 border rounded-lg hover:shadow-md transition-all duration-200 group relative"
              title={`ODS ${ods.num}: ${ods.name}`}
              style={{
                borderColor: newProject[`ods${ods.num}`] > 0 ? '#4CAF50' : '#E5E7EB',
                backgroundColor: newProject[`ods${ods.num}`] > 0 ? '#F0FFF4' : 'white'
              }}
            >
              <div className="flex items-start space-x-3">
                <img 
                  src={`/SDG-${ods.num}.svg`} 
                  alt={`ODS ${ods.num}`}
                  className="w-16 h-16 object-contain"
                  style={{ minWidth: '64px' }}
                />
                <label className="text-sm font-medium text-gray-700 flex-1">
                  {ods.num}. {ods.name}
                </label>
              </div>
              <select
                value={newProject[`ods${ods.num}`].toString()}
                onChange={(e) => handleODSChange(ods.num, e.target.value)}
                className="p-2 border rounded w-full mt-2 transition-colors duration-200"
                style={{
                  borderColor: parseFloat(newProject[`ods${ods.num}`]) > 0 ? '#4CAF50' : '#E5E7EB',
                  backgroundColor: parseFloat(newProject[`ods${ods.num}`]) > 0 ? '#F0FFF4' : 'white'
                }}
              >
                <option value="0">0.0 - Não Aplicável</option>
                <option value="0.5">0.5 - Baixa Contribuição</option>
                <option value="1">1.0 - Contribuição Média</option>
                <option value="1.5">1.5 - Alta Contribuição</option>
                <option value="2">2.0 - Contribuição Muito Alta</option>
              </select>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white rounded"
            style={{ backgroundColor: buttonColor }}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsFormOpen(false);
              setEditingProject(null);
              setNewProject({
                name: '',
                company_id: '',
                project_type: '',
                start_date: '',
                end_date: '',
                budget_allocated: 0,
                currency: 'BRL',
                status: '',
                progress_percentage: 0,
                expected_impact: '',
                actual_impact: '',
                last_audit_date: '',
                ods1: 0,
                ods2: 0,
                ods3: 0,
                ods4: 0,
                ods5: 0,
                ods6: 0,
                ods7: 0,
                ods8: 0,
                ods9: 0,
                ods10: 0,
                ods11: 0,
                ods12: 0,
                ods13: 0,
                ods14: 0,
                ods15: 0,
                ods16: 0,
                ods17: 0
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
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (project) => {
    console.log('handleEdit - Projeto original recebido:', project);
    setEditingProject(project);
    
    const updatedProject = {
      name: project.name,
      company_id: project.company_id.toString(),
      project_type: project.project_type,
      start_date: project.start_date.split('T')[0],
      end_date: project.end_date.split('T')[0],
      budget_allocated: project.budget_allocated,
      currency: project.currency,
      status: project.status,
      progress_percentage: project.progress_percentage,
      expected_impact: project.expected_impact || '',
      actual_impact: project.actual_impact || '',
      last_audit_date: project.last_audit_date ? project.last_audit_date.split('T')[0] : '',
      ods1: Number(project.ods1 || 0),
      ods2: Number(project.ods2 || 0),
      ods3: Number(project.ods3 || 0),
      ods4: Number(project.ods4 || 0),
      ods5: Number(project.ods5 || 0),
      ods6: Number(project.ods6 || 0),
      ods7: Number(project.ods7 || 0),
      ods8: Number(project.ods8 || 0),
      ods9: Number(project.ods9 || 0),
      ods10: Number(project.ods10 || 0),
      ods11: Number(project.ods11 || 0),
      ods12: Number(project.ods12 || 0),
      ods13: Number(project.ods13 || 0),
      ods14: Number(project.ods14 || 0),
      ods15: Number(project.ods15 || 0),
      ods16: Number(project.ods16 || 0),
      ods17: Number(project.ods17 || 0)
    };
    
    console.log('handleEdit - Estado atualizado a ser definido:', updatedProject);
    setNewProject(updatedProject);
    setIsFormOpen(true);
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto?')) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/project-tracking/${projectId}`);
      fetchProjects();
      alert('Projeto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      alert('Erro ao excluir projeto. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Simplificação do handleODSChange
  const handleODSChange = (odsNumber, value) => {
    const numValue = parseFloat(value);
    
    if (!ODSHelper.validValues.includes(numValue)) {
      console.error(`Valor inválido para ODS${odsNumber}: ${value}`);
      return;
    }
    
    setNewProject(prev => ({
      ...prev,
      [`ods${odsNumber}`]: numValue
    }));
  };

  const getODSLabel = (value) => {
    if (value === 0) return "Não Aplicável";
    if (value === 0.5) return "Baixa Contribuição";
    if (value === 1) return "Contribuição Média";
    if (value === 1.5) return "Alta Contribuição";
    if (value === 2) return "Contribuição Muito Alta";
    return "Desconhecido";
  };

  // Adicionar função handlePageChange
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projetos ESG</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 rounded text-white flex items-center gap-2 hover:opacity-80"
          style={{ backgroundColor: buttonColor }}
        >
          <FaPlus className="mr-2" /> Novo Projeto
        </button>
      </div>

      {isFormOpen && renderForm()}

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
              <label className="block text-sm font-medium text-gray-600 mb-1">Nome do Projeto</label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                placeholder="Filtrar por nome"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Empresa</label>
              <select
                value={filters.company_id}
                onChange={(e) => handleFilterChange('company_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
              >
                <option value="">Todas as empresas</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Projeto</label>
              <select
                value={filters.project_type}
                onChange={(e) => handleFilterChange('project_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
              >
                <option value="">Todos os tipos</option>
                <option value="Ambiental">Ambiental</option>
                <option value="Social">Social</option>
                <option value="Governança">Governança</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
              >
                <option value="">Todos os status</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluído">Concluído</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tabela ajustada */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Nome / ODS
              </th>
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
                Status
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Progresso
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Orçamento
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Período
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
            {currentProjects.length === 0 ? (
              <tr className="hover:bg-gray-50 transition-colors">
                <td colSpan="8" className="px-4 py-3 border-b border-gray-100 text-center text-sm text-gray-600">
                  Nenhum projeto encontrado
                </td>
              </tr>
            ) : (
              currentProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          <div className="flex flex-wrap gap-1">
                            {Array.from({ length: 17 }, (_, i) => {
                              const odsNumber = i + 1;
                              const odsKey = `ods${odsNumber}`;
                              const odsValue = parseFloat(project[odsKey] || 0);
                              
                              if (odsValue > 0) {
                                return (
                                  <span 
                                    key={odsNumber} 
                                    className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium"
                                    title={`ODS ${odsNumber}: ${getODSLabel(odsValue)}`}
                                  >
                                    {odsNumber}
                                  </span>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900">
                      {companies.find(c => c.id === project.company_id)?.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900">{project.project_type}</div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${project.status === 'Em Andamento' ? 'bg-blue-100 text-blue-800' : 
                          project.status === 'Concluído' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {project.status === "Em Andamento" ? "Em andamento" : project.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900">{project.progress_percentage}%</div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: project.currency
                      }).format(project.budget_allocated)}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900">
                      <div>{new Date(project.start_date).toLocaleDateString('pt-BR')}</div>
                      <div className="text-gray-500">até</div>
                      <div>{new Date(project.end_date).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEdit(project)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Editar"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Excluir"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {!isFormOpen && filteredProjects.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
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
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredProjects.length / projectsPerPage)}
              className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                currentPage === Math.ceil(filteredProjects.length / projectsPerPage)
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
                Mostrando <span className="font-medium">{indexOfFirstProject + 1}</span> até{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastProject, filteredProjects.length)}
                </span>{' '}
                de <span className="font-medium">{filteredProjects.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                    currentPage === 1 ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft size={16} className="stroke-[1.5]" />
                </button>
                {Array.from(
                  { length: Math.ceil(filteredProjects.length / projectsPerPage) },
                  (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
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
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(filteredProjects.length / projectsPerPage)}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                    currentPage === Math.ceil(filteredProjects.length / projectsPerPage)
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
      )}
    </div>
  );
}

export default ESGProjects;