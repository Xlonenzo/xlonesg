// src/components/KPIManagement.jsx

import React, { useState } from 'react';

function KPIManagement({ kpis, setKpis }) {
  const [isAddingKPI, setIsAddingKPI] = useState(false);
  const [editingKPI, setEditingKPI] = useState(null);
  const [newKPI, setNewKPI] = useState({
    name: '',
    unit: '',
    category: 'environment',
    description: '',
    target_value: 0,
    actual_value: 0,
    frequency: '',
    collection_method: '',
    status: '',
    year: new Date().getFullYear(),
  });

  const handleAddKPI = () => {
    const nextId = kpis.length > 0 ? Math.max(...kpis.map(kpi => kpi.id)) + 1 : 1;
    setKpis(prevKPIs => [...prevKPIs, { ...newKPI, id: nextId }]);
    setIsAddingKPI(false);
    setNewKPI({
      name: '',
      unit: '',
      category: 'environment',
      description: '',
      target_value: 0,
      actual_value: 0,
      frequency: '',
      collection_method: '',
      status: '',
      year: new Date().getFullYear(),
    });
  };

  const handleUpdateKPI = () => {
    if (editingKPI) {
      setKpis(prevKPIs => prevKPIs.map(kpi => (kpi.id === editingKPI.id ? editingKPI : kpi)));
      setEditingKPI(null);
    }
  };

  const handleDeleteKPI = (id) => {
    if (window.confirm('Tem certeza de que deseja excluir este KPI?')) {
      setKpis(prevKPIs => prevKPIs.filter(kpi => kpi.id !== id));
    }
  };

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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Adicionar Novo KPI</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nome do KPI"
              value={newKPI.name}
              onChange={(e) => setNewKPI({ ...newKPI, name: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Unidade"
              value={newKPI.unit}
              onChange={(e) => setNewKPI({ ...newKPI, unit: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <select
              value={newKPI.category}
              onChange={(e) => setNewKPI({ ...newKPI, category: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="environment">Meio Ambiente</option>
              <option value="governance">Governança</option>
              <option value="social">Social</option>
            </select>
            <input
              type="number"
              placeholder="Ano"
              value={newKPI.year}
              onChange={(e) => setNewKPI({ ...newKPI, year: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Descrição"
              value={newKPI.description}
              onChange={(e) => setNewKPI({ ...newKPI, description: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Valor Alvo"
              value={newKPI.target_value}
              onChange={(e) => setNewKPI({ ...newKPI, target_value: parseFloat(e.target.value) })}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Valor Atual"
              value={newKPI.actual_value}
              onChange={(e) => setNewKPI({ ...newKPI, actual_value: parseFloat(e.target.value) })}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Frequência"
              value={newKPI.frequency}
              onChange={(e) => setNewKPI({ ...newKPI, frequency: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Método de Coleta"
              value={newKPI.collection_method}
              onChange={(e) => setNewKPI({ ...newKPI, collection_method: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Status"
              value={newKPI.status}
              onChange={(e) => setNewKPI({ ...newKPI, status: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mt-4 space-x-2">
            <button
              onClick={handleAddKPI}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Salvar
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
      <div className="space-y-4">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="bg-white p-4 rounded-lg shadow-md">
            {editingKPI && editingKPI.id === kpi.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editingKPI.name}
                  onChange={(e) => setEditingKPI({ ...editingKPI, name: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  value={editingKPI.unit}
                  onChange={(e) => setEditingKPI({ ...editingKPI, unit: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <select
                  value={editingKPI.category}
                  onChange={(e) => setEditingKPI({ ...editingKPI, category: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="environment">Meio Ambiente</option>
                  <option value="governance">Governança</option>
                  <option value="social">Social</option>
                </select>
                <textarea
                  value={editingKPI.description}
                  onChange={(e) => setEditingKPI({ ...editingKPI, description: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="number"
                  value={editingKPI.target_value}
                  onChange={(e) => setEditingKPI({ ...editingKPI, target_value: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="number"
                  value={editingKPI.actual_value}
                  onChange={(e) => setEditingKPI({ ...editingKPI, actual_value: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  value={editingKPI.frequency}
                  onChange={(e) => setEditingKPI({ ...editingKPI, frequency: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  value={editingKPI.collection_method}
                  onChange={(e) => setEditingKPI({ ...editingKPI, collection_method: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  value={editingKPI.status}
                  onChange={(e) => setEditingKPI({ ...editingKPI, status: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <div className="space-x-2">
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
                <p>
                  Valor Alvo: {kpi.target_value} {kpi.unit}
                </p>
                <p>
                  Valor Atual: {kpi.actual_value} {kpi.unit}
                </p>
                <p>Ano: {kpi.year}</p>
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
