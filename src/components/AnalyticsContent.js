// src/components/AnalyticsContent.jsx
import React, { useEffect, useState } from 'react';
import KPI from './KPI'; // Certifique-se que o caminho está correto
import kpisData from '../data/kpis'; // Certifique-se que o caminho para kpisData está correto
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'; // Certifique-se que o caminho está correto

function AnalyticsContent({ category, selectedYear }) {
  const [groupedKPIs, setGroupedKPIs] = useState({
    environment: [],
    social: [],
    governance: [],
  });

  // Dados adicionais de Meio Ambiente, Social e Governança
  const environmentData = {
    energyEfficiencyData: [
      { year: 2020, ieer: 0.75 },
      { year: 2021, ieer: 0.80 },
      { year: 2022, ieer: 0.85 },
      { year: 2023, ieer: 0.90 },
      { year: 2024, ieer: 0.95 },
    ],
    emissionsData: [
      { year: 2020, emissions: 850 },
      { year: 2021, emissions: 920 },
      { year: 2022, emissions: 1000 },
      { year: 2023, emissions: 950 },
    ],
    waterConsumptionData: [
      { year: 2019, consumption: 1000000, recycled: 200000 },
      { year: 2020, consumption: 950000, recycled: 250000 },
      { year: 2021, consumption: 900000, recycled: 300000 },
      { year: 2022, consumption: 850000, recycled: 350000 },
      { year: 2023, consumption: 800000, recycled: 400000 },
    ],
    wasteManagementData: [
      { year: 2019, total: 5000, recycled: 2000, landfill: 3000 },
      { year: 2020, total: 4800, recycled: 2200, landfill: 2600 },
      { year: 2021, total: 4600, recycled: 2400, landfill: 2200 },
      { year: 2022, total: 4400, recycled: 2600, landfill: 1800 },
      { year: 2023, total: 4200, recycled: 2800, landfill: 1400 },
    ],
    biodiversityImpactData: [
      { year: 2019, protectedArea: 1000, restoredArea: 50 },
      { year: 2020, protectedArea: 1050, restoredArea: 75 },
      { year: 2021, protectedArea: 1100, restoredArea: 100 },
      { year: 2022, protectedArea: 1150, restoredArea: 125 },
      { year: 2023, protectedArea: 1200, restoredArea: 150 },
    ],
    airQualityData: [
      { pollutant: 'NOx', value: 50 },
      { pollutant: 'SOx', value: 30 },
      { pollutant: 'PM10', value: 20 },
      { pollutant: 'VOCs', value: 15 },
      { pollutant: 'CO', value: 10 },
    ],
  };

  const socialData = {
    jobCreationData: [
      { year: 2019, fullTime: 500, partTime: 100, temporary: 50 },
      { year: 2020, fullTime: 520, partTime: 110, temporary: 60 },
      { year: 2021, fullTime: 550, partTime: 120, temporary: 70 },
      { year: 2022, fullTime: 600, partTime: 130, temporary: 80 },
      { year: 2023, fullTime: 650, partTime: 140, temporary: 90 },
    ],
    jobDiversityData: [
      { name: 'Mulheres', value: 45 },
      { name: 'Homens', value: 55 },
      { name: 'Pessoas com deficiência', value: 5 },
      { name: 'Minorias étnicas', value: 20 },
    ],
    employeeTurnoverData: [
      { year: 2019, rate: 12 },
      { year: 2020, rate: 10 },
      { year: 2021, rate: 8 },
      { year: 2022, rate: 7 },
      { year: 2023, rate: 6 },
    ],
  };

  const governanceData = {
    boardDiversityData: [
      { name: 'Mulheres', value: 30 },
      { name: 'Homens', value: 70 },
      { name: 'Minorias', value: 20 },
    ],
    complianceData: [
      { year: 2019, compliance: 80 },
      { year: 2020, compliance: 85 },
      { year: 2021, compliance: 90 },
      { year: 2022, compliance: 95 },
      { year: 2023, compliance: 98 },
    ],
    riskManagementData: [
      { year: 2019, incidents: 5 },
      { year: 2020, incidents: 4 },
      { year: 2021, incidents: 3 },
      { year: 2022, incidents: 2 },
      { year: 2023, incidents: 1 },
    ],
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    // Filtrar os KPIs pela categoria e ano selecionados
    const filteredKPIs = kpisData.filter(
      (kpi) => kpi.category === category && kpi.year === selectedYear
    );

    // Agrupar os KPIs por categoria
    const grouped = {
      environment: filteredKPIs.filter((kpi) => kpi.category === 'environment'),
      social: filteredKPIs.filter((kpi) => kpi.category === 'social'),
      governance: filteredKPIs.filter((kpi) => kpi.category === 'governance'),
    };

    setGroupedKPIs(grouped);
  }, [category, selectedYear]);

  // Converter a categoria para um nome legível
  const categoryName = {
    environment: 'Meio Ambiente',
    social: 'Social',
    governance: 'Governança',
  }[category] || 'Análise';

  // Função para renderizar KPIs em Cards e gráficos de uma categoria
  const renderCategorySection = (categoryKey, categoryDisplayName, additionalData) => {
    const categoryKPIs = groupedKPIs[categoryKey];
    console.log(`Rendering ${categoryDisplayName} KPIs:`, categoryKPIs); // Log para depuração

    return (
      <div key={categoryKey} className="space-y-6">
        <h2 className="text-2xl font-bold">Análise de {categoryDisplayName}</h2>

        {/* Renderizar os KPIs em Cards */}
        {categoryKPIs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryKPIs.map((kpi) => (
              <KPI key={kpi.id} kpi={kpi} />
            ))}
          </div>
        ) : (
          <p>Nenhum dado disponível para {categoryDisplayName} no ano selecionado.</p>
        )}

        {/* Gráficos adicionais específicos da categoria */}
        {categoryKey === 'environment' && (
          <div className="space-y-6">
            {/* Gráfico de Eficiência Energética (IEER) */}
            <div>
              <h3 className="text-xl font-bold">Eficiência Energética (IEER)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={additionalData.energyEfficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="ieer" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Emissões de GEE */}
            <div>
              <h3 className="text-xl font-bold">Emissões de GEE (tCO2e)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={additionalData.emissionsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis domain={[800, 1100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="emissions" stroke="#ff7300" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Consumo e Reciclagem de Água */}
            <div>
              <h3 className="text-xl font-bold">Consumo e Reciclagem de Água</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Consumo e Reciclagem de Água</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={additionalData.waterConsumptionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="consumption" name="Consumo Total (m³)" fill="#8884d8" />
                      <Bar dataKey="recycled" name="Água Reciclada (m³)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Gestão de Resíduos */}
            <div>
              <h3 className="text-xl font-bold">Gestão de Resíduos</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Resíduos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={additionalData.wasteManagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="recycled"
                        name="Resíduos Reciclados (ton)"
                        fill="#82ca9d"
                        stackId="a"
                      />
                      <Bar
                        dataKey="landfill"
                        name="Resíduos para Aterro (ton)"
                        fill="#8884d8"
                        stackId="a"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Impacto na Biodiversidade */}
            <div>
              <h3 className="text-xl font-bold">Impacto na Biodiversidade</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Impacto na Biodiversidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={additionalData.biodiversityImpactData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="protectedArea"
                        name="Área Protegida (ha)"
                        stroke="#8884d8"
                      />
                      <Line
                        type="monotone"
                        dataKey="restoredArea"
                        name="Área Restaurada (ha)"
                        stroke="#82ca9d"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Emissões Atmosféricas */}
            <div>
              <h3 className="text-xl font-bold">Emissões Atmosféricas (2023)</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Emissões Atmosféricas (2023)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={additionalData.airQualityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {additionalData.airQualityData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Gráficos adicionais de Social */}
        {category === 'social' && (
          <div className="space-y-6">
            {/* Gráfico de Criação de Empregos */}
            <div>
              <h3 className="text-xl font-bold">Criação de Empregos por Tipo</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Criação de Empregos por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={socialData.jobCreationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="fullTime" name="Tempo Integral" fill="#8884d8" />
                      <Bar dataKey="partTime" name="Meio Período" fill="#82ca9d" />
                      <Bar dataKey="temporary" name="Temporário" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Diversidade na Força de Trabalho */}
            <div>
              <h3 className="text-xl font-bold">Diversidade na Força de Trabalho</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Diversidade na Força de Trabalho</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={socialData.jobDiversityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {socialData.jobDiversityData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Taxa de Rotatividade */}
            <div>
              <h3 className="text-xl font-bold">Taxa de Rotatividade de Funcionários</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Rotatividade de Funcionários</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={socialData.employeeTurnoverData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        name="Taxa de Rotatividade (%)"
                        stroke="#8884d8"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{categoryName}</h1>
      {renderCategorySection(category, categoryName, 
        category === 'environment' ? environmentData : 
        category === 'social' ? socialData : 
        governanceData
      )}
    </div>
  );
}

export default AnalyticsContent;