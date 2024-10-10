import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TaskManagement({ actionPlanId, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ description: '', status: 'Pendente' });

  useEffect(() => {
    fetchTasks();
  }, [actionPlanId]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/action-plans/${actionPlanId}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    }
  };

  const handleAddTask = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/api/action-plans/${actionPlanId}/tasks`, newTask);
      setTasks([...tasks, response.data]);
      setNewTask({ description: '', status: 'Pendente' });
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Gerenciar Tarefas</h3>
        <div className="mt-2 px-7 py-3">
          <input
            type="text"
            value={newTask.description}
            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            placeholder="Descrição da tarefa"
            className="w-full p-2 border rounded"
          />
          <select
            value={newTask.status}
            onChange={(e) => setNewTask({...newTask, status: e.target.value})}
            className="w-full mt-2 p-2 border rounded"
          >
            <option value="Pendente">Pendente</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluída">Concluída</option>
          </select>
          <button
            onClick={handleAddTask}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Adicionar Tarefa
          </button>
        </div>
        <div className="mt-4">
          {tasks.map((task) => (
            <div key={task.id} className="mb-2">
              <span>{task.description} - {task.status}</span>
            </div>
          ))}
        </div>
        <div className="items-center px-4 py-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskManagement;