import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileOutput } from 'lucide-react';
import { API_URL } from '../config';

function SustainabilityReport({ sidebarColor, buttonColor }) {
  const [bonds, setBonds] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchBonds = async () => {
      try {
        const response = await axios.get(`${API_URL}/bonds`);
        console.log('Bonds fetched:', response.data);
        setBonds(response.data);
      } catch (error) {
        console.error('Erro ao buscar títulos:', error);
        setError('Erro ao carregar lista de títulos');
      }
    };

    fetchBonds();
  }, []);

  const generateReport = async (bond) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/sustainability/report`, {
        bond_name: bond.bond_name
      });

      setReport(response.data);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      setError(error.response?.data?.message || 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const filteredBonds = bonds.filter(bond => 
    bond.bond_name && bond.bond_name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 mb-6">
        <FileOutput size={24} />
        <h1 className="text-2xl font-bold">Relatório de Sustentabilidade</h1>
      </div>

      {/* Filtro */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filtrar títulos..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded w-full"
        />
      </div>

      {/* Tabela de Títulos */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Títulos Disponíveis</h2>
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Nome</th>
              <th className="px-4 py-2 border">Tipo</th>
              <th className="px-4 py-2 border">Valor Total</th>
              <th className="px-4 py-2 border">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filteredBonds.length > 0 ? (
              filteredBonds.map((bond) => (
                <tr key={bond.id}>
                  <td className="px-4 py-2 border">{bond.bond_name}</td>
                  <td className="px-4 py-2 border">{bond.bond_type}</td>
                  <td className="px-4 py-2 border">{bond.total_amount}</td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => generateReport(bond)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Gerar Relatório de Sustentabilidade
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center px-4 py-2 border">Nenhum título encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Exibição do Relatório */}
      {report && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Relatório Gerado</h2>
            <p className="text-sm text-gray-600">Data: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose max-w-none">
            <div className="h-[600px] overflow-y-auto p-4 border rounded-md bg-gray-50">
              {report.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-800">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}

export default SustainabilityReport;
