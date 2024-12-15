import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

function ODSRadarChart({ projectData }) {
  if (!projectData || projectData.length === 0) {
    return <div>Carregando dados ODS...</div>;
  }

  // Calcular a média dos ODS de todos os projetos
  const odsAverages = projectData.reduce((acc, project) => {
    for (let i = 1; i <= 17; i++) {
      const odsKey = `ods${i}`;
      if (!acc[odsKey]) acc[odsKey] = 0;
      acc[odsKey] += parseFloat(project[odsKey] || 0);
    }
    return acc;
  }, {});

  // Calcular a média final dividindo pelo número de projetos
  Object.keys(odsAverages).forEach(key => {
    odsAverages[key] = odsAverages[key] / projectData.length;
  });

  // Transformar dados para o formato do gráfico radar
  const transformedData = Object.keys(odsAverages).map(key => ({
    subject: `ODS ${key.replace('ods', '')}`,
    value: parseFloat(odsAverages[key].toFixed(2))
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={transformedData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 2]} />
          <Radar
            name="ODS"
            dataKey="value"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ODSRadarChart; 