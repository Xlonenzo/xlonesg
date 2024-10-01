import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ActionPlanManagement() {
  const [actionPlans, setActionPlans] = useState([]);
  const [newActionPlan, setNewActionPlan] = useState({
    objective: '',
    start_date: '',
    end_date: '',
    tasks: [],
  });
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    description: '',
    responsible: '',
    resources: '',
    deadline: '',
    risks: '',
    kpis: [],
  });

  // Lista de KPIs disponíveis para serem selecionados
  const availableKPIs = [
    'Redução de custos (%)',
    'Aumento de produtividade (%)',
    'Satisfação do cliente (NPS)',
    'Eficiência energética (kWh/m²)',
    'Tempo de inatividade (horas)',
    'Taxa de conversão (%)',
    'Emissões de CO₂ (tCO₂e)',
    'Taxa de crescimento (%)',
    'Retorno sobre investimento (ROI)',
    'Índice de qualidade (%)',
  ];

  useEffect(() => {
    fetchActionPlans();
  }, []);

  const fetchActionPlans = async () => {
    try {
      const response = await axios.get('http://localhost:8000/action-plans/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setActionPlans(response.data);
    } catch (error) {
      console.error('Erro ao buscar planos de ação:', error);
    }
  };

  const handleAddActionPlan = async () => {
    try {
      const response = await axios.post('http://localhost:8000/action-plans/', newActionPlan, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setActionPlans([...actionPlans, response.data]);
      setNewActionPlan({
        objective: '',
        start_date: '',
        end_date: '',
        tasks: [],
      });
      setIsAddingPlan(false);
    } catch (error) {
      console.error('Erro ao adicionar plano de ação:', error);
    }
  };

  const handleDeleteActionPlan = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/action-plans/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setActionPlans(actionPlans.filter((plan) => plan.id !== id));
    } catch (error) {
      console.error('Erro ao deletar plano de ação:', error);
    }
  };

  const handleAddTask = () => {
    setNewActionPlan({
      ...newActionPlan,
      tasks: [...newActionPlan.tasks, newTask],
    });
    setNewTask({
      description: '',
      responsible: '',
      resources: '',
      deadline: '',
      risks: '',
      kpis: [],
    });
    setIsAddingTask(false);
  };

  const handleKpiChange = (e) => {
    const value = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setNewTask({ ...newTask, kpis: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gerenciamento de Planos de Ação</h2>

      {/* Botão para adicionar novo plano de ação */}
      <button
        onClick={() => setIsAddingPlan(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Adicionar Novo Plano de Ação
      </button>

      {/* Formulário para adicionar novo plano de ação */}
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
            <input
              type="date"
              placeholder="Data de Início"
              value={newActionPlan.start_date}
              onChange={(e) => setNewActionPlan({ ...newActionPlan, start_date: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="date"
              placeholder="Data de Término"
              value={newActionPlan.end_date}
              onChange={(e) => setNewActionPlan({ ...newActionPlan, end_date: e.target.value })}
              className="w-full p-2 border rounded"
            />

            {/* Listagem das tarefas adicionadas */}
            <div>
              <h4 className="text-lg font-bold">Tarefas</h4>
              {newActionPlan.tasks.map((task, index) => (
                <div key={index} className="border p-2 rounded mb-2">
                  <p><strong>Descrição:</strong> {task.description}</p>
                  <p><strong>Responsável:</strong> {task.responsible}</p>
                  <p><strong>Recursos:</strong> {task.resources}</p>
                  <p><strong>Prazo:</strong> {task.deadline}</p>
                  <p><strong>Riscos:</strong> {task.risks}</p>
                  <p><strong>KPIs:</strong> {task.kpis.join(', ')}</p> {/* Exibição dos KPIs selecionados */}
                </div>
              ))}
              {/* Botão para adicionar nova tarefa */}
              <button
                onClick={() => setIsAddingTask(true)}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Adicionar Tarefa
              </button>
            </div>

            {/* Formulário para adicionar nova tarefa */}
            {isAddingTask && (
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="text-lg font-bold mb-2">Adicionar Nova Tarefa</h4>
                <input
                  type="text"
                  placeholder="Descrição"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  placeholder="Responsável"
                  value={newTask.responsible}
                  onChange={(e) => setNewTask({ ...newTask, responsible: e.target.value })}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  placeholder="Recursos"
                  value={newTask.resources}
                  onChange={(e) => setNewTask({ ...newTask, resources: e.target.value })}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="date"
                  placeholder="Prazo"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="w-full p-2 border rounded mb-2"
                />
                <textarea
                  placeholder="Riscos"
                  value={newTask.risks}
                  onChange={(e) => setNewTask({ ...newTask, risks: e.target.value })}
                  className="w-full p-2 border rounded mb-2"
                />
                
                {/* Seleção de KPIs */}
                <select
                  multiple
                  value={newTask.kpis}
                  onChange={handleKpiChange}
                  className="w-full p-2 border rounded mb-2"
                >
                  {availableKPIs.map((kpi, index) => (
                    <option key={index} value={kpi}>
                      {kpi}
                    </option>
                  ))}
                </select>

                <div className="space-x-2">
                  <button
                    onClick={handleAddTask}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Salvar Tarefa
                  </button>
                  <button
                    onClick={() => setIsAddingTask(false)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
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

      {/* Lista de planos de ação */}
      <div className="space-y-4">
        {actionPlans && actionPlans.length > 0 ? (
          actionPlans.map((plan) => (
            <div key={plan.id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-bold">Objetivo: {plan.objective}</h3>
              <p>Data de Início: {plan.start_date}</p>
              <p>Data de Término: {plan.end_date}</p>
              <h4 className="mt-2 font-bold">Tarefas:</h4>
              {plan.tasks && plan.tasks.length > 0 ? (
                plan.tasks.map((task) => (
                  <div key={task.id} className="border p-2 rounded mb-2">
                    <p><strong>Descrição:</strong> {task.description}</p>
                    <p><strong>Responsável:</strong> {task.responsible}</p>
                    <p><strong>Recursos:</strong> {task.resources}</p>
                    <p><strong>Prazo:</strong> {task.deadline}</p>
                    <p><strong>Riscos:</strong> {task.risks}</p>
                    <p><strong>KPIs:</strong> {task.kpis.join(', ')}</p>
                  </div>
                ))
              ) : (
                <p>Sem tarefas.</p>
              )}
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleDeleteActionPlan(plan.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Excluir Plano de Ação
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>Nenhum plano de ação encontrado.</p>
        )}
      </div>
    </div>
  );
}

export default ActionPlanManagement;
