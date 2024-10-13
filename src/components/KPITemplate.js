import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { MultiSelect } from "react-multi-select-component";

function KPITemplate({ kpis, setKpis, sidebarColor, buttonColor }) {
  const [isAddingKPI, setIsAddingKPI] = useState(false);
  const [editingKPI, setEditingKPI] = useState(null);
  const [newKPI, setNewKPI] = useState({
    name: '',
    unit: '',
    category: 'environment',
    subcategory: '',
    description: '',
    frequency: '',
    collection_method: '',
    status: '',
    year: new Date().getFullYear(),
    month: '',
    kpicode: '',
    company_category: '',
    isfavorite: false,
    compliance: [],
  });

  const units = ['kg', 'ton', 'm³', 'kWh', '%', '€', '$', 'unidades'];
  const frequencies = ['Diária', 'Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual'];
  const collectionMethods = ['Manual', 'Automático', 'Semi-automático', 'Estimativa', 'Cálculo'];
  const subcategories = {
    environment: [
      'Mudanças climáticas',
      'Poluição',
      'Água e recursos marinhos',
      'Uso de recursos e economia circular',
      'Biodiversidade e ecossistemas'
    ],
    social: [
      'Igualdade de oportunidades',
      'Condições de trabalho',
      'Respeito aos direitos humanos',
      'Questões sociais e comunitárias',
      'Saúde e segurança'
    ],
    governance: [
      'Ética empresarial',
      'Cultura corporativa',
      'Gestão de riscos e controles internos',
      'Composição e remuneração do conselho',
      'Transparência e divulgação'
    ]
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const statuses = ['Ativo', 'Inativo', 'Em progresso'];

  const complianceOptions = [
    { label: "CSRD", value: "csrd" },
    { label: "IDiversa", value: "idiversa" },
    { label: "Social Bond Principles", value: "social_bond_principles" },
  ];

  const complianceFullNames = {
    'csrd': 'CSRD',
    'idiversa': 'IDiversa',
    'social_bond_principles': 'Social Bond Principles'
  };

  const fetchKPIs = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/kpi-templates');
      setKpis(response.data);
    } catch (error) {
      console.error('Erro ao buscar KPI Templates:', error);
    }
  }, [setKpis]);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewKPI(prev => ({ ...prev, [name]: value }));
  };

  const handleComplianceChange = (selected) => {
    setNewKPI(prev => ({ ...prev, compliance: selected.map(item => item.value) }));
  };

  const handleAddKPI = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/kpi-templates', newKPI);
      setKpis([...kpis, response.data]);
      setIsAddingKPI(false);
      setNewKPI({
        name: '',
        unit: '',
        category: 'environment',
        subcategory: '',
        description: '',
        frequency: '',
        collection_method: '',
        status: '',
        year: new Date().getFullYear(),
        month: '',
        kpicode: '',
        company_category: '',
        isfavorite: false,
        compliance: [],
      });
    } catch (error) {
      console.error('Erro ao adicionar KPI Template:', error);
    }
  };

  const handleUpdateKPI = async () => {
    if (editingKPI) {
      try {
        const response = await axios.put(`http://localhost:8000/api/kpi-templates/${editingKPI.id}`, editingKPI);
        setKpis(prevKPIs => prevKPIs.map(kpi => (kpi.id === editingKPI.id ? response.data : kpi)));
        setEditingKPI(null);
      } catch (error) {
        console.error('Erro ao atualizar KPI Template:', error);
      }
    }
  };

  const handleDeleteKPI = async (id) => {
    if (window.confirm('Tem certeza de que deseja excluir este KPI Template?')) {
      try {
        await axios.delete(`http://localhost:8000/api/kpi-templates/${id}`);
        setKpis(prevKPIs => prevKPIs.filter(kpi => kpi.id !== id));
      } catch (error) {
        console.error('Erro ao excluir KPI Template:', error);
      }
    }
  };

  const renderKPIForm = (kpi, isAdding) => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block mb-2">Nome</label>
        <input
          type="text"
          name="name"
          value={kpi.name}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-2">Unidade</label>
        <select
          name="unit"
          value={kpi.unit}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione uma unidade</option>
          {units.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-2">Categoria</label>
        <select
          name="category"
          value={kpi.category}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="environment">Ambiente</option>
          <option value="social">Social</option>
          <option value="governance">Governança</option>
        </select>
      </div>
      <div>
        <label className="block mb-2">Subcategoria</label>
        <select
          name="subcategory"
          value={kpi.subcategory}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione uma subcategoria</option>
          {subcategories[kpi.category]?.map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
      </div>
      <div className="col-span-2">
        <label className="block mb-2">Descrição</label>
        <textarea
          name="description"
          value={kpi.description}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          rows="3"
        ></textarea>
      </div>
      <div>
        <label className="block mb-2">Frequência</label>
        <select
          name="frequency"
          value={kpi.frequency}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione uma frequência</option>
          {frequencies.map(freq => (
            <option key={freq} value={freq}>{freq}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-2">Método de Coleta</label>
        <select
          name="collection_method"
          value={kpi.collection_method}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione um método</option>
          {collectionMethods.map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-2">Status</label>
        <select
          name="status"
          value={kpi.status}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione um status</option>
          {statuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-2">Ano</label>
        <select
          name="year"
          value={kpi.year}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-2">Mês</label>
        <input
          type="number"
          name="month"
          value={kpi.month}
          onChange={handleInputChange}
          min="1"
          max="12"
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-2">Código KPI</label>
        <input
          type="text"
          name="kpicode"
          value={kpi.kpicode}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-2">Categoria da Empresa</label>
        <input
          type="text"
          name="company_category"
          value={kpi.company_category}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="col-span-2">
        <label className="block mb-2">Compliance</label>
        <MultiSelect
          options={complianceOptions}
          value={kpi.compliance.map(c => ({ label: complianceFullNames[c], value: c }))}
          onChange={handleComplianceChange}
          labelledBy="Selecione"
        />
      </div>
      <div className="col-span-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isfavorite"
            checked={kpi.isfavorite}
            onChange={(e) => handleInputChange({ target: { name: 'isfavorite', value: e.target.checked } })}
            className="mr-2"
          />
          É favorito
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Gerenciamento de Templates de KPI</h2>
      
      <button
        onClick={() => setIsAddingKPI(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        style={{ backgroundColor: buttonColor }}
      >
        Adicionar Novo Template de KPI
      </button>

      {(isAddingKPI || editingKPI) && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-bold mb-2">
            {isAddingKPI ? 'Adicionar Novo Template de KPI' : 'Editar Template de KPI'}
          </h3>
          {renderKPIForm(isAddingKPI ? newKPI : editingKPI, isAddingKPI)}
          <div className="mt-4 space-x-2">
            <button
              onClick={isAddingKPI ? handleAddKPI : handleUpdateKPI}
              className="text-white px-4 py-2 rounded hover:opacity-80"
              style={{ backgroundColor: buttonColor }}
            >
              {isAddingKPI ? 'Adicionar' : 'Atualizar'}
            </button>
            <button
              onClick={() => {
                setIsAddingKPI(false);
                setEditingKPI(null);
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
              <th className="px-4 py-2 border">Nome</th>
              <th className="px-4 py-2 border">Categoria</th>
              <th className="px-4 py-2 border">Unidade</th>
              <th className="px-4 py-2 border">Frequência</th>
              <th className="px-4 py-2 border">Código KPI</th>
              <th className="px-4 py-2 border">Compliance</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {kpis.map((kpi) => (
              <tr key={kpi.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border">{kpi.name}</td>
                <td className="px-4 py-2 border capitalize">{kpi.category}</td>
                <td className="px-4 py-2 border">{kpi.unit}</td>
                <td className="px-4 py-2 border">{kpi.frequency}</td>
                <td className="px-4 py-2 border">{kpi.kpicode}</td>
                <td className="px-4 py-2 border">
                  {kpi.compliance && kpi.compliance.map(item => complianceFullNames[item] || item).join(', ')}
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => setEditingKPI(kpi)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteKPI(kpi.id)}
                    className="text-red-500 hover:text-red-700"
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
  );
}

export default KPITemplate;