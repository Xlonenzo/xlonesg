import React, { useState, useEffect } from 'react';
import axios from 'axios';

function KPIManagement() {
  const [kpis, setKpis] = useState([]);
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
    kpicode: ''
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

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/kpis');
      setKpis(response.data);
    } catch (error) {
      console.error('Erro ao buscar KPIs:', error);
    }
  };

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
        kpicode: ''
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

  const handleInputChange = (e, isNewKPI = false) => {
    const { name, value } = e.target;
    if (isNewKPI) {
      setNewKPI(prev => ({ ...prev, [name]: value }));
    } else {
      setEditingKPI(prev => ({ ...prev, [name]: value }));
    }
  };

  const renderKPIForm = (kpi, isNewKPI = false) => (
    <div className="space-y-2">
      <input
        type="text"
        name="name"
        value={kpi.name}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        placeholder="Nome"
        className="w-full p-2 border rounded"
      />
      <select
        name="unit"
        value={kpi.unit}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        className="w-full p-2 border rounded"
      >
        <option value="">Selecione a Unidade</option>
        {units.map(unit => (
          <option key={unit} value={unit}>{unit}</option>
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
        <option value="">Selecione a Subcategoria</option>
        {subcategories[kpi.category]?.map(subcat => (
          <option key={subcat} value={subcat}>{subcat}</option>
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
        <option value="">Selecione a Frequência</option>
        {frequencies.map(freq => (
          <option key={freq} value={freq}>{freq}</option>
        ))}
      </select>
      <select
        name="collection_method"
        value={kpi.collection_method}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        className="w-full p-2 border rounded"
      >
        <option value="">Selecione o Método de Coleta</option>
        {collectionMethods.map(method => (
          <option key={method} value={method}>{method}</option>
        ))}
      </select>
      <select
        name="status"
        value={kpi.status}
        onChange={(e) => handleInputChange(e, isNewKPI)}
        className="w-full p-2 border rounded"
      >
        <option value="">Selecione o Status</option>
        <option value="Em andamento">Em andamento</option>
        <option value="Concluído">Concluído</option>
        <option value="Não iniciado">Não iniciado</option>
        <option value="Em risco">Em risco</option>
      </select>
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
        <option value="">Selecione o Mês</option>
        {[...Array(12)].map((_, i) => (
          <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
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
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gerenciamento de KPIs</h2>
      <button
        onClick={() => setIsAddingKPI(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Adicionar Novo KPI
      </button>

      {isAddingKPI && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-bold mb-2">Adicionar Novo KPI</h3>
          {renderKPIForm(newKPI, true)}
          <div className="mt-4 space-x-2">
            <button
              onClick={handleAddKPI}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="bg-white p-4 rounded shadow">
            {editingKPI && editingKPI.id === kpi.id ? (
              <div>
                {renderKPIForm(editingKPI)}
                <div className="mt-4 space-x-2">
                  <button
                    onClick={handleUpdateKPI}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
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
            ) : (
              <div>
                <h3 className="text-lg font-bold">{kpi.name}</h3>
                <p>Categoria: {kpi.category}</p>
                <p>Subcategoria: {kpi.subcategory}</p>
                <p>
                  Valor Alvo: {kpi.target_value} {kpi.unit}
                </p>
                <p>
                  Valor Atual: {kpi.actual_value} {kpi.unit}
                </p>
                <p>Frequência: {kpi.frequency}</p>
                <p>Método de Coleta: {kpi.collection_method}</p>
                <p>Status: {kpi.status}</p>
                <p>Ano: {kpi.year}</p>
                <p>Mês: {kpi.month}</p>
                <p>CNPJ: {kpi.cnpj}</p>
                <p>Código KPI: {kpi.kpicode}</p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => setEditingKPI(kpi)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteKPI(kpi.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default KPIManagement;