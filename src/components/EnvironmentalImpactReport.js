import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, Filter as FaFilter, Sprout } from 'lucide-react';
import { API_URL } from '../config';

function EnvironmentalImpactReport({ sidebarColor, buttonColor }) {
  const [impactReports, setImpactReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(10);
  const [environmentalDocuments, setEnvironmentalDocuments] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);

  // Estado para novo relatório
  const [newReport, setNewReport] = useState({
    environmental_document_id: '',
    eia_summary: '',
    impact_synthesis: '',
    highlighted_mitigation_measures: '',
    main_conclusions: ''
  });

  // Estado para filtros
  const [filters, setFilters] = useState({
    environmental_document_id: ''
  });

  // Buscar relatórios
  const fetchImpactReports = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/environmental-impact-reports`);
      setImpactReports(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar relatórios:', err);
      setError('Falha ao carregar os relatórios. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar documentos ambientais
  const fetchEnvironmentalDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/environmental-documents`);
      setEnvironmentalDocuments(response.data);
    } catch (err) {
      console.error('Erro ao buscar documentos:', err);
    }
  };

  useEffect(() => {
    fetchImpactReports();
    fetchEnvironmentalDocuments();
  }, []);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReport(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReport) {
        await axios.put(`${API_URL}/environmental-impact-reports/${editingReport.id}`, newReport);
        alert('Relatório atualizado com sucesso!');
      } else {
        await axios.post(`${API_URL}/environmental-impact-reports`, newReport);
        alert('Novo relatório adicionado com sucesso!');
      }
      fetchImpactReports();
      setIsFormOpen(false);
      setEditingReport(null);
      setNewReport({
        environmental_document_id: '',
        eia_summary: '',
        impact_synthesis: '',
        highlighted_mitigation_measures: '',
        main_conclusions: ''
      });
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      alert('Erro ao salvar relatório. Por favor, tente novamente.');
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setNewReport({
      environmental_document_id: report.environmental_document_id,
      eia_summary: report.eia_summary,
      impact_synthesis: report.impact_synthesis,
      highlighted_mitigation_measures: report.highlighted_mitigation_measures,
      main_conclusions: report.main_conclusions
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este relatório?')) {
      try {
        await axios.delete(`${API_URL}/environmental-impact-reports/${id}`);
        fetchImpactReports();
        alert('Relatório excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir relatório:', error);
        alert('Erro ao excluir relatório. Por favor, tente novamente.');
      }
    }
  };

  // Atualizar a lógica de filtragem usando useMemo
  const filteredReports = useMemo(() => {
    if (!impactReports) return [];
    
    return impactReports.filter(report => {
      const matchesSearch = !searchTerm || (
        environmentalDocuments.find(doc => doc.id === report.environmental_document_id)?.title
          ?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesDocumentFilter = !filters.environmental_document_id || 
        report.environmental_document_id?.toString() === filters.environmental_document_id;

      return matchesSearch && matchesDocumentFilter;
    });
  }, [impactReports, searchTerm, filters, environmentalDocuments]);

  // Calcular relatórios atuais para paginação
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Relatórios de Impacto Ambiental</h1>

      {/* Cabeçalho com botões e pesquisa */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setIsFormOpen(true);
              setEditingReport(null);
              setNewReport({
                environmental_document_id: '',
                eia_summary: '',
                impact_synthesis: '',
                highlighted_mitigation_measures: '',
                main_conclusions: ''
              });
            }}
            className="flex items-center px-4 py-2 text-white rounded hover:opacity-80"
            style={{ backgroundColor: buttonColor }}
          >
            <Plus size={20} className="mr-2" />
            Novo Relatório
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded"
            />
            <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Formulário e Tabela seguem o mesmo padrão do EnvironmentalImpactStudy */}
      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... formulário existente ... */}
        </form>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-4 py-2 border">
                  <div className="flex flex-col">
                    <span>Documento Ambiental</span>
                    <select
                      name="environmental_document_id"
                      value={filters.environmental_document_id}
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
                <th className="px-4 py-2 border">Resumo EIA</th>
                <th className="px-4 py-2 border">Síntese de Impactos</th>
                <th className="px-4 py-2 border">Medidas Mitigadoras</th>
                <th className="px-4 py-2 border">Conclusões</th>
                <th className="px-4 py-2 border">Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentReports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <div className="truncate max-w-xs" title={environmentalDocuments.find(doc => doc.id === report.environmental_document_id)?.title}>
                      {environmentalDocuments.find(doc => doc.id === report.environmental_document_id)?.title}
                    </div>
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="truncate max-w-xs" title={report.eia_summary}>
                      {report.eia_summary}
                    </div>
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="truncate max-w-xs" title={report.impact_synthesis}>
                      {report.impact_synthesis}
                    </div>
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="truncate max-w-xs" title={report.highlighted_mitigation_measures}>
                      {report.highlighted_mitigation_measures}
                    </div>
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="truncate max-w-xs" title={report.main_conclusions}>
                      {report.main_conclusions}
                    </div>
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleEdit(report)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="text-red-500 hover:text-red-700"
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
      {!isFormOpen && filteredReports.length > 0 && (
        <div className="flex justify-center mt-4">
          {Array.from({ 
            length: Math.ceil(filteredReports.length / reportsPerPage)
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

export default EnvironmentalImpactReport; 