import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
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

  useEffect(() => {
    console.log('Estado atual do newProject:', newProject);
  }, [newProject]);

  useEffect(() => {
    fetchProjects();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/companies`);
      console.log('Companies data:', response.data);
      setCompanies(response.data);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
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

      // Preparar dados para envio
      const formData = {
        ...newProject,
        company_id: parseInt(newProject.company_id),
        budget_allocated: parseFloat(newProject.budget_allocated),
        progress_percentage: parseFloat(newProject.progress_percentage),
        ...odsValues // Sobrescrever com valores ODS formatados
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Projeto
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa
            </label>
            <select
              name="company_id"
              value={newProject.company_id}
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
              Tipo de Projeto
            </label>
            <select
              name="project_type"
              value={newProject.project_type}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">Selecione o Tipo</option>
              <option value="Environmental">Ambiental</option>
              <option value="Social">Social</option>
              <option value="Governance">Governança</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Início
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Término
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orçamento
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Moeda
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progresso (%)
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data da Última Auditoria
            </label>
            <input
              type="date"
              name="last_audit_date"
              value={newProject.last_audit_date}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impacto Esperado
            </label>
            <textarea
              name="expected_impact"
              value={newProject.expected_impact}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              rows="3"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impacto Real
            </label>
            <textarea
              name="actual_impact"
              value={newProject.actual_impact}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              rows="3"
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

  // Adicione esta função helper no início do componente
  const truncateText = (text, maxLength = 15) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projetos ESG</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 text-white rounded flex items-center"
          style={{ backgroundColor: buttonColor }}
        >
          <FaPlus className="mr-2" /> Novo Projeto
        </button>
      </div>

      {isFormOpen && renderForm()}

      {/* Tabela de projetos */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Nome</th>
              <th className="px-4 py-2 border">Empresa</th>
              <th className="px-4 py-2 border">Tipo</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Progresso</th>
              <th className="px-4 py-2 border">Orçamento</th>
              <th className="px-4 py-2 border">Data Início</th>
              <th className="px-4 py-2 border">Data Fim</th>
              <th className="px-4 py-2 border">Impacto Esperado</th>
              <th className="px-4 py-2 border">Impacto Real</th>
              <th className="px-4 py-2 border">Última Auditoria</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan="12" className="px-4 py-2 text-center border">
                  Nenhum projeto encontrado
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-4 py-2 border">
                    <div>
                      <div>{project.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        <div className="flex flex-wrap gap-1">
                          {[...Array(17)].map((_, index) => {
                            const odsValue = project[`ods${index + 1}`];
                            if (odsValue > 0) {
                              return (
                                <span 
                                  key={index} 
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                  title={`ODS ${index + 1}: ${getODSLabel(odsValue)}`}
                                >
                                  {index + 1}
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 border">
                    {companies.find(c => c.id === project.company_id)?.name}
                  </td>
                  <td className="px-4 py-2 border">{project.project_type}</td>
                  <td className="px-4 py-2 border">
                    {project.status === "Em Andamento" ? "Em andamento" : project.status}
                  </td>
                  <td className="px-4 py-2 border">{project.progress_percentage}%</td>
                  <td className="px-4 py-2 border">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: project.currency
                    }).format(project.budget_allocated)}
                  </td>
                  <td className="px-4 py-2 border">
                    {new Date(project.start_date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-2 border">
                    {new Date(project.end_date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-2 border" title={project.expected_impact || '-'}>
                    {truncateText(project.expected_impact)}
                  </td>
                  <td className="px-4 py-2 border" title={project.actual_impact || '-'}>
                    {truncateText(project.actual_impact)}
                  </td>
                  <td className="px-4 py-2 border">
                    {project.last_audit_date 
                      ? new Date(project.last_audit_date).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ESGProjects;