import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { FaPlus, FaEdit, FaTrash, FaFilter, FaChevronUp, FaChevronDown } from 'react-icons/fa';

const formatCurrency = (value, currency = 'BRL') => {
  if (!value) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(value);
};

const CustomSelect = ({ options, value, onChange, placeholder, isBond = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionSelect = (option) => {
    console.log('Selecionando opção:', {
      id: option.id,
      name: option.name
    });
    
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div 
        className="w-full p-2 border rounded bg-white cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value ? value.name : placeholder}
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-auto">
          <div className="sticky top-0 bg-gray-100 p-2 grid grid-cols-3 gap-4 border-b font-semibold">
            <div className="w-[300px]">Nome</div>
            <div className="w-[150px]">{isBond ? 'Tipo' : 'Tipo Projeto'}</div>
            <div className="w-[150px] text-right">
              {isBond ? 'Valor Total' : 'Orçamento'}
            </div>
          </div>
          {options.map((option) => (
            <div
              key={option.id}
              className="grid grid-cols-3 gap-4 p-2 hover:bg-gray-50 cursor-pointer border-b"
              onClick={() => handleOptionSelect(option)}
            >
              <div className="w-[300px] truncate">{option.name}</div>
              <div className="w-[150px] truncate">
                {isBond ? option.bond_type : option.project_type}
              </div>
              <div className="w-[150px] text-right">
                {formatCurrency(
                  isBond ? option.total_amount : option.budget_allocated,
                  option.currency
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BondProjectRelation = ({ sidebarColor, buttonColor }) => {
  const [bonds, setBonds] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedBond, setSelectedBond] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [bondProjectRelations, setBondProjectRelations] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filters, setFilters] = useState({
    title: '',
    project: '',
    type: '',
    status: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('=== INICIANDO BUSCA DE DADOS ===');
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true
      };

      // Log antes da chamada
      console.log('Fazendo chamada para /api/project-tracking...');

      const [bondsResponse, projectsResponse, relationsResponse] = await Promise.all([
        axios.get(`${API_URL}/bonds`, config),
        axios.get(`${API_URL}/project-tracking`, config),
        axios.get(`${API_URL}/bond-project-relations`, config)
      ]);

      // Log após receber os dados
      console.log('=== DADOS RECEBIDOS DA API ===');
      console.log('Exemplo do primeiro projeto:', {
        id: projectsResponse.data[0]?.id,
        name: projectsResponse.data[0]?.name,
        ods: Array.from({ length: 17 }, (_, i) => ({
          [`ods${i + 1}`]: projectsResponse.data[0]?.[`ods${i + 1}`] ?? 0
        })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
      });

      // Mapear projetos com verificação de ODS
      const projectsWithOds = projectsResponse.data.map(project => {
        console.log(`Projeto ${project.id} - ${project.name}:`, {
          ods_originais: Array.from({ length: 17 }, (_, i) => ({
            [`ods${i + 1}`]: project[`ods${i + 1}`] ?? 0
          })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
        });

        return {
          ...project,
          ...Array.from({ length: 17 }, (_, i) => ({
            [`ods${i + 1}`]: project[`ods${i + 1}`] ?? 0
          })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
        };
      });

      // Log após o mapeamento
      console.log('=== DADOS APÓS MAPEAMENTO ===');
      console.log('Exemplo do primeiro projeto mapeado:', {
        id: projectsWithOds[0]?.id,
        name: projectsWithOds[0]?.name,
        ods: Array.from({ length: 17 }, (_, i) => ({
          [`ods${i + 1}`]: projectsWithOds[0]?.[`ods${i + 1}`] ?? 0
        })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
      });

      setBonds(bondsResponse.data);
      setProjects(projectsWithOds);
      setBondProjectRelations(relationsResponse.data);
    } catch (err) {
      console.error('=== ERRO NA BUSCA DE DADOS ===');
      console.error('Detalhes do erro:', err);
    }
  };

  const handleCreateRelation = async () => {
    if (!selectedBond || !selectedProject) {
        console.error('Por favor, selecione um título e um projeto.');
        return;
    }

    try {
        console.log('Enviando dados para o backend:', {
            bond_id: selectedBond.id,
            project_id: selectedProject.id
        });

        const formData = new FormData();
        formData.append('bond_id', selectedBond.id);
        formData.append('project_id', selectedProject.id);

        const response = await axios.post(`${API_URL}/bonds/relationships`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true
        });

        console.log('Resposta do backend:', response.data);
        fetchData();
        setIsFormOpen(false);
        
        // Limpar seleções após sucesso
        setSelectedBond(null);
        setSelectedProject(null);
    } catch (err) {
        console.error('Erro ao criar relacionamento:', err);
        console.error('Detalhes do erro:', err.response?.data);
    }
};

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Lógica de paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = bondProjectRelations.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium text-gray-800">Relações Título-Projeto</h2>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)} 
          className="text-white px-4 py-2 rounded hover:opacity-80 transition-all flex items-center gap-2 text-sm"
          style={{ backgroundColor: buttonColor }}
        >
          <FaPlus size={16} />
          {isFormOpen ? 'Fechar Formulário' : 'Nova Relação'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm mb-4 border border-gray-100">
        <button
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          style={{ color: buttonColor }}
        >
          <div className="flex items-center gap-2">
            <FaFilter size={16} style={{ color: buttonColor }} />
            <span className="font-medium text-sm" style={{ color: buttonColor }}>Filtros</span>
          </div>
          {isFilterExpanded ? 
            <FaChevronUp size={16} style={{ color: buttonColor }} /> : 
            <FaChevronDown size={16} style={{ color: buttonColor }} />
          }
        </button>
        
        {isFilterExpanded && (
          <div className="p-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Título</label>
                <input
                  type="text"
                  name="title"
                  value={filters.title}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                  placeholder="Filtrar por título..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Projeto</label>
                <input
                  type="text"
                  name="project"
                  value={filters.project}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                  placeholder="Filtrar por projeto..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow text-sm"
                >
                  <option value="">Todos os status</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Atrasado">Atrasado</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setFilters({
                  title: '',
                  project: '',
                  type: '',
                  status: ''
                })}
                className="px-4 py-2 text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {isFormOpen && (
        <form className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-bold mb-2">Nova Relação</h3>
          <div className="mb-4">
            <label className="block mb-2">Título:</label>
            <CustomSelect
              options={bonds}
              value={selectedBond}
              onChange={setSelectedBond}
              placeholder="Selecione um título"
              isBond={true}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Projeto:</label>
            <CustomSelect
              options={projects}
              value={selectedProject}
              onChange={setSelectedProject}
              placeholder="Selecione um projeto"
              isBond={false}
            />
          </div>
          <div className="flex space-x-2">
            <button 
                type="button" 
                onClick={handleCreateRelation} 
                className="text-white px-4 py-2 rounded hover:opacity-80"
                style={{ backgroundColor: buttonColor }}
            >
                Criar Relação
            </button>
            <button 
                type="button" 
                onClick={() => setIsFormOpen(false)} 
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
                Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-collapse table-fixed">
          <thead>
            <tr>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-1/5"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Título
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-1/4"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Projeto
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-1/5"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Tipo
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-right text-sm font-medium text-gray-600 whitespace-nowrap w-1/5"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Orçamento
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-center text-sm font-medium text-gray-600 whitespace-nowrap w-1/8"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Status
              </th>
              <th 
                className="px-4 py-3 border-b border-gray-100 text-center text-sm font-medium text-gray-600 whitespace-nowrap w-1/12"
                style={{ backgroundColor: `${buttonColor}15` }}
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(relation => {
              const project = projects.find(p => p.id === relation.project_id);
              const bond = bonds.find(b => b.id === relation.bond_id);
              
              return (
                <tr key={relation.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900 truncate">{bond?.name || '-'}</div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900 truncate">{project?.name || '-'}</div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    <div className="text-sm text-gray-900 truncate">{project?.project_type || '-'}</div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600 text-right">
                    <div className="text-sm text-gray-900">
                      {project?.budget_allocated ? 
                        formatCurrency(project.budget_allocated, project.currency) : 
                        '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                      project?.status === 'Em andamento' ? 'bg-blue-100 text-blue-800' :
                      project?.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                      project?.status === 'Atrasado' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project?.status || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button className="text-blue-500 hover:text-blue-700">
                        <FaEdit />
                      </button>
                      <button className="text-red-500 hover:text-red-700">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Anterior
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(bondProjectRelations.length / itemsPerPage)}
            className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === Math.ceil(bondProjectRelations.length / itemsPerPage)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Próximo
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> até{' '}
              <span className="font-medium">
                {Math.min(indexOfLastItem, bondProjectRelations.length)}
              </span>{' '}
              de <span className="font-medium">{bondProjectRelations.length}</span> resultados
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  currentPage === 1 ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <span className="sr-only">Anterior</span>
                <FaChevronUp className="h-5 w-5 rotate-90" />
              </button>
              {Array.from(
                { length: Math.ceil(bondProjectRelations.length / itemsPerPage) },
                (_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === i + 1
                        ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              )}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(bondProjectRelations.length / itemsPerPage)}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  currentPage === Math.ceil(bondProjectRelations.length / itemsPerPage)
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                <span className="sr-only">Próximo</span>
                <FaChevronDown className="h-5 w-5 rotate-90" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BondProjectRelation;