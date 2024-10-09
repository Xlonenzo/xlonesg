import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';

function KPIManagement({ kpis, setKpis, sidebarColor, buttonColor }) {
  const [isAddingKPI, setIsAddingKPI] = useState(false);
  const [editingKPI, setEditingKPI] = useState(null);
  const [newKPI, setNewKPI] = useState({
    name: '',
    unit: '',
    category: 'environment',
    subcategory: '',
    description: '',
    target_value: 0,
    actual_value: 0,
    frequency: '',
    collection_method: '',
    status: '',
    year: new Date().getFullYear(),
    month: '',
    cnpj: '',
    kpicode: '',
    company_category: '',
    isfavorite: false
  });


  const [filters, setFilters] = useState({
    year: '',
    status: '',
    name: '',
    category: '',
    target_value: '',
    actual_value: '',
    month: '',
    cnpj: '',
    kpicode: '',
    company_category: '',
    isfavorite: ''
  });

  const [sortConfig, setSortConfig] = useState({
    key: '',
    direction: 'ascending'
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

  const fetchKPIs = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/kpis');
      setKpis(response.data);
    } catch (error) {
      console.error('Erro ao buscar KPIs:', error);
    }
  }, [setKpis]);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  const handleAddKPI = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/kpis', newKPI);
      setKpis([...kpis, response.data]);
      setIsAddingKPI(false);
      setNewKPI({
        name: '',
        unit: '',
        category: 'environment',
        subcategory: '',
        description: '',
        target_value: 0,
        actual_value: 0,
        frequency: '',
        collection_method: '',
        status: '',
        year: new Date().getFullYear(),
        month: '',
        cnpj: '',
        kpicode: '',
        company_category: '',
        isfavorite: false
      });
    } catch (error) {
      console.error('Erro ao adicionar KPI:', error);
    }
  };

  const handleUpdateKPI = async () => {
    if (editingKPI) {
      try {
        const response = await axios.put(`http://localhost:8000/api/kpis/${editingKPI.id}`, editingKPI);
        setKpis(prevKPIs => prevKPIs.map(kpi => (kpi.id === editingKPI.id ? response.data : kpi)));
        setEditingKPI(null);
      } catch (error) {
        console.error('Erro ao atualizar KPI:', error);
      }
    }
  };

  const handleDeleteKPI = async (id) => {
    if (window.confirm('Tem certeza de que deseja excluir este KPI?')) {
      try {
        await axios.delete(`http://localhost:8000/api/kpis/${id}`);
        setKpis(prevKPIs => prevKPIs.filter(kpi => kpi.id !== id));
      } catch (error) {
        console.error('Erro ao excluir KPI:', error);
      }
    }
  };

  const handleInputChange = (e, isNewKPI) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    if (isNewKPI) {
      setNewKPI(prev => ({ ...prev, [name]: newValue }));
    } else {
      setEditingKPI(prev => ({ ...prev, [name]: newValue }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedKpis = (kpisToSort) => {
    if (sortConfig.key) {
      return [...kpisToSort].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return kpisToSort;
  };

  const getFilteredKpis = () => {
    return kpis.filter(kpi => {
      return (
        (filters.year === '' || kpi.year.toString() === filters.year) &&
        (filters.status === '' || kpi.status === filters.status) &&
        kpi.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        (filters.category === '' || kpi.category === filters.category) &&
        (filters.target_value === '' || kpi.target_value.toString() === filters.target_value) &&
        (filters.actual_value === '' || kpi.actual_value.toString() === filters.actual_value) &&
        (filters.month === '' || kpi.month.toString() === filters.month) &&
        (filters.cnpj === '' || kpi.cnpj.toLowerCase().includes(filters.cnpj.toLowerCase())) &&
        (filters.kpicode === '' || kpi.kpicode.toLowerCase().includes(filters.kpicode.toLowerCase())) &&
        (filters.company_category === '' || kpi.company_category.toLowerCase().includes(filters.company_category.toLowerCase())) &&
        (filters.isfavorite === '' || kpi.isfavorite.toString() === filters.isfavorite)
      );
    });
  };

  const sortedKpis = getSortedKpis(getFilteredKpis());

  const renderKPIForm = (kpi, isNewKPI = false) => (
    <div className="grid grid-cols-2 gap-4">
      <input
        type="text"
        name="name"
        value={kpi.name}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        placeholder="Nome do KPI"
        className="w-full p-2 border rounded"
      />
      <select
        name="unit"
        value={kpi.unit}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        className="w-full p-2 border rounded"
      >
        <option value="">Selecione uma unidade</option>
        {units.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>
      <select
        name="category"
        value={kpi.category}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        className="w-full p-2 border rounded"
      >
        <option value="environment">Meio Ambiente</option>
        <option value="social">Social</option>
        <option value="governance">Governança</option>
      </select>
      <select
        name="subcategory"
        value={kpi.subcategory}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        className="w-full p-2 border rounded"
      >
        <option value="">Selecione uma subcategoria</option>
        {subcategories[kpi.category]?.map((subcat) => (
          <option key={subcat} value={subcat}>
            {subcat}
          </option>
        ))}
      </select>
      <textarea
        name="description"
        value={kpi.description}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        placeholder="Descrição"
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        name="target_value"
        value={kpi.target_value}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        placeholder="Valor Alvo"
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        name="actual_value"
        value={kpi.actual_value}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        placeholder="Valor Atual"
        className="w-full p-2 border rounded"
      />
      <select
        name="frequency"
        value={kpi.frequency}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        className="w-full p-2 border rounded"
      >
        <option value="">Selecione uma frequência</option>
        {frequencies.map((freq) => (
          <option key={freq} value={freq}>
            {freq}
          </option>
        ))}
      </select>
      <select
        name="collection_method"
        value={kpi.collection_method}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        className="w-full p-2 border rounded"
      >
        <option value="">Selecione um método de coleta</option>
        {collectionMethods.map((method) => (
          <option key={method} value={method}>
            {method}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="status"
        value={kpi.status}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        placeholder="Status"
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        name="year"
        value={kpi.year}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        placeholder="Ano"
        className="w-full p-2 border rounded"
      />
      <select
        name="month"
        value={kpi.month}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        className="w-full p-2 border rounded"
      >
        <option value="">Selecione um mês</option>
        {[...Array(12)].map((_, i) => (
          <option key={i + 1} value={i + 1}>
            {new Date(0, i).toLocaleString('default', { month: 'long' })}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="cnpj"
        value={kpi.cnpj}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        placeholder="CNPJ"
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="kpicode"
        value={kpi.kpicode}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        placeholder="Código KPI"
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="company_category"
        value={kpi.company_category}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        placeholder="Categoria da Empresa"
        className="w-full p-2 border rounded"
      />
      
      {/* Novo campo isfavorite */}
      <div className="col-span-2 flex items-center">
        <input
          type="checkbox"
          name="isfavorite"
          checked={kpi.isfavorite}
          onChange={(e) => handleInputChange(e, isNewKPI)}
          className="mr-2"
        />
        <label htmlFor="isfavorite">Marcar como favorito</label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gerenciamento de KPIs</h2>
      
      <div className="flex justify-between items-center">
        <button
          onClick={() => setIsAddingKPI(true)}
          className="text-white px-4 py-2 rounded hover:opacity-80"
          style={{ backgroundColor: buttonColor }}
        >
          Adicionar Novo KPI
        </button>
        
        <div className="flex space-x-4">
          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Todos os anos</option>
            {years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
          
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Todos os status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isAddingKPI && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-bold mb-2">Adicionar Novo KPI</h3>
          {renderKPIForm(newKPI, true)}
          <div className="mt-4 space-x-2">
            <button
              onClick={handleAddKPI}
              className="text-white px-4 py-2 rounded hover:opacity-80"
              style={{ backgroundColor: buttonColor }}
            >
              Adicionar
            </button>
            <button
              onClick={() => setIsAddingKPI(false)}
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
              <th className="px-4 py-2 border">
                <div className="flex items-center">
                  <span onClick={() => handleSort('name')} className="cursor-pointer flex items-center">
                    Nome
                    {sortConfig.key === 'name' && (
                      sortConfig.direction === 'ascending' ? <span> ▲</span> : <span> ▼</span>
                    )}
                  </span>
                </div>
                <input
                  type="text"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  placeholder="Filtrar por Nome"
                  className="w-full mt-1 p-1 border rounded"
                />
              </th>
              <th className="px-4 py-2 border">
                <div className="flex items-center">
                  <span onClick={() => handleSort('category')} className="cursor-pointer flex items-center">
                    Categoria
                    {sortConfig.key === 'category' && (
                      sortConfig.direction === 'ascending' ? <span> ▲</span> : <span> ▼</span>
                    )}
                  </span>
                </div>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full mt-1 p-1 border rounded"
                >
                  <option value="">Todas</option>
                  <option value="environment">Meio Ambiente</option>
                  <option value="social">Social</option>
                  <option value="governance">Governança</option>
                </select>
              </th>
              <th className="px-4 py-2 border">
                <div className="flex items-center">
                  <span onClick={() => handleSort('target_value')} className="cursor-pointer flex items-center">
                    Valor Alvo
                    {sortConfig.key === 'target_value' && (
                      sortConfig.direction === 'ascending' ? <span> ▲</span> : <span> ▼</span>
                    )}
                  </span>
                </div>
                <input
                  type="number"
                  name="target_value"
                  value={filters.target_value}
                  onChange={handleFilterChange}
                  placeholder="Filtrar por Valor Alvo"
                  className="w-full mt-1 p-1 border rounded"
                />
              </th>
              <th className="px-4 py-2 border">
                <div className="flex items-center">
                  <span onClick={() => handleSort('actual_value')} className="cursor-pointer flex items-center">
                    Valor Atual
                    {sortConfig.key === 'actual_value' && (
                      sortConfig.direction === 'ascending' ? <span> ▲</span> : <span> ▼</span>
                    )}
                  </span>
                </div>
                <input
                  type="number"
                  name="actual_value"
                  value={filters.actual_value}
                  onChange={handleFilterChange}
                  placeholder="Filtrar por Valor Atual"
                  className="w-full mt-1 p-1 border rounded"
                />
              </th>
              <th className="px-4 py-2 border">
                <div className="flex items-center">
                  <span onClick={() => handleSort('cnpj')} className="cursor-pointer flex items-center">
                    CNPJ
                    {sortConfig.key === 'cnpj' && (
                      sortConfig.direction === 'ascending' ? <span> ▲</span> : <span> ▼</span>
                    )}
                  </span>
                </div>
                <input
                  type="text"
                  name="cnpj"
                  value={filters.cnpj}
                  onChange={handleFilterChange}
                  placeholder="Filtrar por CNPJ"
                  className="w-full mt-1 p-1 border rounded"
                />
              </th>
              <th className="px-4 py-2 border">
                <div className="flex items-center">
                  <span onClick={() => handleSort('kpicode')} className="cursor-pointer flex items-center">
                    Código KPI
                    {sortConfig.key === 'kpicode' && (
                      sortConfig.direction === 'ascending' ? <span> ▲</span> : <span> ▼</span>
                    )}
                  </span>
                </div>
                <input
                  type="text"
                  name="kpicode"
                  value={filters.kpicode}
                  onChange={handleFilterChange}
                  placeholder="Filtrar por Código KPI"
                  className="w-full mt-1 p-1 border rounded"
                />
              </th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedKpis.map((kpi) => (
              <tr key={kpi.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border">{kpi.name}</td>
                <td className="px-4 py-2 border capitalize">{kpi.category}</td>
                <td className="px-4 py-2 border">{kpi.target_value} {kpi.unit}</td>
                <td className="px-4 py-2 border">{kpi.actual_value} {kpi.unit}</td>
                <td className="px-4 py-2 border">{kpi.cnpj}</td>
                <td className="px-4 py-2 border">{kpi.kpicode}</td>
                <td className="px-4 py-2 border">
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={() => setEditingKPI(kpi)}
                      className="text-yellow-500 hover:text-yellow-700"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteKPI(kpi.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sortedKpis.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center p-4">
                  Nenhum KPI encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingKPI && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-bold mb-2">Editar KPI</h3>
          {renderKPIForm(editingKPI)}
          <div className="mt-4 space-x-2">
            <button
              onClick={handleUpdateKPI}
              className="text-white px-4 py-2 rounded hover:opacity-80"
              style={{ backgroundColor: buttonColor }}
            >
              Salvar
            </button>
            <button
              onClick={() => setEditingKPI(null)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default KPIManagement;