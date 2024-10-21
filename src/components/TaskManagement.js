import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';

function TaskManagement({ actionPlanId, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ 
    description: '', 
    status: 'Pendente',
    impact: 'Moderado',
    probability: 'Moderado'
  });
  const [editingTask, setEditingTask] = useState(null);

  const impactOptions = ['Muito baixo', 'Baixo', 'Moderado', 'Alto', 'Muito Alto'];
  const probabilityOptions = ['Muito baixo', 'Baixo', 'Moderado', 'Alto', 'Muito Alto'];

  const fetchTasks = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/action-plans/${actionPlanId}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    }
  }, [actionPlanId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/api/action-plans/${actionPlanId}/tasks`, newTask);
      setTasks([...tasks, response.data]);
      setNewTask({ description: '', status: 'Pendente', impact: 'Moderado', probability: 'Moderado' });
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
    }
  };

  const handleUpdateTask = async () => {
    try {
      const response = await axios.put(`http://localhost:8000/api/tasks/${editingTask.id}`, editingTask);
      setTasks(tasks.map(task => task.id === editingTask.id ? response.data : task));
      setEditingTask(null);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await axios.delete(`http://localhost:8000/api/tasks/${id}`);
        setTasks(tasks.filter((task) => task.id !== id));
      } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Gerenciar Tarefas</h3>
        <div className="mt-2 px-7 py-3">
          <input
            type="text"
            value={editingTask ? editingTask.description : newTask.description}
            onChange={(e) => editingTask 
              ? setEditingTask({...editingTask, description: e.target.value})
              : setNewTask({...newTask, description: e.target.value})
            }
            placeholder="Descrição da tarefa"
            className="w-full p-2 border rounded mb-2"
          />
          <select
            value={editingTask ? editingTask.status : newTask.status}
            onChange={(e) => editingTask
              ? setEditingTask({...editingTask, status: e.target.value})
              : setNewTask({...newTask, status: e.target.value})
            }
            className="w-full p-2 border rounded mb-2"
          >
            <option value="Pendente">Pendente</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluída">Concluída</option>
          </select>
          <select
            value={editingTask ? editingTask.impact : newTask.impact}
            onChange={(e) => editingTask
              ? setEditingTask({...editingTask, impact: e.target.value})
              : setNewTask({...newTask, impact: e.target.value})
            }
            className="w-full p-2 border rounded mb-2"
          >
            {impactOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select
            value={editingTask ? editingTask.probability : newTask.probability}
            onChange={(e) => editingTask
              ? setEditingTask({...editingTask, probability: e.target.value})
              : setNewTask({...newTask, probability: e.target.value})
            }
            className="w-full p-2 border rounded mb-2"
          >
            {probabilityOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button
            onClick={editingTask ? handleUpdateTask : handleAddTask}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editingTask ? 'Atualizar Tarefa' : 'Adicionar Tarefa'}
          </button>
          {editingTask && (
            <button
              onClick={() => setEditingTask(null)}
              className="mt-2 ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          )}
        </div>
        <div className="mt-4">
          {tasks.map((task) => (
            <div key={task.id} className="mb-2 flex justify-between items-center">
              <span>{task.description} - {task.status} - Impacto: {task.impact} - Probabilidade: {task.probability}</span>
              <div>
                <button
                  onClick={() => setEditingTask(task)}
                  className="text-yellow-500 hover:text-yellow-700 mr-2"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
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
