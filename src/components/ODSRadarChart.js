import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const ODSRadarChart = ({ projectData }) => {
  const calculateODSAverages = (projects) => {
    // Inicializar objeto para somar valores
    const sums = {};
    const counts = {};

    // Somar todos os valores ODS
    projects.forEach(project => {
      for (let i = 1; i <= 17; i++) {
        const odsKey = `ods${i}`;
        if (project[odsKey] !== null && project[odsKey] !== undefined) {
          sums[odsKey] = (sums[odsKey] || 0) + project[odsKey];
          counts[odsKey] = (counts[odsKey] || 0) + 1;
        }
      }
    });

    // Calcular médias e formatar dados para o gráfico
    return Object.keys(sums).map(key => ({
      subject: `ODS ${key.replace('ods', '')}`,
      value: counts[key] ? (sums[key] / counts[key]) : 0,
      fullMark: 2
    }));
  };

  const odsData = calculateODSAverages(projectData);

  return (
    <ResponsiveContainer width="100%" height={500}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={odsData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 2]} />
        <Tooltip />
        <Radar
          name="ODS"
          dataKey="value"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default ODSRadarChart; 