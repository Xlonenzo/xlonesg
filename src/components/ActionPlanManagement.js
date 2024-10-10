import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';

function ActionPlanManagement() {
  const [actionPlans, setActionPlans] = useState([]);
  const [newActionPlan, setNewActionPlan] = useState({
    objective: '',
    start_date: '',
    end_date: '',
  });
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  useEffect(() => {
    fetchActionPlans();
  }, []);

  const fetchActionPlans = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/action-plans');
      setActionPlans(response.data);
    } catch (error) {
      console.error('Erro ao buscar planos de ação:', error);
    }
  };

  const handleAddActionPlan = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/action-plans', newActionPlan);
      setActionPlans([...actionPlans, response.data]);
      setNewActionPlan({
        objective: '',
        start_date: '',
        end_date: '',
      });
      setIsAddingPlan(false);
    } catch (error) {
      console.error('Erro ao adicionar plano de ação:', error);
    }
  };

  const handleUpdateActionPlan = async () => {
    try {
      const response = await axios.put(`http://localhost:8000/api/action-plans/${editingPlan.id}`, editingPlan);
      setActionPlans(actionPlans.map(plan => plan.id === editingPlan.id ? response.data : plan));
      setEditingPlan(null);
    } catch (error) {
      console.error('Erro ao atualizar plano de ação:', error);
    }
  };

  const handleDeleteActionPlan = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/action-plans/${id}`);
      setActionPlans(actionPlans.filter((plan) => plan.id !== id));
    } catch (error) {
      console.error('Erro ao deletar plano de ação:', error);
    }
  };

  const renderActionPlanForm = (plan, isNewPlan = false) => (
    <div className="grid grid-cols-2 gap-4">
      <textarea
        name="objective"
        value={plan.objective}
        onChange={(e) => isNewPlan ? setNewActionPlan({...newActionPlan, objective: e.target.value}) : setEditingPlan({...editingPlan, objective: e.target.value})}
        placeholder="Objetivo"
        className="col-span-2 w-full p-2 border rounded"
      />
      <input
        type="date"
        name="start_date"
        value={plan.start_date}
        onChange={(e) => isNewPlan ? setNewActionPlan({...newActionPlan, start_date: e.target.value}) : setEditingPlan({...editingPlan, start_date: e.target.value})}
        className="w-full p-2 border rounded"
      />
      <input
        type="date"
        name="end_date"
        value={plan.end_date}
        onChange={(e) => isNewPlan ? setNewActionPlan({...newActionPlan, end_date: e.target.value}) : setEditingPlan({...editingPlan, end_date: e.target.value})}
        className="w-full p-2 border rounded"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gerenciamento de Planos de Ação</h2>

      <button
        onClick={() => setIsAddingPlan(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Adicionar Novo Plano de Ação
      </button>

      {isAddingPlan && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-bold mb-2">Adicionar Novo Plano de Ação</h3>
          {renderActionPlanForm(newActionPlan, true)}
          <div className="mt-4 space-x-2">
            <button
              onClick={handleAddActionPlan}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Adicionar
            </button>
            <button
              onClick={() => setIsAddingPlan(false)}
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
              <th className="px-4 py-2 border">Objetivo</th>
              <th className="px-4 py-2 border">Data de Início</th>
              <th className="px-4 py-2 border">Data de Fim</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {actionPlans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border">{plan.objective}</td>
                <td className="px-4 py-2 border">{plan.start_date}</td>
                <td className="px-4 py-2 border">{plan.end_date}</td>
                <td className="px-4 py-2 border">
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={() => setEditingPlan(plan)}
                      className="text-yellow-500 hover:text-yellow-700"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteActionPlan(plan.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {actionPlans.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center p-4">
                  Nenhum plano de ação encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingPlan && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-bold mb-2">Editar Plano de Ação</h3>
          {renderActionPlanForm(editingPlan)}
          <div className="mt-4 space-x-2">
            <button
              onClick={handleUpdateActionPlan}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Salvar
            </button>
            <button
              onClick={() => setEditingPlan(null)}
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

export default ActionPlanManagement;