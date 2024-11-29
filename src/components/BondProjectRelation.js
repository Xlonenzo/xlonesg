import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Relações Título-Projeto</h2>

      <div className="flex flex-row-reverse mb-4">
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)} 
          className="text-white px-4 py-2 rounded hover:opacity-80 transition-all flex items-center"
          style={{ backgroundColor: buttonColor }}
        >
          <FaPlus className="mr-2" /> {isFormOpen ? 'Fechar Formulário' : 'Nova Relação'}
        </button>
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
            <button type="button" onClick={handleCreateRelation} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Criar Relação
            </button>
            <button type="button" onClick={() => setIsFormOpen(false)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <h3 className="text-lg font-bold mb-2">Relações Existentes</h3>
        <table className="min-w-full bg-white border border-collapse table-fixed">
          <thead>
            <tr className="bg-gray-100">
              <th className="w-1/5 px-4 py-2 border text-left">Título</th>
              <th className="w-1/4 px-4 py-2 border text-left">Projeto</th>
              <th className="w-1/5 px-4 py-2 border text-left">Tipo</th>
              <th className="w-1/5 px-4 py-2 border text-right">Orçamento</th>
              <th className="w-1/8 px-4 py-2 border text-center">Status</th>
              <th className="w-1/12 px-4 py-2 border text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {bondProjectRelations.map(relation => {
              const project = projects.find(p => p.id === relation.project_id);
              const bond = bonds.find(b => b.id === relation.bond_id);
              
              return (
                <tr key={relation.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border text-left truncate">
                    <div className="truncate">{bond?.name || '-'}</div>
                  </td>
                  <td className="px-4 py-2 border text-left truncate">
                    <div className="truncate">{project?.name || '-'}</div>
                  </td>
                  <td className="px-4 py-2 border text-left truncate">
                    <div className="truncate">{project?.project_type || '-'}</div>
                  </td>
                  <td className="px-4 py-2 border text-right whitespace-nowrap">
                    {project?.budget_allocated ? 
                      formatCurrency(project.budget_allocated, project.currency) : 
                      '-'}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                      project?.status === 'Em andamento' ? 'bg-blue-100 text-blue-800' :
                      project?.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                      project?.status === 'Atrasado' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project?.status || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <div className="flex justify-center space-x-2">
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
    </div>
  );
};

export default BondProjectRelation;