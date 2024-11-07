import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function InfoLibrary() {
  const [documents, setDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState({ title: '', file: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!newDocument.file || !newDocument.title) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', newDocument.file);
    formData.append('title', newDocument.title);

    try {
        const response = await axios.post(`${API_URL}/documents/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        console.log('Upload bem sucedido:', response.data);
        await fetchDocuments();
        setNewDocument({ title: '', file: null });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        alert('Documento enviado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao fazer upload:', error);
        const errorMessage = error.response?.data?.detail || 'Erro ao fazer upload do arquivo';
        alert(`Erro: ${errorMessage}`);
    } finally {
        setLoading(false);
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Biblioteca de Documentos</h2>

      {/* Upload de Documentos */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4">Adicionar Novo Documento</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleFileUpload();
        }}>
          <div className="space-y-4">
            <input
              type="text"
              value={newDocument.title}
              onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
              placeholder="Título do documento"
              className="w-full p-2 border rounded"
              required
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => {
                console.log('Arquivo selecionado:', e.target.files[0]);
                setNewDocument({ 
                  ...newDocument, 
                  file: e.target.files[0] 
                });
              }}
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              disabled={loading || !newDocument.title || !newDocument.file}
              onClick={() => console.log('Estado atual:', { loading, title: newDocument.title, file: newDocument.file })}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Enviando...' : 'Enviar Documento'}
            </button>
          </div>
        </form>
        {loading && <p className="text-blue-500 mt-2">Processando documento...</p>}
      </div>

      {/* Busca Semântica */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4">Busca Semântica</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Digite sua pergunta..."
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Buscar
          </button>
        </div>
        
        {/* Resultados da Busca */}
        {searchResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Resultados:</h4>
            <div className="space-y-3">
              {searchResults.map((result, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <h5 className="font-medium">{result.title}</h5>
                  <p className="text-sm text-gray-600">{result.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Relevância: {Math.round(result.similarity * 100)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lista de Documentos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Documentos Disponíveis</h3>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <h4 className="font-medium">{doc.title}</h4>
                <p className="text-sm text-gray-600">
                  Adicionado em: {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
              <a
                href={`${API_URL}/documents/${doc.id}/download`}
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InfoLibrary;
