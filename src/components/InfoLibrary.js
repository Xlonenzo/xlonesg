import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Upload,
  Download,
  Trash2,
  Search,
  Plus,
  FileText,
  Database,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { API_URL } from '../config';
import constants from '../data/constants.json';

function InfoLibrary({ buttonColor, sidebarColor }) {
  const [documents, setDocuments] = useState([]);
  const [indexedDocs, setIndexedDocs] = useState({});
  const [newDocument, setNewDocument] = useState({ 
    title: '', 
    file: null,
    document_type: '',
    reference_date: '',
    description: '',
    mime_type: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filters, setFilters] = useState({
    title: '',
    document_type: '',
    reference_date: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'none'
  });
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const checkIndexStatus = async () => {
      const statusMap = {};
      for (const doc of documents) {
        try {
          const response = await axios.get(`${API_URL}/infolibrary-documents/${doc.id}/index-status`);
          statusMap[doc.id] = response.data.status === 'indexed';
        } catch (error) {
          console.error(`Erro ao verificar status do documento ${doc.id}:`, error);
          statusMap[doc.id] = false;
        }
      }
      setIndexedDocs(statusMap);
    };
    
    if (documents.length > 0) {
      checkIndexStatus();
    }
  }, [documents]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/infolibrary-documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!newDocument.file || !newDocument.title || !newDocument.document_type) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', newDocument.file);
    formData.append('title', newDocument.title);
    formData.append('document_type', newDocument.document_type);
    formData.append('reference_date', newDocument.reference_date);
    formData.append('description', newDocument.description);

    try {
      setUploadStatus('Enviando documento...');
      const response = await axios.post(
        `${API_URL}/infolibrary-documents/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadStatus(`Enviando... ${percentCompleted}%`);
          }
        }
      );
      
      console.log('Upload bem sucedido:', response.data);
      
      setUploadStatus('Indexando documento...');
      try {
        const indexStatus = await axios.get(
          `${API_URL}/infolibrary-documents/${response.data.id}/index-status`
        );
        if (indexStatus.data.status === 'indexed') {
          setUploadStatus('Documento enviado e indexado com sucesso!');
        } else {
          setUploadStatus('Documento enviado. Indexação em andamento...');
        }
      } catch (indexError) {
        console.error('Erro ao verificar indexação:', indexError);
        setUploadStatus('Documento enviado, mas houve um erro na indexação');
      }
      
      await fetchDocuments();
      setNewDocument({ 
        title: '', 
        file: null,
        document_type: '',
        reference_date: '',
        description: '',
        mime_type: ''
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setTimeout(() => setUploadStatus(''), 3000);
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Erro ao fazer upload do arquivo';
      setUploadStatus(`Erro: ${errorMessage}`);
      console.error('Detalhes do erro:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message
      });
      setTimeout(() => setUploadStatus(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId, filename) => {
    try {
      setUploadStatus('Iniciando download...');

      const response = await axios.get(
        `${API_URL}/infolibrary-documents/download/${documentId}`,
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

      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] 
      });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);

      setUploadStatus('Download concluído com sucesso!');
      setTimeout(() => setUploadStatus(''), 3000);

    } catch (error) {
      console.error('Erro ao fazer download:', error);
      setUploadStatus(`Erro: ${error.message}`);
      setTimeout(() => setUploadStatus(''), 5000);
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await axios.delete(`${API_URL}/infolibrary-documents/${documentId}`);
        await fetchDocuments();
        setUploadStatus('Documento excluído com sucesso!');
        setTimeout(() => setUploadStatus(''), 3000);
      } catch (error) {
        console.error('Erro ao deletar documento:', error);
        setUploadStatus('Erro ao excluir documento');
        setTimeout(() => setUploadStatus(''), 5000);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/documents/search`, {
        params: { query: searchQuery }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Erro na busca:', error.response?.data || error.message);
      alert('Erro ao realizar a busca. Tente novamente.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = 'none';
      else direction = 'asc';
    }
    
    setSortConfig({ key, direction });
  };

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

  const filteredDocuments = documents.filter(doc => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      return doc[key]?.toString().toLowerCase().includes(filters[key].toLowerCase());
    });
  });

  const getCurrentPageItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredDocuments.slice(indexOfFirstItem, indexOfLastItem);
  };

  useEffect(() => {
    setTotalPages(Math.ceil(filteredDocuments.length / itemsPerPage));
  }, [filteredDocuments, itemsPerPage]);

  const handleIndexDocument = async (documentId) => {
    try {
      setUploadStatus('Indexando documento...');
      await axios.post(`${API_URL}/infolibrary-documents/${documentId}/index`);
      
      // Verificar status da indexação
      const indexStatus = await axios.get(
        `${API_URL}/infolibrary-documents/${documentId}/index-status`
      );
      
      if (indexStatus.data.status === 'indexed') {
        setUploadStatus('Documento indexado com sucesso!');
        // Atualizar estado de indexação do documento
        setIndexedDocs(prev => ({
          ...prev,
          [documentId]: true
        }));
      } else {
        setUploadStatus('Erro ao indexar documento');
      }
      
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Erro ao indexar documento:', error);
      setUploadStatus('Erro ao indexar documento');
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-medium text-gray-800">Biblioteca de Documentos</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="text-white px-4 py-2 rounded hover:opacity-80 transition-all flex items-center gap-2 text-sm"
          style={{ backgroundColor: buttonColor }}
        >
          <Plus size={16} className="stroke-[1.5]" />
          Novo Documento
        </button>
      </div>

      {/* Seção de Filtros */}
      <div className="bg-white rounded-lg shadow-sm mb-4 border border-gray-100">
        <button
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          style={{ color: sidebarColor }}
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
                <label className="block text-sm font-medium text-gray-600 mb-2">Nome</label>
                <input
                  type="text"
                  name="title"
                  value={filters.title}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Tipo</label>
                <select
                  name="document_type"
                  value={filters.document_type}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                >
                  <option value="">Todos</option>
                  {constants.documentInfoType.types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Data de Referência</label>
                <input
                  type="date"
                  name="reference_date"
                  value={filters.reference_date}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setFilters({
                  title: '',
                  document_type: '',
                  reference_date: ''
                })}
                className="px-4 py-2 text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid de Documentos */}
      <div className="w-full overflow-hidden">
        <table className="w-full bg-white border border-gray-100 rounded-lg">
          <thead>
            <tr>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group whitespace-nowrap w-[200px]"
                onClick={() => handleSort('title')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1">
                  <span>Nome</span>
                  {renderSortIcon('title')}
                </div>
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group whitespace-nowrap w-[120px]"
                onClick={() => handleSort('document_type')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1">
                  <span>Tipo</span>
                  {renderSortIcon('document_type')}
                </div>
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group whitespace-nowrap hidden md:table-cell w-[100px]"
                onClick={() => handleSort('reference_date')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1">
                  <span>Data Ref.</span>
                  {renderSortIcon('reference_date')}
                </div>
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group whitespace-nowrap hidden sm:table-cell w-[80px]"
                onClick={() => handleSort('file_size')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1">
                  <span>Tamanho</span>
                  {renderSortIcon('file_size')}
                </div>
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 cursor-pointer group whitespace-nowrap hidden lg:table-cell w-[100px]"
                onClick={() => handleSort('mime_type')}
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                <div className="flex items-center gap-1">
                  <span>Tipo MIME</span>
                  {renderSortIcon('mime_type')}
                </div>
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-center text-sm font-medium text-gray-600 whitespace-nowrap w-[120px]"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {sortData(getCurrentPageItems(), sortConfig.key, sortConfig.direction).map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="flex items-center">
                    {!indexedDocs[doc.id] && (
                      <button
                        onClick={() => handleIndexDocument(doc.id)}
                        className="text-gray-400 hover:text-green-600 mr-2"
                        title="Indexar documento"
                      >
                        <Database size={16} className="stroke-[1.5]" />
                      </button>
                    )}
                    <div 
                      className={`text-sm truncate max-w-[250px] ${
                        indexedDocs[doc.id] 
                          ? 'text-green-600 font-medium' 
                          : 'text-gray-900'
                      }`}
                    >
                      {doc.title}
                    </div>
                    {indexedDocs[doc.id] && (
                      <span className="ml-2 text-xs text-green-500">
                        (indexado)
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                  <div className="text-sm text-gray-900">{doc.document_type}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600 hidden md:table-cell">
                  <div className="text-sm text-gray-900">
                    {doc.reference_date ? new Date(doc.reference_date).toLocaleDateString() : '-'}
                  </div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600 hidden sm:table-cell">
                  <div className="text-sm text-gray-900">
                    {(doc.file_size / 1024).toFixed(2)} KB
                  </div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600 hidden lg:table-cell">
                  <div className="text-sm text-gray-900">{doc.mime_type || '-'}</div>
                </td>
                <td className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleDownload(doc.id, doc.original_filename)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Download"
                    >
                      <Download size={16} className="stroke-[1.5]" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <Trash2 size={16} className="stroke-[1.5]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex justify-between items-center mt-4 px-4">
        <div className="text-sm text-gray-600">
          Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredDocuments.length)} de {filteredDocuments.length} registros
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

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            setNewDocument({ 
              ...newDocument,
              file: e.target.files[0],
              title: e.target.files[0].name 
            });
            // Abrir modal de detalhes do documento
          }
        }}
      />

      {/* Status de upload/download */}
      {uploadStatus && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg ${
          uploadStatus.includes('sucesso') ? 'bg-green-500' : 
          uploadStatus.includes('Erro') ? 'bg-red-500' : 'bg-blue-500'
        } text-white`}>
          {uploadStatus}
        </div>
      )}

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Novo Documento</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleFileUpload();
              setShowUploadModal(false);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Arquivo *
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setNewDocument({ 
                          ...newDocument,
                          file: e.target.files[0],
                          title: e.target.files[0].name 
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Tipo de Documento
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={newDocument.document_type}
                    onChange={(e) => setNewDocument({ ...newDocument, document_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                    required
                  >
                    <option value="">Selecione um tipo</option>
                    {constants.documentInfoType.types.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Data de Referência
                  </label>
                  <input
                    type="date"
                    value={newDocument.reference_date}
                    onChange={(e) => setNewDocument({ ...newDocument, reference_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Descrição
                  </label>
                  <textarea
                    value={newDocument.description}
                    onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="bg-red-500 text-white px-6 py-2 rounded hover:opacity-90 transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-white px-6 py-2 rounded hover:opacity-90 transition-all text-sm"
                  style={{ backgroundColor: buttonColor }}
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InfoLibrary;
