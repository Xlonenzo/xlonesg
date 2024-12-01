import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { FaSearch, FaFileAlt, FaUpload, FaFolder, FaDownload, FaTrash, FaStop } from 'react-icons/fa';
import { API_URL } from '../config';

function SustainabilityReport({ sidebarColor, buttonColor }) {
  const [bonds, setBonds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [bondsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState('');
  const fileInputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [currentDocuments, setCurrentDocuments] = useState([]);
  const [selectedBond, setSelectedBond] = useState(null);
  const [currentHandlerId, setCurrentHandlerId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showStopButton, setShowStopButton] = useState(false);
  const [showReportTypeModal, setShowReportTypeModal] = useState(false);
  const [selectedBondForReport, setSelectedBondForReport] = useState(null);

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

  
  const handleGenerateReport = async (bond) => {
    if (isGenerating) {
        alert('Já existe uma geração em andamento. Por favor, aguarde ou cancele a geração atual.');
        return;
    }

    try {
        setReport('Iniciando geração do relatório...');
        setIsLoading(true);
        setIsGenerating(true);
        setShowStopButton(true);

        const response = await fetch(`${API_URL}/generate-report/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bond_id: bond.id })
        });
        
        const handlerId = response.headers.get('X-Handler-ID');
        setCurrentHandlerId(handlerId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullReport = '';
        let isCancelled = false;

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[FIM]') {
                        break;
                    } else if (data.startsWith('[CANCELADO]')) {
                        isCancelled = true;
                        setReport(fullReport + '\n\n' + data);
                        return;
                    } else if (data.startsWith('[ERRO]')) {
                        throw new Error(data);
                    } else {
                        fullReport += data;
                        setReport(fullReport);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Erro:', error);
        setReport('Erro ao gerar relatório. Por favor, tente novamente.');
    } finally {
        setIsLoading(false);
        setCurrentHandlerId(null);
        setIsGenerating(false);
        setShowStopButton(false);
    }
  };

  const handleStopGeneration = async () => {
    if (currentHandlerId) {
        try {
            const response = await fetch(`${API_URL}/generate-report/cancel/${currentHandlerId}`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error('Falha ao cancelar geração');
            }
            
            setReport(prev => prev + '\n\nCancelando geração...');
        } catch (error) {
            console.error('Erro ao cancelar geração:', error);
        }
    }
  };

  const handleUploadDocument = async (bond) => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.xls,.xlsx';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('entity_name', 'bonds');
        formData.append('entity_id', bond.id.toString());
        formData.append('description', `Documento para o título ${bond.name}`);
        formData.append('uploaded_by', localStorage.getItem('username') || 'sistema');

        setUploadStatus('Enviando documento...');

        await axios.post(`${API_URL}/generic-documents`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`  // Se estiver usando token
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
          await fetchDocuments('bonds', bond.id);
        }
        setTimeout(() => setUploadStatus(''), 3000);
      };

      input.click();
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
        <div className="bg-white rounded-lg w-full max-w-4xl p-6">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamanho</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Upload</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{doc.original_filename}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{doc.file_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(doc.file_size / 1024).toFixed(2)} KB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(doc.upload_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onDownload(doc.id, doc.original_filename)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
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
        setShowReportTypeModal(false);
        setSelectedBondForReport(null);
        
        setIsGenerating(true);
        setShowStopButton(true);
        setReport('Iniciando geração do relatório...\n');
        
        const endpoint = type === 'summary' 
            ? `${API_URL}/generate-report/stream/summary`
            : `${API_URL}/generate-report/stream`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                bond_id: selectedBondForReport.id,
                report_type: type 
            })
        });

        const handlerId = response.headers.get('X-Handler-ID');
        setCurrentHandlerId(handlerId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullReport = 'Iniciando geração do relatório...\n';

        const reportContainer = document.querySelector('.report-container');

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[FIM]') {
                        setIsGenerating(false);
                        setShowStopButton(false);
                        break;
                    } else if (data.startsWith('[CANCELADO]')) {
                        fullReport += '\n\nGeração cancelada.';
                        setReport(fullReport);
                        setIsGenerating(false);
                        setShowStopButton(false);
                        return;
                    } else if (data.startsWith('[ERRO]')) {
                        throw new Error(data);
                    } else {
                        fullReport += data;
                        setReport(fullReport);
                        
                        if (reportContainer) {
                            setTimeout(() => {
                                reportContainer.scrollTop = reportContainer.scrollHeight;
                            }, 0);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Erro:', error);
        setReport(prev => prev + '\n\nErro ao gerar relatório: ' + error.message);
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

  const handleStop = async () => {
    if (currentHandlerId) {
        try {
            await axios.post(`${API_URL}/generate-report/cancel/${currentHandlerId}`);
            setReport(prev => prev + '\n\nCancelando geração...');
            setIsGenerating(false);
            setShowStopButton(false);
        } catch (error) {
            console.error('Erro ao cancelar geração:', error);
        }
    }
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
                                            onClick={() => handleUploadDocument(bond)}
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
                        <div className="mt-8 p-4 bg-white rounded-lg shadow relative transition-all duration-300 overflow-auto report-container"
                             style={{ maxHeight: '80vh' }}
                        >
                            <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white z-10 py-2">
                                Relatório de Sustentabilidade
                            </h3>
                            {showStopButton && (
                                <button
                                    onClick={handleStop}
                                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md flex items-center"
                                    title="Parar geração"
                                >
                                    <FaStop className="mr-1" /> Parar
                                </button>
                            )}
                            <div className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed overflow-y-auto">
                                {report.split('\n').map((line, index) => {
                                    // Se for título de seção (números de 1 a 4 seguidos de ponto)
                                    if (/^[1-4]\.\s[A-Z]/.test(line)) {
                                        return (
                                            <div key={index} className="text-xl font-bold mt-6 mb-3 text-blue-800">
                                                {line}
                                            </div>
                                        );
                                    }
                                    // Se for subtítulo (começa com hífen)
                                    else if (line.trim().startsWith('-')) {
                                        return (
                                            <div key={index} className="text-base font-semibold ml-4 my-2 text-gray-700">
                                                {line}
                                            </div>
                                        );
                                    }
                                    // Se for mensagem de log
                                    else if (line.startsWith('Gerando') || 
                                            line.startsWith('Analisando') || 
                                            line.startsWith('Processando') || 
                                            line.startsWith('Iniciando') || 
                                            line.startsWith('Buscando') || 
                                            line.startsWith('Preparando')) {
                                        return (
                                            <div key={index} className="text-blue-600 my-1">
                                                {line}
                                            </div>
                                        );
                                    }
                                    // Parágrafo normal do relatório
                                    else if (line.trim()) {
                                        return (
                                            <div key={index} className="my-2 text-gray-700">
                                                {line}
                                            </div>
                                        );
                                    }
                                    // Linha vazia
                                    return line.trim() ? (
                                        <div key={index} className="my-1">{line}</div>
                                    ) : (
                                        <div key={index} className="h-2"></div>
                                    );
                                })}
                            </div>
                        </div>
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
                      onClick={() => handleUploadDocument(bond)}
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
        <div className="mt-8 p-4 bg-white rounded-lg shadow relative transition-all duration-300 overflow-auto report-container"
             style={{ maxHeight: '80vh' }}
        >
            <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white z-10 py-2">
                Relatório de Sustentabilidade
            </h3>
            {showStopButton && (
                <button
                    onClick={handleStop}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md flex items-center"
                    title="Parar geração"
                >
                    <FaStop className="mr-1" /> Parar
                </button>
            )}
            <div className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed overflow-y-auto">
                {report.split('\n').map((line, index) => {
                    // Se for título de seção (números de 1 a 4 seguidos de ponto)
                    if (/^[1-4]\.\s[A-Z]/.test(line)) {
                        return (
                            <div key={index} className="text-xl font-bold mt-6 mb-3 text-blue-800">
                                {line}
                            </div>
                        );
                    }
                    // Se for subtítulo (começa com hífen)
                    else if (line.trim().startsWith('-')) {
                        return (
                            <div key={index} className="text-base font-semibold ml-4 my-2 text-gray-700">
                                {line}
                            </div>
                        );
                    }
                    // Se for mensagem de log
                    else if (line.startsWith('Gerando') || 
                            line.startsWith('Analisando') || 
                            line.startsWith('Processando') || 
                            line.startsWith('Iniciando') || 
                            line.startsWith('Buscando') || 
                            line.startsWith('Preparando')) {
                        return (
                            <div key={index} className="text-blue-600 my-1">
                                {line}
                            </div>
                        );
                    }
                    // Parágrafo normal do relatório
                    else if (line.trim()) {
                        return (
                            <div key={index} className="my-2 text-gray-700">
                                {line}
                            </div>
                        );
                    }
                    // Linha vazia
                    return line.trim() ? (
                        <div key={index} className="my-1">{line}</div>
                    ) : (
                        <div key={index} className="h-2"></div>
                    );
                })}
            </div>
        </div>
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
    </div>
  );
}

export default SustainabilityReport;
