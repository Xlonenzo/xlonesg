import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSearch, FaFileAlt, FaUpload } from 'react-icons/fa';
import { API_URL } from '../config';

function SustainabilityReport({ sidebarColor, buttonColor }) {
  const [bonds, setBonds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [bondsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState('');

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
    try {
        setReport('Iniciando geração do relatório...');
        setIsLoading(true);

        const response = await fetch(`${API_URL}/generate-report/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bond_id: bond.id })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Usar EventSource para SSE
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullReport = '';

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
                    } else if (data.startsWith('Erro:')) {
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
    }
  };

  const handleUploadDocument = async (bond) => {
    try {
      console.log('Upload para o título:', bond.name);
      // TODO: Implementar lógica de upload
    } catch (error) {
      console.error('Erro ao iniciar upload:', error);
    }
  };

  const filteredBonds = bonds.filter(bond =>
    bond.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bond.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastBond = currentPage * bondsPerPage;
  const indexOfFirstBond = indexOfLastBond - bondsPerPage;
  const currentBonds = filteredBonds.slice(indexOfFirstBond, indexOfLastBond);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                                            onClick={() => handleGenerateReport(bond)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                            title="Gerar Relatório"
                                        >
                                            <FaFileAlt />
                                        </button>
                                        <button
                                            onClick={() => handleUploadDocument(bond)}
                                            className="text-green-600 hover:text-green-900"
                                            title="Adicionar Documentos"
                                        >
                                            <FaUpload />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center mb-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
                        <h3 className="text-lg font-semibold">Gerando relatório...</h3>
                    </div>
                    {report && (
                        <pre className="whitespace-pre-wrap text-gray-700">{report}</pre>
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
                      onClick={() => handleGenerateReport(bond)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Gerar Relatório"
                    >
                      <FaFileAlt />
                    </button>
                    <button
                      onClick={() => handleUploadDocument(bond)}
                      className="text-green-600 hover:text-green-900"
                      title="Adicionar Documentos"
                    >
                      <FaUpload />
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
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Relatório de Sustentabilidade</h3>
          <pre className="whitespace-pre-wrap">{report}</pre>
        </div>
      )}
    </div>
  );
}

export default SustainabilityReport;
