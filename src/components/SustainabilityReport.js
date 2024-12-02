import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSearch, FaFileAlt, FaUpload, FaFolder, FaDownload, FaTrash, FaStop } from 'react-icons/fa';
import { API_URL } from '../config';
import constants from '../data/constants.json';

const UploadModal = ({ show, onClose, onUpload, bond }) => {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [referenceDate, setReferenceDate] = useState('');
  const [description, setDescription] = useState('');

  if (!show || !bond) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !documentType) {
      alert('Por favor, selecione um arquivo e tipo de documento');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity_name', 'bonds');
    formData.append('entity_id', bond.id.toString());
    formData.append('description', description || `Documento para o título ${bond.name}`);
    formData.append('document_type', documentType);
    formData.append('reference_date', referenceDate || new Date().toISOString().split('T')[0]);
    formData.append('uploaded_by', localStorage.getItem('username') || 'sistema');

    await onUpload(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upload de Documento</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Arquivo *</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 block w-full"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Documento *</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Selecione um tipo</option>
              {constants.DocumentBondTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Data de Referência</label>
            <input
              type="date"
              value={referenceDate}
              onChange={(e) => setReferenceDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows="3"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function SustainabilityReport({ sidebarColor, buttonColor }) {
  const [bonds, setBonds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [bondsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [currentDocuments, setCurrentDocuments] = useState([]);
  const [selectedBond, setSelectedBond] = useState(null);
  const [currentHandlerId, setCurrentHandlerId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showStopButton, setShowStopButton] = useState(false);
  const [showReportTypeModal, setShowReportTypeModal] = useState(false);
  const [selectedBondForReport, setSelectedBondForReport] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

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

  const handleStop = async () => {
    if (currentHandlerId) {
      try {
        const response = await fetch(`${API_URL}/api/generate-report/cancel/${currentHandlerId}`, {
          method: 'POST'
        });
        
        if (!response.ok) {
          throw new Error('Falha ao cancelar geração');
        }
      } catch (error) {
        console.error('Erro ao cancelar:', error);
      }
    }
  };

  const handleUploadDocument = async (formData) => {
    try {
      setUploadStatus('Enviando documento...');

      await axios.post(`${API_URL}/generic-documents`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadStatus(`Enviando... ${percentCompleted}%`);
        }
      });

      setUploadStatus('Documento enviado com sucesso!');
      if (showDocumentsModal) {
        await fetchDocuments('bonds', selectedBond.id);
      }
      setTimeout(() => setUploadStatus(''), 3000);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      const errorMessage = error.response?.data?.detail || 'Erro ao enviar documento. Tente novamente.';
      setUploadStatus(errorMessage);
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  const fetchDocuments = async (entityName, entityId) => {
    try {
      const response = await axios.get(
        `${API_URL}/generic-documents/${entityName}/${entityId}`
      );
      setCurrentDocuments(response.data);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      setError('Falha ao carregar os documentos. Por favor, tente novamente.');
    }
  };

  const handleDownload = async (documentId, filename) => {
    try {
      setUploadStatus('Iniciando download...');

      const response = await axios.get(
        `${API_URL}/generic-documents/download/${documentId}`,
        {
          responseType: 'blob',
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadStatus(`Baixando... ${percentCompleted}%`);
            }
          }
        }
      );

      // Criar blob URL
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] 
      });
      const url = window.URL.createObjectURL(blob);

      // Criar e clicar no link de download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'documento';  // Usar nome original ou fallback
      document.body.appendChild(link);
      link.click();

      // Limpar recursos
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);

      setUploadStatus('Download concluído com sucesso!');
      setTimeout(() => setUploadStatus(''), 3000);

    } catch (error) {
      console.error('Erro ao fazer download:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Erro ao fazer download do documento';
      setUploadStatus(`Erro: ${errorMessage}`);
      setTimeout(() => setUploadStatus(''), 5000);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await axios.delete(`${API_URL}/generic-documents/${documentId}`);
        // Atualizar lista de documentos
        if (selectedBond) {
          fetchDocuments('bonds', selectedBond.id);
        }
      } catch (error) {
        console.error('Erro ao deletar documento:', error);
      }
    }
  };

  const DocumentsModal = ({ show, onClose, documents, onDownload, onDelete }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Documentos</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                  <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Ref.</th>
                  <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamanho</th>
                  <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Upload</th>
                  <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4">
                      <div className="truncate" title={doc.original_filename}>
                        {doc.original_filename}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="truncate" title={doc.file_type}>
                        {doc.file_type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="truncate" title={doc.document_type || '-'}>
                        {doc.document_type || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="truncate">
                        {doc.reference_date ? new Date(doc.reference_date).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="truncate">
                        {(doc.file_size / 1024).toFixed(2)} KB
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="truncate">
                        {new Date(doc.upload_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onDownload(doc.id, doc.original_filename)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Download"
                        >
                          <FaDownload />
                        </button>
                        <button
                          onClick={() => onDelete(doc.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
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
        </div>
      </div>
    );
  };

  const filteredBonds = bonds.filter(bond =>
    bond.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bond.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastBond = currentPage * bondsPerPage;
  const indexOfFirstBond = indexOfLastBond - bondsPerPage;
  const currentBonds = filteredBonds.slice(indexOfFirstBond, indexOfLastBond);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const startReportGeneration = async (type) => {
    try {
        setIsGenerating(true);
        setShowStopButton(true);
        setReport('');
        
        const endpoint = type === 'summary' ? 
            `${API_URL}/generate-report/stream/summary` : 
            `${API_URL}/generate-report/stream/complete`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                bond_id: selectedBondForReport.id
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Pegar o ID do handler para cancelamento
        const handlerId = response.headers.get('X-Handler-ID');
        setCurrentHandlerId(handlerId);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const text = decoder.decode(value);
            const lines = text.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const content = line.slice(6);
                    if (content === '[FIM]') {
                        setIsGenerating(false);
                        setShowStopButton(false);
                        break;
                    } else if (content === '[CANCELADO]') {
                        setReport(prev => prev + '\n\nGeração cancelada pelo usuário.');
                        setIsGenerating(false);
                        setShowStopButton(false);
                        break;
                    } else if (content.startsWith('[ERRO]')) {
                        setReport(prev => prev + '\n\n' + content);
                        setIsGenerating(false);
                        setShowStopButton(false);
                        break;
                    } else {
                        setReport(prev => prev + content);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Erro:', error);
        setReport('Erro ao gerar relatório: ' + error.message);
        setIsGenerating(false);
        setShowStopButton(false);
    } finally {
        setShowReportTypeModal(false);
    }
  };

  const ReportTypeModal = ({ show, onClose, onSelect }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h3 className="text-lg font-semibold mb-4">Selecione o Tipo de Relatório</h3>
          <div className="space-y-4">
            <button
              onClick={() => onSelect('summary')}
              className="w-full p-3 text-left border rounded hover:bg-blue-50 transition-colors"
            >
              <div className="font-semibold">Relatório Sumário</div>
              <div className="text-sm text-gray-600">Análise básica do título e seus ODS</div>
            </button>
            <button
              onClick={() => onSelect('complete')}
              className="w-full p-3 text-left border rounded hover:bg-blue-50 transition-colors"
            >
              <div className="font-semibold">Relatório Completo</div>
              <div className="text-sm text-gray-600">Análise detalhada com todos os aspectos ESG</div>
            </button>
          </div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 w-full"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  };

  const formatReportContent = (content) => {
    // Limpa e estrutura o texto
    let cleanContent = content
        // Remove texto inicial
        .replace(/^Iniciando análise do título/, '')
        // Adiciona quebras duplas antes dos títulos das seções
        .replace(/(ANÁLISE FINANCEIRA E DE MERCADO|ANÁLISE DE IMPACTO AMBIENTAL|ANÁLISE DE IMPACTO SOCIAL|GOVERNANÇA E COMPLIANCE|ALINHAMENTO COM FRAMEWORKS|RECOMENDAÇÕES E CONCLUSÕES)/g, '\n\n$1: ')
        // Corrige espaços e pontuação
        .replace(/\s+/g, ' ')
        .replace(/\s+\./g, '.')
        .replace(/\s+,/g, ',')
        // Garante quebra de linha após cada ponto final
        .replace(/\.\s+([A-Z])/g, '.\n\n$1')
        // Remove múltiplas quebras de linha
        .replace(/\n{3,}/g, '\n\n');

    const sections = cleanContent.split('\n').map(line => line.trim()).filter(Boolean);
    
    return sections.map((line, index) => {
        const isSectionTitle = [
            'ANÁLISE FINANCEIRA E DE MERCADO',
            'ANÁLISE DE IMPACTO AMBIENTAL',
            'ANÁLISE DE IMPACTO SOCIAL',
            'GOVERNANÇA E COMPLIANCE',
            'ALINHAMENTO COM FRAMEWORKS',
            'RECOMENDAÇÕES E CONCLUSÕES'
        ].some(title => line.startsWith(title));

        if (isSectionTitle) {
            return (
                <div key={`text-${index}`} className="mb-6">
                    <p className="text-sm text-gray-700 leading-relaxed font-semibold">
                        {line}
                    </p>
                </div>
            );
        }

        // Texto normal (explicação)
        return (
            <div key={`text-${index}`} className="mb-6">
                <p className="text-sm text-gray-700 leading-relaxed">
                    {line}
                </p>
            </div>
        );
    });
  };

  const ReportContent = ({ report, showStopButton, onStop }) => {
    return (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg relative">
            <style>
                {`
                    .prose-sm {
                        max-width: 65ch;
                        margin: 0 auto;
                        font-size: 0.875rem;
                        line-height: 1.7;
                    }

                    .prose-sm h1,
                    .prose-sm h2 {
                        font-weight: 600;
                        line-height: 1.4;
                    }

                    .prose-sm p {
                        margin-bottom: 1.25em;
                    }

                    .prose-sm > div {
                        margin-bottom: 1.25em;
                    }

                    @media (max-width: 640px) {
                        .prose-sm {
                            font-size: 0.8125rem;
                        }
                    }
                `}
            </style>
            {showStopButton && (
                <button
                    onClick={onStop}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md flex items-center gap-2 text-sm"
                >
                    <FaStop className="text-sm" /> Parar
                </button>
            )}
            <div className="prose prose-sm max-w-none">
                {formatReportContent(report)}
            </div>
        </div>
    );
  };

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-4 flex items-center">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Pesquisar títulos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 pl-10 border rounded-lg"
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="bg-white shadow-md rounded-lg">
                    <table className="min-w-full border border-collapse table-fixed">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">Nome</th>
                                <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">Tipo</th>
                                <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">Valor</th>
                                <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">% ESG</th>
                                <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">Data de Emissão</th>
                                <th className="w-1/12 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentBonds.map((bond) => (
                                <tr key={bond.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap border">
                                        <div className="truncate">{bond.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap border">
                                        <div className="truncate">{bond.type}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap border">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bond.value)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap border">{bond.esg_percentage}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap border">
                                        {new Date(bond.issue_date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right border">
                                        <button
                                            onClick={() => {
                                                if (!isGenerating) {
                                                    setSelectedBondForReport(bond);
                                                    setShowReportTypeModal(true);
                                                }
                                            }}
                                            className={`text-blue-600 hover:text-blue-900 mr-3 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title={isGenerating ? "Geração em andamento" : "Gerar Relatório"}
                                            disabled={isGenerating}
                                        >
                                            <FaFileAlt />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!isGenerating) {
                                                    setSelectedBond(bond);
                                                    setShowUploadModal(true);
                                                }
                                            }}
                                            className={`text-green-600 hover:text-green-900 mr-3 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title={isGenerating ? "Geração em andamento" : "Adicionar Documentos"}
                                            disabled={isGenerating}
                                        >
                                            <FaUpload />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!isGenerating) {
                                                    setSelectedBond(bond);
                                                    fetchDocuments('bonds', bond.id);
                                                    setShowDocumentsModal(true);
                                                }
                                            }}
                                            className={`text-yellow-600 hover:text-yellow-900 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title={isGenerating ? "Geração em andamento" : "Ver Documentos"}
                                            disabled={isGenerating}
                                        >
                                            <FaFolder />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8">
                <div className="bg-white rounded-lg shadow p-4 relative">
                    {isGenerating && (
                        <div className="flex items-center mb-4 p-4 bg-blue-50 rounded">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
                            <span className="text-blue-600">Gerando relatório...</span>
                            
                            {showStopButton && (
                                <button
                                    onClick={handleStop}
                                    className="ml-auto bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md flex items-center"
                                    title="Parar geração"
                                >
                                    <FaStop className="mr-1" /> Parar
                                </button>
                            )}
                        </div>
                    )}

                    {report && (
                        <ReportContent 
                            report={report}
                            showStopButton={showStopButton}
                            onStop={handleStop}
                        />
                    )}
                </div>
            </div>
        </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Relatório de Sustentabilidade</h2>

      <div className="mb-4 flex items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Pesquisar títulos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-lg"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="bg-white shadow-md rounded-lg">
          <table className="min-w-full border border-collapse table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">Nome</th>
                <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">Tipo</th>
                <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">Valor</th>
                <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">% ESG</th>
                <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">Data de Emissão</th>
                <th className="w-1/12 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentBonds.map((bond) => (
                <tr key={bond.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap border">
                    <div className="truncate">{bond.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border">
                    <div className="truncate">{bond.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bond.value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border">{bond.esg_percentage}%</td>
                  <td className="px-6 py-4 whitespace-nowrap border">
                    {new Date(bond.issue_date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right border">
                    <button
                      onClick={() => {
                        if (!isGenerating) {
                          setSelectedBondForReport(bond);
                          setShowReportTypeModal(true);
                        }
                      }}
                      className={`text-blue-600 hover:text-blue-900 mr-3 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={isGenerating ? "Geração em andamento" : "Gerar Relatório"}
                      disabled={isGenerating}
                    >
                      <FaFileAlt />
                    </button>
                    <button
                      onClick={() => {
                        if (!isGenerating) {
                          setSelectedBond(bond);
                          setShowUploadModal(true);
                        }
                      }}
                      className={`text-green-600 hover:text-green-900 mr-3 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={isGenerating ? "Geração em andamento" : "Adicionar Documentos"}
                      disabled={isGenerating}
                    >
                      <FaUpload />
                    </button>
                    <button
                      onClick={() => {
                        if (!isGenerating) {
                          setSelectedBond(bond);
                          fetchDocuments('bonds', bond.id);
                          setShowDocumentsModal(true);
                        }
                      }}
                      className={`text-yellow-600 hover:text-yellow-900 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={isGenerating ? "Geração em andamento" : "Ver Documentos"}
                      disabled={isGenerating}
                    >
                      <FaFolder />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        {Array.from({ length: Math.ceil(filteredBonds.length / bondsPerPage) }).map((_, index) => (
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

      {report && (
        <ReportContent 
            report={report}
            showStopButton={showStopButton}
            onStop={handleStop}
        />
      )}

      {uploadStatus && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg ${
          uploadStatus.includes('sucesso') ? 'bg-green-500' : 
          uploadStatus.includes('Erro') ? 'bg-red-500' : 'bg-blue-500'
        } text-white`}>
          {uploadStatus}
        </div>
      )}

      <DocumentsModal
        show={showDocumentsModal}
        onClose={() => setShowDocumentsModal(false)}
        documents={currentDocuments}
        onDownload={handleDownload}
        onDelete={handleDeleteDocument}
      />

      <ReportTypeModal
        show={showReportTypeModal}
        onClose={() => {
          setShowReportTypeModal(false);
          setSelectedBondForReport(null);
        }}
        onSelect={startReportGeneration}
      />

      <UploadModal
        show={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedBond(null);
        }}
        onUpload={handleUploadDocument}
        bond={selectedBond}
      />
    </div>
  );
}

export default SustainabilityReport;
