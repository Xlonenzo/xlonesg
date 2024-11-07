import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { API_URL } from '../config';

function ESGProjects({ sidebarColor, buttonColor }) {
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    company_id: '',
    project_type: '',
    start_date: '',
    end_date: '',
    budget_allocated: 0,
    currency: 'BRL',
    status: '',
    progress_percentage: 0,
    expected_impact: '',
    actual_impact: '',
    last_audit_date: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/companies`);
      setCompanies(response.data);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/project-tracking`);
      setProjects(response.data);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = {
        ...newProject,
        company_id: parseInt(newProject.company_id),
        budget_allocated: parseFloat(newProject.budget_allocated),
        progress_percentage: parseFloat(newProject.progress_percentage),
        last_audit_date: newProject.last_audit_date || null
      };

      if (editingProject) {
        await axios.put(`${API_URL}/project-tracking/${editingProject.id}`, formData);
      } else {
        await axios.post(`${API_URL}/project-tracking`, formData);
      }
      
      fetchProjects();
      setIsFormOpen(false);
      setNewProject({
        name: '',
        company_id: '',
        project_type: '',
        start_date: '',
        end_date: '',
        budget_allocated: 0,
        currency: 'BRL',
        status: '',
        progress_percentage: 0,
        expected_impact: '',
        actual_impact: '',
        last_audit_date: ''
      });
      setEditingProject(null);
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      alert('Erro ao salvar projeto. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Projeto
            </label>
            <input
              type="text"
              name="name"
              value={newProject.name}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa
            </label>
            <select
              name="company_id"
              value={newProject.company_id}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">Selecione a Empresa</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Projeto
            </label>
            <select
              name="project_type"
              value={newProject.project_type}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">Selecione o Tipo</option>
              <option value="Environmental">Ambiental</option>
              <option value="Social">Social</option>
              <option value="Governance">Governança</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={newProject.status}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">Selecione o Status</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Planejado">Planejado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Início
            </label>
            <input
              type="date"
              name="start_date"
              value={newProject.start_date}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Término
            </label>
            <input
              type="date"
              name="end_date"
              value={newProject.end_date}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orçamento
            </label>
            <input
              type="number"
              name="budget_allocated"
              value={newProject.budget_allocated}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Moeda
            </label>
            <select
              name="currency"
              value={newProject.currency}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            >
              <option value="BRL">Real (BRL)</option>
              <option value="USD">Dólar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progresso (%)
            </label>
            <input
              type="number"
              name="progress_percentage"
              value={newProject.progress_percentage}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data da Última Auditoria
            </label>
            <input
              type="date"
              name="last_audit_date"
              value={newProject.last_audit_date}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impacto Esperado
            </label>
            <textarea
              name="expected_impact"
              value={newProject.expected_impact}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              rows="3"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impacto Real
            </label>
            <textarea
              name="actual_impact"
              value={newProject.actual_impact}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              rows="3"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white rounded"
            style={{ backgroundColor: buttonColor }}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsFormOpen(false);
              setEditingProject(null);
              setNewProject({
                name: '',
                company_id: '',
                project_type: '',
                start_date: '',
                end_date: '',
                budget_allocated: 0,
                currency: 'BRL',
                status: '',
                progress_percentage: 0,
                expected_impact: '',
                actual_impact: '',
                last_audit_date: ''
              });
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      company_id: project.company_id,
      project_type: project.project_type,
      start_date: project.start_date,
      end_date: project.end_date,
      budget_allocated: project.budget_allocated,
      currency: project.currency,
      status: project.status,
      progress_percentage: project.progress_percentage,
      expected_impact: project.expected_impact || '',
      actual_impact: project.actual_impact || '',
      last_audit_date: project.last_audit_date || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto?')) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/project-tracking/${projectId}`);
      fetchProjects();
      alert('Projeto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      alert('Erro ao excluir projeto. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projetos ESG</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 text-white rounded flex items-center"
          style={{ backgroundColor: buttonColor }}
        >
          <FaPlus className="mr-2" /> Novo Projeto
        </button>
      </div>

      {isFormOpen && renderForm()}

      {/* Tabela de projetos */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Nome</th>
              <th className="px-4 py-2 border">Empresa</th>
              <th className="px-4 py-2 border">Tipo</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Progresso</th>
              <th className="px-4 py-2 border">Orçamento</th>
              <th className="px-4 py-2 border">Data Início</th>
              <th className="px-4 py-2 border">Data Fim</th>
              <th className="px-4 py-2 border">Impacto Esperado</th>
              <th className="px-4 py-2 border">Impacto Real</th>
              <th className="px-4 py-2 border">Última Auditoria</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="px-4 py-2 border">{project.name}</td>
                <td className="px-4 py-2 border">
                  {companies.find(c => c.id === project.company_id)?.name}
                </td>
                <td className="px-4 py-2 border">{project.project_type}</td>
                <td className="px-4 py-2 border">{project.status}</td>
                <td className="px-4 py-2 border">{project.progress_percentage}%</td>
                <td className="px-4 py-2 border">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: project.currency
                  }).format(project.budget_allocated)}
                </td>
                <td className="px-4 py-2 border">
                  {new Date(project.start_date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-2 border">
                  {new Date(project.end_date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-2 border">{project.expected_impact || '-'}</td>
                <td className="px-4 py-2 border">{project.actual_impact || '-'}</td>
                <td className="px-4 py-2 border">
                  {project.last_audit_date 
                    ? new Date(project.last_audit_date).toLocaleDateString('pt-BR')
                    : '-'
                  }
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
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

export default ESGProjects;