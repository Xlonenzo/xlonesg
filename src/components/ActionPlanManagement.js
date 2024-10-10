import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ActionPlanManagement() {
  const [actionPlans, setActionPlans] = useState([]);
  const [newActionPlan, setNewActionPlan] = useState({
    objective: '',
  });
  const [isAddingPlan, setIsAddingPlan] = useState(false);

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
      });
      setIsAddingPlan(false);
    } catch (error) {
      console.error('Erro ao adicionar plano de ação:', error);
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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Adicionar Novo Plano de Ação</h3>
          <div className="space-y-4">
            <textarea
              placeholder="Objetivo"
              value={newActionPlan.objective}
              onChange={(e) => setNewActionPlan({ ...newActionPlan, objective: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mt-4 space-x-2">
            <button
              onClick={handleAddActionPlan}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Salvar Plano de Ação
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

      <div className="space-y-4">
        {actionPlans.map((plan) => (
          <div key={plan.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold">Objetivo: {plan.objective}</h3>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => handleDeleteActionPlan(plan.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Excluir Plano de Ação
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActionPlanManagement;