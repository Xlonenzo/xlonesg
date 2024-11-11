import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaTasks } from 'react-icons/fa';
import TaskManagement from './TaskManagement';
import { API_URL } from '../config';

function ActionPlanManagement() {
  const [actionPlans, setActionPlans] = useState([]);
  const [newActionPlan, setNewActionPlan] = useState({
    objective: '',
    start_date: '',
    end_date: '',
    entry_id: null,
  });
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [managingTasks, setManagingTasks] = useState(null);
  const [viewKpis, setViewKpis] = useState([]);

  useEffect(() => {
    fetchActionPlans();
    fetchViewKPIs();
  }, []);

  const fetchActionPlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/action-plans`);
      setActionPlans(response.data);
    } catch (error) {
      console.error('Erro ao buscar planos de ação:', error);
    }
  };

  const fetchViewKPIs = async () => {
    try {
      const response = await axios.get(`${API_URL}/kpi-entries-with-templates`);
      console.log('KPIs da view:', response.data);
      setViewKpis(response.data);
    } catch (error) {
      console.error('Erro ao buscar KPIs da view:', error);
    }
  };

  const handleAddActionPlan = async () => {
    try {
      const response = await axios.post(`${API_URL}/action-plans`, newActionPlan);
      setActionPlans([...actionPlans, response.data]);
      setNewActionPlan({
        objective: '',
        start_date: '',
        end_date: '',
        entry_id: null,
      });
      setIsAddingPlan(false);
    } catch (error) {
      console.error('Erro ao adicionar plano de ação:', error);
    }
  };

  const handleUpdateActionPlan = async () => {
    try {
      const response = await axios.put(`${API_URL}/action-plans/${editingPlan.id}`, editingPlan);
      setActionPlans(actionPlans.map(plan => plan.id === editingPlan.id ? response.data : plan));
      setEditingPlan(null);
    } catch (error) {
      console.error('Erro ao atualizar plano de ação:', error);
    }
  };

  const handleDeleteActionPlan = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este plano de ação?')) {
      try {
        const response = await axios.delete(`${API_URL}/action-plans/${id}`);
        if (response.status === 200) {
          setActionPlans(actionPlans.filter((plan) => plan.id !== id));
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.error('Erro ao deletar plano de ação: Plano não encontrado');
          alert('Erro: O plano de ação não foi encontrado. Ele pode já ter sido deletado.');
        } else {
          console.error('Erro ao deletar plano de ação:', error);
          alert('Ocorreu um erro ao tentar deletar o plano de ação. Por favor, tente novamente.');
        }
      }
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
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-bold mb-2">Adicionar Novo Plano de Ação</h3>
          <input
            type="text"
            value={newActionPlan.objective}
            onChange={(e) => setNewActionPlan({...newActionPlan, objective: e.target.value})}
            placeholder="Objetivo"
            className="w-full p-2 border rounded mb-2"
          />
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de início
            </label>
            <input
              type="date"
              value={newActionPlan.start_date}
              onChange={(e) => setNewActionPlan({...newActionPlan, start_date: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de fim
            </label>
            <input
              type="date"
              value={newActionPlan.end_date}
              onChange={(e) => setNewActionPlan({...newActionPlan, end_date: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <select
            value={newActionPlan.entry_id || ''}
            onChange={(e) => setNewActionPlan({...newActionPlan, entry_id: e.target.value ? parseInt(e.target.value) : null})}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="">Selecione um KPI</option>
            {viewKpis.map(kpi => (
              <option key={kpi.entry_id} value={kpi.entry_id}>{kpi.name || kpi.template_name}</option>
            ))}
          </select>
          <button
            onClick={handleAddActionPlan}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Adicionar Plano de Ação
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Objetivo</th>
              <th className="px-4 py-2 border">KPI</th>
              <th className="px-4 py-2 border">Data de Início</th>
              <th className="px-4 py-2 border">Data de Fim</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {actionPlans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border">{plan.objective}</td>
                <td className="px-4 py-2 border">
                  {viewKpis.find(kpi => kpi.entry_id === plan.entry_id)?.template_name || '-'}
                </td>
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
                    <button
                      onClick={() => setManagingTasks(plan.id)}
                      className="text-green-500 hover:text-green-700"
                      title="Gerenciar Tarefas"
                    >
                      <FaTasks />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingPlan && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-bold mb-2">Editar Plano de Ação</h3>
          <input
            type="text"
            value={editingPlan.objective}
            onChange={(e) => setEditingPlan({...editingPlan, objective: e.target.value})}
            placeholder="Objetivo"
            className="w-full p-2 border rounded mb-2"
          />
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de início
            </label>
            <input
              type="date"
              value={editingPlan.start_date}
              onChange={(e) => setEditingPlan({...editingPlan, start_date: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de fim
            </label>
            <input
              type="date"
              value={editingPlan.end_date}
              onChange={(e) => setEditingPlan({...editingPlan, end_date: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <select
            value={editingPlan.entry_id || ''}
            onChange={(e) => setEditingPlan({...editingPlan, entry_id: e.target.value ? parseInt(e.target.value) : null})}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="">Selecione um KPI</option>
            {viewKpis.map(kpi => (
              <option key={kpi.entry_id} value={kpi.entry_id}>{kpi.name || kpi.template_name}</option>
            ))}
          </select>
          <button
            onClick={handleUpdateActionPlan}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Atualizar Plano de Ação
          </button>
        </div>
      )}

      {managingTasks && (
        <TaskManagement
          actionPlanId={managingTasks}
          onClose={() => setManagingTasks(null)}
        />
      )}
    </div>
  );
}

export default ActionPlanManagement;
