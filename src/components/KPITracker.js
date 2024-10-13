import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';

function KPITracker({ sidebarColor, buttonColor }) {
  const [kpiEntries, setKPIEntries] = useState([]);
  const [kpiTemplates, setKpiTemplates] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [newKPIEntry, setNewKPIEntry] = useState({
    template_id: '',
    cnpj: '',
    actual_value: 0,
    target_value: 0,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    status: 'Ativo'
  });
  const [isAddingKPIEntry, setIsAddingKPIEntry] = useState(false);
  const [editingKPIEntry, setEditingKPIEntry] = useState(null);

  useEffect(() => {
    fetchKPIEntries();
    fetchKPITemplates();
    fetchCompanies();
  }, []);

  const fetchKPIEntries = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/kpi-entries');
      setKPIEntries(response.data);
    } catch (error) {
      console.error('Erro ao buscar entradas de KPI:', error);
    }
  };

  const fetchKPITemplates = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/kpi-templates');
      setKpiTemplates(response.data);
    } catch (error) {
      console.error('Erro ao buscar templates de KPI:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewKPIEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleAddKPIEntry = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/kpi-entries', {
        ...newKPIEntry,
        template_id: parseInt(newKPIEntry.template_id),
        actual_value: parseFloat(newKPIEntry.actual_value),
        target_value: parseFloat(newKPIEntry.target_value),
        year: parseInt(newKPIEntry.year),
        month: parseInt(newKPIEntry.month)
      });
      setKPIEntries([...kpiEntries, response.data]);
      setIsAddingKPIEntry(false);
      setNewKPIEntry({
        template_id: '',
        cnpj: '',
        actual_value: 0,
        target_value: 0,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        status: 'Ativo'
      });
    } catch (error) {
      console.error('Erro ao adicionar entrada de KPI:', error);
    }
  };

  const handleUpdateKPIEntry = async () => {
    if (editingKPIEntry) {
      try {
        const response = await axios.put(`http://localhost:8000/api/kpi-entries/${editingKPIEntry.id}`, editingKPIEntry);
        setKPIEntries(prevEntries => prevEntries.map(entry => (entry.id === editingKPIEntry.id ? response.data : entry)));
        setEditingKPIEntry(null);
      } catch (error) {
        console.error('Erro ao atualizar entrada de KPI:', error);
      }
    }
  };

  const handleDeleteKPIEntry = async (id) => {
    if (window.confirm('Tem certeza de que deseja excluir esta entrada de KPI?')) {
      try {
        await axios.delete(`http://localhost:8000/api/kpi-entries/${id}`);
        setKPIEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
      } catch (error) {
        console.error('Erro ao excluir entrada de KPI:', error);
      }
    }
  };

  const renderKPIEntryForm = (entry, isAdding) => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block mb-2">Template de KPI</label>
        <select
          name="template_id"
          value={entry.template_id}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione um template</option>
          {kpiTemplates.map(template => (
            <option key={template.id} value={template.id}>{template.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-2">Empresa (CNPJ)</label>
        <select
          name="cnpj"
          value={entry.cnpj}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione uma empresa</option>
          {companies.map(company => (
            <option key={company.id} value={company.cnpj}>{company.name} ({company.cnpj})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-2">Valor Atual</label>
        <input
          type="number"
          name="actual_value"
          value={entry.actual_value}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-2">Valor Esperado</label>
        <input
          type="number"
          name="target_value"
          value={entry.target_value}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-2">Ano</label>
        <input
          type="number"
          name="year"
          value={entry.year}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          min={2000}
          max={2100}
        />
      </div>
      <div>
        <label className="block mb-2">Mês</label>
        <input
          type="number"
          name="month"
          value={entry.month}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          min={1}
          max={12}
        />
      </div>
      <div>
        <label className="block mb-2">Status</label>
        <select
          name="status"
          value={entry.status}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
          <option value="Em Progresso">Em Progresso</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Rastreador de KPIs</h2>
      
      <button
        onClick={() => setIsAddingKPIEntry(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        style={{ backgroundColor: buttonColor }}
      >
        Adicionar Nova Entrada de KPI
      </button>

      {(isAddingKPIEntry || editingKPIEntry) && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-bold mb-2">
            {isAddingKPIEntry ? 'Adicionar Nova Entrada de KPI' : 'Editar Entrada de KPI'}
          </h3>
          {renderKPIEntryForm(isAddingKPIEntry ? newKPIEntry : editingKPIEntry, isAddingKPIEntry)}
          <div className="mt-4 space-x-2">
            <button
              onClick={isAddingKPIEntry ? handleAddKPIEntry : handleUpdateKPIEntry}
              className="text-white px-4 py-2 rounded hover:opacity-80"
              style={{ backgroundColor: buttonColor }}
            >
              {isAddingKPIEntry ? 'Adicionar' : 'Atualizar'}
            </button>
            <button
              onClick={() => {
                setIsAddingKPIEntry(false);
                setEditingKPIEntry(null);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Nome do KPI</th>
              <th className="px-4 py-2 border">Empresa</th>
              <th className="px-4 py-2 border">Valor Atual</th>
              <th className="px-4 py-2 border">Valor Esperado</th>
              <th className="px-4 py-2 border">Ano</th>
              <th className="px-4 py-2 border">Mês</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {kpiEntries.map((entry) => {
              const template = kpiTemplates.find(t => t.id === entry.template_id);
              const company = companies.find(c => c.cnpj === entry.cnpj);
              return (
                <tr key={entry.id} className="hover:bg-gray-100">
                  <td className="px-4 py-2 border">{template ? template.name : 'N/A'}</td>
                  <td className="px-4 py-2 border">{company ? company.name : 'N/A'}</td>
                  <td className="px-4 py-2 border">{entry.actual_value}</td>
                  <td className="px-4 py-2 border">{entry.target_value}</td>
                  <td className="px-4 py-2 border">{entry.year}</td>
                  <td className="px-4 py-2 border">{entry.month}</td>
                  <td className="px-4 py-2 border">{entry.status}</td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => setEditingKPIEntry(entry)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteKPIEntry(entry.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default KPITracker;