import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Sprout, ChevronLeft, ChevronRight } from 'lucide-react';
import { FaFilter, FaChevronUp, FaChevronDown } from 'react-icons/fa';
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

  // Adicionar novo estado para filtros expansíveis
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

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

  // Adicionar handler para mudança de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Impacto Ambiental</h1>
        <button
          onClick={() => {
            setIsFormOpen(true);
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
          className="px-4 py-2 rounded text-white flex items-center gap-2"
          style={{ backgroundColor: buttonColor }}
        >
          <Plus size={16} className="mr-2" />
          <span className="leading-none">Adicionar Novo Estudo</span>
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Empreendimento</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                placeholder="Filtrar por empreendimento"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Localização</label>
              <input
                type="text"
                name="projectlocation"
                value={filters.projectlocation}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                placeholder="Filtrar por localização"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Documento Ambiental</label>
              <select
                name="environmental_documentid"
                value={filters.environmental_documentid}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
              >
                <option value="">Todos os documentos</option>
                {environmentalDocuments.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.title}</option>
                ))}
              </select>
            </div>
          </div>
        )}
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
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th 
                  className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                  style={{ backgroundColor: `${buttonColor}15` }}
                >
                  Empreendimento
                </th>
                <th 
                  className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                  style={{ backgroundColor: `${buttonColor}15` }}
                >
                  Localização
                </th>
                <th 
                  className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap"
                  style={{ backgroundColor: `${buttonColor}15` }}
                >
                  Documento Ambiental
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
              {currentStudies.map(study => (
                <tr key={study.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900">
                      <div className="truncate max-w-xs" title={study.enterprisename}>
                        {study.enterprisename}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900">
                      <div className="truncate max-w-xs" title={study.projectlocation}>
                        {study.projectlocation}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900">
                      <div className="truncate max-w-xs" title={environmentalDocuments.find(doc => doc.id === study.environmental_documentid)?.title}>
                        {environmentalDocuments.find(doc => doc.id === study.environmental_documentid)?.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEdit(study)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(study.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação simplificada */}
      {!isFormOpen && filteredStudies.length > 0 && (
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
              disabled={currentPage === Math.ceil(filteredStudies.length / studiesPerPage)}
              className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                currentPage === Math.ceil(filteredStudies.length / studiesPerPage)
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
                Mostrando <span className="font-medium">{indexOfFirstStudy + 1}</span> até{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastStudy, filteredStudies.length)}
                </span>{' '}
                de <span className="font-medium">{filteredStudies.length}</span> resultados
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
                  { length: Math.ceil(filteredStudies.length / studiesPerPage) },
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
                  disabled={currentPage === Math.ceil(filteredStudies.length / studiesPerPage)}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                    currentPage === Math.ceil(filteredStudies.length / studiesPerPage)
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

export default EnvironmentalImpactStudy; 