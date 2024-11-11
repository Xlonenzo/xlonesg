import React from 'react';

const ProjectSelector = ({ projects, selectedProjects, onProjectSelect }) => {
  const calculateProjectScore = (project) => {
    const odsFields = Object.keys(project).filter(key => key.startsWith('ods'));
    const odsValues = odsFields.map(field => Number(project[field]) || 0);
    const totalODS = odsValues.filter(value => value > 0).length;
    
    if (totalODS === 0) return 0;
    
    const sumODS = odsValues.reduce((acc, curr) => acc + curr, 0);
    return ((sumODS / totalODS) / 2) * 100; // Convertendo para porcentagem
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-3">Projetos Disponíveis</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Selecionar</th>
              <th className="px-4 py-2 border">Nome</th>
              <th className="px-4 py-2 border">Tipo</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Score ODS</th>
              <th className="px-4 py-2 border">Progresso</th>
              <th className="px-4 py-2 border">Orçamento</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const score = calculateProjectScore(project);
              return (
                <tr key={project.id}>
                  <td className="px-4 py-2 border text-center">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.id)}
                      onChange={() => onProjectSelect(project.id)}
                      className="h-4 w-4 text-blue-600"
                    />
                  </td>
                  <td className="px-4 py-2 border">
                    <div>
                      <div>{project.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        <div className="flex flex-wrap gap-1">
                          {[...Array(17)].map((_, index) => {
                            const odsValue = project[`ods${index + 1}`];
                            if (odsValue > 0) {
                              return (
                                <span 
                                  key={index} 
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                  title={`ODS ${index + 1}: ${odsValue}`}
                                >
                                  {index + 1}
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 border">{project.project_type}</td>
                  <td className="px-4 py-2 border">{project.status}</td>
                  <td className="px-4 py-2 border">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm">{score.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 border">{project.progress_percentage}%</td>
                  <td className="px-4 py-2 border">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: project.currency
                    }).format(project.budget_allocated)}
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

export default ProjectSelector; 