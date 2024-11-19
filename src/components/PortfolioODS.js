import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { FaFilter, FaTimes } from 'react-icons/fa';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";

function PortfolioODS({ sidebarColor, buttonColor }) {
  const [projects, setProjects] = useState([]);
  const [selectedODS, setSelectedODS] = useState(null);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [totals, setTotals] = useState({
    totalValue: 0,
    totalGuaranteeValue: 0,
    totalODSValue: 0
  });

  // Array com todos os ODS + ícone de limpar
  const odsArray = [...Array.from({ length: 17 }, (_, i) => i + 1), 'clear'];

  // Configuração do mapa
  const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";
  
  // Dados de demonstração para o mapa
  const demoLocations = [
    {
      id: 1,
      name: "Projeto São Paulo Capital",
      latitude: -23.5505,
      longitude: -46.6333,
      budget_allocated: 200000000
    },
    {
      id: 2,
      name: "Projeto Campinas",
      latitude: -22.9099,
      longitude: -47.0626,
      budget_allocated: 100000000
    }
  ];

  // Escala para o tamanho dos pontos baseado no valor do projeto
  const maxValue = Math.max(...demoLocations.map(p => Number(p.budget_allocated) || 0));
  const sizeScale = scaleLinear()
    .domain([0, maxValue])
    .range([5, 30]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/project-tracking`, {
        withCredentials: true
      });
      const projectsData = response.data;
      console.log('Dados recebidos da API:', projectsData);
      
      setProjects(projectsData);
      setFilteredProjects(projectsData);
      calculateTotals(projectsData, null);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    }
  };

  const calculateTotals = (projectsData, odsNumber = null) => {
    console.log('Calculando totais para:', projectsData.length, 'projetos');
    console.log('ODS selecionado:', odsNumber);

    // Inicializa os totais
    let totalValue = 0;
    let totalGuaranteeValue = 0;
    let totalODSValue = 0;

    // Itera sobre cada projeto
    projectsData.forEach(project => {
      console.log('Projeto:', project.name);
      console.log('Orçamento original:', project.budget_allocated);

      // Converte os valores para número, usando 0 se for inválido
      const value = Number(project.budget_allocated) || 0;
      // Garantia sempre será zero até termos o campo correto
      const guaranteeValue = 0;
      
      console.log('Valor convertido:', value);
      console.log('Garantia:', guaranteeValue);

      // Soma aos totais
      totalValue += value;
      totalGuaranteeValue += guaranteeValue;

      // Se tiver ODS selecionado, soma o valor específico do ODS
      if (odsNumber) {
        const odsKey = `ods${odsNumber}`;
        console.log('Valor ODS original:', project[odsKey]);
        const odsValue = Number(project[odsKey]) || 0;
        console.log('Valor ODS convertido:', odsValue);
        totalODSValue += odsValue;
      }
    });

    setTotals({
      totalValue,
      totalGuaranteeValue,
      totalODSValue
    });
  };

  const filterProjectsByODS = (odsNumber) => {
    console.log('Filtrando por ODS:', odsNumber);
    
    if (odsNumber === 'clear' || selectedODS === odsNumber) {
      console.log('Limpando filtro');
      setSelectedODS(null);
      setFilteredProjects(projects);
      calculateTotals(projects, null);
    } else {
      console.log('Aplicando filtro para ODS:', odsNumber);
      setSelectedODS(odsNumber);
      const filtered = projects.filter(project => {
        const odsValue = Number(project[`ods${odsNumber}`]) || 0;
        console.log('Projeto:', project.name, 'Valor ODS:', odsValue);
        return odsValue > 0;
      });
      console.log('Projetos filtrados:', filtered.length);
      setFilteredProjects(filtered);
      calculateTotals(filtered, odsNumber);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {selectedODS ? `Portfólio ODS ${selectedODS}` : 'Portfólio ODS'}
        </h2>
      </div>

      {/* Cards de Totais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">
            Valor Total dos Projetos
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(totals.totalValue)}
          </p>
          {selectedODS && (
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium">Valor Total ODS {selectedODS}:</span> {formatCurrency(totals.totalODSValue)}
            </p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">
            Valor Total das Garantias
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(totals.totalGuaranteeValue)}
          </p>
        </div>
      </div>

      {/* Grid de ODS */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
        {odsArray.map((ods) => (
          <button
            key={ods}
            onClick={() => filterProjectsByODS(ods)}
            className={`relative group ${
              selectedODS === ods ? 'ring-4 ring-blue-500' : ''
            }`}
          >
            {ods === 'clear' ? (
              <div className="w-full aspect-square rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <FaTimes className="text-gray-600 text-2xl" />
              </div>
            ) : (
              <>
                <img
                  src={`/SDG-${ods}.svg`}
                  alt={`ODS ${ods}`}
                  className="w-full h-auto rounded-lg transition-transform transform hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all" />
              </>
            )}
          </button>
        ))}
      </div>

      {/* Lista de Projetos */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2 truncate">{project.name}</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Orçamento:</span> {formatCurrency(project.budget_allocated)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status:</span> {project.status}
              </p>
              {selectedODS && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Valor ODS {selectedODS}:</span> {formatCurrency(project[`ods${selectedODS}`])}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mapa Mundial */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Distribuição Global dos Projetos</h3>
        <div style={{ width: "100%", height: "400px" }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 400, // Aumentei o zoom
              center: [-47, -23] // Centralizando em SP
            }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#EAEAEC"
                    stroke="#D6D6DA"
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {demoLocations.map((location) => (
              <Marker
                key={location.id}
                coordinates={[location.longitude, location.latitude]}
              >
                <circle
                  r={sizeScale(location.budget_allocated)}
                  fill="#FF6B6B"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  opacity={0.8}
                  style={{
                    cursor: "pointer",
                  }}
                />
                <title>{`${location.name}: ${formatCurrency(location.budget_allocated)}`}</title>
              </Marker>
            ))}
          </ComposableMap>
        </div>
        <div className="mt-4 flex items-center justify-end space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#FF6B6B] mr-2"></div>
            <span className="text-sm text-gray-600">R$ 100M</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-[#FF6B6B] mr-2"></div>
            <span className="text-sm text-gray-600">R$ 200M</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioODS; 