import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, Filter as FaFilter, Sprout } from 'lucide-react';
import { API_URL } from '../config';

function EnvironmentalImpactStudy({ sidebarColor, buttonColor }) {
  const [impactStudies, setImpactStudies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudy, setEditingStudy] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studiesPerPage] = useState(10);
  const [environmentalDocuments, setEnvironmentalDocuments] = useState([]);

  const [newStudy, setNewStudy] = useState({
    environmental_documentid: '',
    enterprisename: '',
    projectlocation: '',
    activitydescription: '',
    physical_environment: '',
    biological_environment: '',
    socioeconomic_environment: '',
    considered_alternatives: '',
    positive_impacts: '',
    negative_impacts: '',
    impact_magnitude: '',
    impact_significance: '',
    mitigation_measures: '',
    mitigation_effectiveness: '',
    monitoring_plan: '',
    monitoring_indicators: '',
    legal_conformity: '',
    public_dissemination: '',
    public_consultation: ''
  });

  // Adicionar novo estado para filtros
  const [filters, setFilters] = useState({
    environmental_documentid: '',
    projectlocation: ''
  });

  // Adicionar novo estado no início do componente
  const [showTooltip, setShowTooltip] = useState(false);

  // Buscar estudos de impacto
  const fetchImpactStudies = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/environmental-impact-studies`);
      setImpactStudies(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar estudos:', err);
      setError('Falha ao carregar os estudos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar documentos ambientais para o select
  const fetchEnvironmentalDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/environmental-documents`);
      setEnvironmentalDocuments(response.data);
    } catch (err) {
      console.error('Erro ao buscar documentos:', err);
    }
  };

  useEffect(() => {
    fetchImpactStudies();
    fetchEnvironmentalDocuments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudy(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função de validação
  const validateDescription = async (description) => {
    try {
      const response = await axios.post(`${API_URL}/environmental-impact-study/validate-description`, {
        text: description,
        required_aspects: [
          "Objetivos do projeto/empreendimento",
          "Dimensões (área, capacidade, volume)",
          "Características operacionais (tecnologia, período de operação)"
        ]
      });
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro na validação da descrição:', error);
      throw new Error('Falha ao validar a descrição. Por favor, tente novamente.');
    }
  };

  // Atualizar o handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validar apenas se houver descrição
      if (newStudy.activitydescription.trim()) {
        const validationResult = await validateDescription(newStudy.activitydescription);
        
        if (!validationResult.isValid) {
          const missingDetails = Object.entries(validationResult.analysis)
            .filter(([_, analysis]) => !analysis.present)
            .map(([aspect, analysis]) => (
              `• ${aspect}:\n  ${analysis.suggestion}`
            )).join('\n\n');

          const continueAnyway = window.confirm(
            `A descrição está incompleta. Recomendações de melhoria:\n\n${missingDetails}\n\n` +
            'Deseja salvar mesmo assim?'
          );

          if (!continueAnyway) {
            return;
          }
        }
      }

      // Prosseguir com o salvamento
      if (editingStudy) {
        await axios.put(`${API_URL}/environmental-impact-studies/${editingStudy.id}`, newStudy);
        alert('Estudo atualizado com sucesso!');
      } else {
        await axios.post(`${API_URL}/environmental-impact-studies`, newStudy);
        alert('Novo estudo adicionado com sucesso!');
      }

      // Resetar o formulário e atualizar a lista
      fetchImpactStudies();
      setIsFormOpen(false);  // Fecha o formulário
      setEditingStudy(null);
      setNewStudy({
        environmental_documentid: '',
        enterprisename: '',
        projectlocation: '',
        activitydescription: '',
        physical_environment: '',
        biological_environment: '',
        socioeconomic_environment: '',
        considered_alternatives: '',
        positive_impacts: '',
        negative_impacts: '',
        impact_magnitude: '',
        impact_significance: '',
        mitigation_measures: '',
        mitigation_effectiveness: '',
        monitoring_plan: '',
        monitoring_indicators: '',
        legal_conformity: '',
        public_dissemination: '',
        public_consultation: ''
      });

    } catch (error) {
      console.error('Erro:', error);
      alert(error.message || 'Erro ao salvar estudo. Por favor, tente novamente.');
    }
  };

  const handleEdit = (study) => {
    setEditingStudy(study);
    setNewStudy({
      environmental_documentid: study.environmental_documentid || '',
      enterprisename: study.enterprisename || '',
      projectlocation: study.projectlocation || '',
      activitydescription: study.activitydescription || '',
      physical_environment: study.physical_environment || '',
      biological_environment: study.biological_environment || '',
      socioeconomic_environment: study.socioeconomic_environment || '',
      considered_alternatives: study.considered_alternatives || '',
      positive_impacts: study.positive_impacts || '',
      negative_impacts: study.negative_impacts || '',
      impact_magnitude: study.impact_magnitude || '',
      impact_significance: study.impact_significance || '',
      mitigation_measures: study.mitigation_measures || '',
      mitigation_effectiveness: study.mitigation_effectiveness || '',
      monitoring_plan: study.monitoring_plan || '',
      monitoring_indicators: study.monitoring_indicators || '',
      legal_conformity: study.legal_conformity || '',
      public_dissemination: study.public_dissemination || '',
      public_consultation: study.public_consultation || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este estudo?')) {
      try {
        await axios.delete(`${API_URL}/environmental-impact-studies/${id}`);
        fetchImpactStudies();
        alert('Estudo excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir estudo:', error);
        alert('Erro ao excluir estudo. Por favor, tente novamente.');
      }
    }
  };

  // Adicionar handler para filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Adicionar a lógica de filtragem
  const filteredStudies = useMemo(() => {
    if (!impactStudies) return [];
    
    return impactStudies.filter(study => {
      const matchesSearch = !searchTerm || (
        study.enterprisename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.projectlocation?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesDocumentFilter = !filters.environmental_documentid || 
        study.environmental_documentid?.toString() === filters.environmental_documentid;

      const matchesLocationFilter = !filters.projectlocation || 
        study.projectlocation?.toLowerCase().includes(filters.projectlocation.toLowerCase());

      return matchesSearch && matchesDocumentFilter && matchesLocationFilter;
    });
  }, [impactStudies, searchTerm, filters]);

  // Calcular estudos atuais para paginação
  const indexOfLastStudy = currentPage * studiesPerPage;
  const indexOfFirstStudy = indexOfLastStudy - studiesPerPage;
  const currentStudies = filteredStudies.slice(indexOfFirstStudy, indexOfLastStudy);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Impacto Ambiental</h1>

      {/* Cabeçalho com botões e pesquisa */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => {
            setIsFormOpen(true); // Abre o formulário apenas ao clicar em Novo
            setEditingStudy(null);
            setNewStudy({
              environmental_documentid: '',
              enterprisename: '',
              projectlocation: '',
              activitydescription: '',
              physical_environment: '',
              biological_environment: '',
              socioeconomic_environment: '',
              considered_alternatives: '',
              positive_impacts: '',
              negative_impacts: '',
              impact_magnitude: '',
              impact_significance: '',
              mitigation_measures: '',
              mitigation_effectiveness: '',
              monitoring_plan: '',
              monitoring_indicators: '',
              legal_conformity: '',
              public_dissemination: '',
              public_consultation: ''
            });
          }}
          className="flex items-center text-white px-4 py-2 rounded hover:opacity-80"
          style={{ backgroundColor: buttonColor }}
        >
          <Plus size={20} className="mr-2" />
          Adicionar Novo Estudo
        </button>
        
        {/* Barra de pesquisa */}
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar estudos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 pl-8 border rounded"
          />
          <Search className="absolute left-2 top-3 text-gray-400" size={16} />
        </div>
      </div>

      {/* Renderização condicional do formulário */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Documento Ambiental
                  <select
                    name="environmental_documentid"
                    value={newStudy.environmental_documentid}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                  >
                    <option value="">Selecione um documento</option>
                    {environmentalDocuments.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.title}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome do Empreendimento
                  <input
                    type="text"
                    name="enterprisename"
                    value={newStudy.enterprisename}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Localização do Projeto
                  <input
                    type="text"
                    name="projectlocation"
                    value={newStudy.projectlocation}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                  />
                </label>
              </div>

              {/* Campo de Descrição da Atividade com validação IA */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2 relative">
                    <span>Descrição da Atividade</span>
                    <div 
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      <Sprout 
                        size={16} 
                        className="text-green-500 cursor-help"
                      />
                      {showTooltip && (
                        <div className="absolute z-50 w-80 p-4 bg-white border rounded-lg shadow-lg text-sm text-gray-700 left-0 ml-6">
                          <div className="font-medium mb-2">Este campo possui validação inteligente por IA</div>
                          <div className="space-y-3">
                            <div>
                              <div className="font-medium">Objetivos do projeto/empreendimento</div>
                              <div className="text-gray-600 text-xs italic">
                                Ex: "Construção de uma usina solar para geração de energia limpa"
                              </div>
                            </div>
                            
                            <div>
                              <div className="font-medium">Dimensões (área, capacidade, volume)</div>
                              <div className="text-gray-600 text-xs italic">
                                Ex: "Área total de 50 hectares, capacidade de geração de 100MW"
                              </div>
                            </div>
                            
                            <div>
                              <div className="font-medium">Características operacionais</div>
                              <div className="text-gray-600 text-xs italic">
                                Ex: "Utilização de painéis fotovoltaicos, operação 24/7"
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <textarea
                    name="activitydescription"
                    value={newStudy.activitydescription}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border rounded"
                    rows="6"
                    maxLength="800"
                    required
                    placeholder="Descreva a atividade incluindo:
• Objetivos do projeto/empreendimento
• Dimensões (área, capacidade, volume)
• Características operacionais (tecnologia, período de operação)"
                  />
                  <span className="text-xs text-gray-500">
                    {newStudy.activitydescription.length}/800 caracteres
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Diagnóstico Ambiental */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Diagnóstico Ambiental</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meio Físico
                  <textarea
                    name="physical_environment"
                    value={newStudy?.physical_environment || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border rounded"
                    rows="6"
                    maxLength="800"
                  />
                  <span className="text-xs text-gray-500">
                    {(newStudy?.physical_environment || '').length}/800 caracteres
                  </span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meio Biológico
                  <textarea
                    name="biological_environment"
                    value={newStudy?.biological_environment || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border rounded"
                    rows="6"
                    maxLength="800"
                  />
                  <span className="text-xs text-gray-500">
                    {(newStudy?.biological_environment || '').length}/800 caracteres
                  </span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meio Socioeconômico
                  <textarea
                    name="socioeconomic_environment"
                    value={newStudy.socioeconomic_environment}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border rounded"
                    rows="4"
                    placeholder="Descreva população, uso do solo e aspectos socioeconômicos"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Alternativas e Impactos */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Alternativas e Impactos</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Alternativas Consideradas
                  <textarea
                    name="considered_alternatives"
                    value={newStudy.considered_alternatives}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border rounded"
                    rows="6"
                    maxLength="800"
                    placeholder="Descreva as alternativas tecnológicas e locacionais consideradas"
                  />
                  <span className="text-xs text-gray-500">
                    {newStudy.considered_alternatives.length}/800 caracteres
                  </span>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Impactos Positivos
                    <textarea
                      name="positive_impacts"
                      value={newStudy.positive_impacts}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-2 border rounded"
                      rows="6"
                      maxLength="800"
                      placeholder="Liste os impactos positivos do projeto"
                    />
                    <span className="text-xs text-gray-500">
                      {newStudy.positive_impacts.length}/800 caracteres
                    </span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Impactos Negativos
                    <textarea
                      name="negative_impacts"
                      value={newStudy.negative_impacts}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-2 border rounded"
                      rows="6"
                      maxLength="800"
                      placeholder="Liste os impactos negativos do projeto"
                    />
                    <span className="text-xs text-gray-500">
                      {newStudy.negative_impacts.length}/800 caracteres
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Magnitude dos Impactos
                    <select
                      name="impact_magnitude"
                      value={newStudy.impact_magnitude}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-2 border rounded"
                    >
                      <option value="">Selecione a magnitude</option>
                      <option value="pequena">Pequena</option>
                      <option value="moderada">Moderada</option>
                      <option value="grande">Grande</option>
                    </select>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Significância dos Impactos
                    <select
                      name="impact_significance"
                      value={newStudy.impact_significance}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-2 border rounded"
                    >
                      <option value="">Selecione a significância</option>
                      <option value="baixa">Baixa</option>
                      <option value="média">Média</option>
                      <option value="alta">Alta</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Medidas e Monitoramento */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Medidas e Monitoramento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Medidas de Mitigação
                  <textarea
                    name="mitigation_measures"
                    value={newStudy.mitigation_measures}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border rounded"
                    rows="6"
                    maxLength="800"
                    placeholder="Liste as medidas de mitigação planejadas"
                  />
                  <span className="text-xs text-gray-500">
                    {newStudy.mitigation_measures.length}/800 caracteres
                  </span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Eficácia das Medidas
                  <select
                    name="mitigation_effectiveness"
                    value={newStudy.mitigation_effectiveness}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border rounded"
                  >
                    <option value="">Selecione a eficácia</option>
                    <option value="baixa">Baixa</option>
                    <option value="média">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plano de Monitoramento
                  <textarea
                    name="monitoring_plan"
                    value={newStudy.monitoring_plan}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border rounded"
                    rows="6"
                    maxLength="800"
                    placeholder="Descreva o plano de monitoramento"
                  />
                  <span className="text-xs text-gray-500">
                    {newStudy.monitoring_plan.length}/800 caracteres
                  </span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Indicadores de Monitoramento
                  <textarea
                    name="monitoring_indicators"
                    value={newStudy.monitoring_indicators}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border rounded"
                    rows="4"
                    placeholder="Liste os indicadores de monitoramento do projeto"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Conformidade e Participação */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Conformidade e Participação</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Conformidade Legal
                  <textarea
                    name="legal_conformity"
                    value={newStudy.legal_conformity}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border rounded"
                    rows="4"
                    placeholder="Descreva a conformidade legal do projeto"
                  />
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Disseminação Pública
                  <textarea
                    name="public_dissemination"
                    value={newStudy.public_dissemination}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border rounded"
                    rows="4"
                    placeholder="Descreva a disseminação pública do projeto"
                  />
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Consultoria Pública
                  <textarea
                    name="public_consultation"
                    value={newStudy.public_consultation}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border rounded"
                    rows="4"
                    placeholder="Descreva a consultoria pública do projeto"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="mt-4 space-x-2">
            <button
              type="submit"
              className="text-white px-4 py-2 rounded hover:opacity-80"
              style={{ backgroundColor: buttonColor }}
            >
              {editingStudy ? 'Atualizar' : 'Adicionar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setEditingStudy(null);
                setNewStudy({
                  environmental_documentid: '',
                  enterprisename: '',
                  projectlocation: '',
                  activitydescription: '',
                  physical_environment: '',
                  biological_environment: '',
                  socioeconomic_environment: '',
                  considered_alternatives: '',
                  positive_impacts: '',
                  negative_impacts: '',
                  impact_magnitude: '',
                  impact_significance: '',
                  mitigation_measures: '',
                  mitigation_effectiveness: '',
                  monitoring_plan: '',
                  monitoring_indicators: '',
                  legal_conformity: '',
                  public_dissemination: '',
                  public_consultation: ''
                });
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Sempre exibir a tabela quando o formulário estiver fechado */}
      {!isFormOpen && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-4 py-2 border">
                  <div className="flex flex-col">
                    <span>Empreendimento</span>
                    <div className="h-9 mt-1"></div>
                  </div>
                </th>
                <th className="px-4 py-2 border">
                  <div className="flex flex-col">
                    <span>Localização</span>
                    <input
                      type="text"
                      name="projectlocation"
                      value={filters.projectlocation}
                      onChange={handleFilterChange}
                      className="w-full p-1 text-sm border rounded mt-1"
                      placeholder="Filtrar por localização..."
                    />
                  </div>
                </th>
                <th className="px-4 py-2 border">
                  <div className="flex flex-col">
                    <span>Documento Ambiental</span>
                    <select
                      name="environmental_documentid"
                      value={filters.environmental_documentid}
                      onChange={handleFilterChange}
                      className="w-full p-1 text-sm border rounded mt-1"
                    >
                      <option value="">Todos os documentos</option>
                      {environmentalDocuments.map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.title}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-4 py-2 border">
                  <div className="flex flex-col">
                    <span>Ações</span>
                    <div className="h-9 mt-1"></div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentStudies.map(study => (
                <tr key={study.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <div className="truncate max-w-xs" title={study.enterprisename}>
                      {study.enterprisename}
                    </div>
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="truncate max-w-xs" title={study.projectlocation}>
                      {study.projectlocation}
                    </div>
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="truncate max-w-xs" title={environmentalDocuments.find(doc => doc.id === study.environmental_documentid)?.title}>
                      {environmentalDocuments.find(doc => doc.id === study.environmental_documentid)?.title}
                    </div>
                  </td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => handleEdit(study)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(study.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação com verificação de segurança */}
      {!isFormOpen && filteredStudies.length > 0 && (
        <div className="flex justify-center mt-4">
          {Array.from({ 
            length: Math.max(1, Math.ceil(filteredStudies.length / studiesPerPage))
          }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === i + 1 
                  ? 'text-white hover:opacity-80'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              style={currentPage === i + 1 ? { backgroundColor: buttonColor } : {}}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default EnvironmentalImpactStudy; 