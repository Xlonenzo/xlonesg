import React, { useState } from 'react';

function KPIManagement({ kpis, setKpis }) {
  const [isAddingKPI, setIsAddingKPI] = useState(false);
  const [editingKPI, setEditingKPI] = useState(null);
  const [newKPI, setNewKPI] = useState({
    name: '',
    unit: '',
    category: 'environment',
    description: '',
    target_value: 0,
    actual_value: 0,
    frequency: '',
    collection_method: '',
    status: '',
    year: new Date().getFullYear(),
  });

  const handleAddKPI = () => {
    const nextId = kpis.length > 0 ? Math.max(...kpis.map(kpi => kpi.id)) + 1 : 1;
    setKpis(prevKPIs => [...prevKPIs, { ...newKPI, id: nextId }]);
    setIsAddingKPI(false);
    setNewKPI({
      name: '',
      unit: '',
      category: 'environment',
      description: '',
      target_value: 0,
      actual_value: 0,
      frequency: '',
      collection_method: '',
      status: '',
      year: new Date().getFullYear(),
    });
  };

  const handleUpdateKPI = () => {
    if (editingKPI) {
      setKpis(prevKPIs => prevKPIs.map(kpi => (kpi.id === editingKPI.id ? editingKPI : kpi)));
      setEditingKPI(null);
    }
  };

  const handleDeleteKPI = (id) => {
    if (window.confirm('Tem certeza de que deseja excluir este KPI?')) {
      setKpis(prevKPIs => prevKPIs.filter(kpi => kpi.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gerenciamento de KPIs</h2>
      <button
        onClick={() => setIsAddingKPI(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Adicionar Novo KPI
      </button>
      {isAddingKPI && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Adicionar Novo KPI</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nome do KPI"
              value={newKPI.name}
              onChange={(e) => setNewKPI({ ...newKPI, name: e.target.value })}
              className="w-full p-2 border rounded"
            />
            
            {/* Dropdown para Unidade de Medida */}
            <select
              value={newKPI.unit}
              onChange={(e) => setNewKPI({ ...newKPI, unit: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione a Unidade de Medida</option>
              <option value="kWh">kWh (quilowatt-hora)</option>
              <option value="tCO₂e">tCO₂e (toneladas de CO₂ equivalente)</option>
              <option value="m³">m³ (metros cúbicos)</option>
              <option value="kg">kg (quilogramas)</option>
              <option value="kWh/m²">kWh/m² (quilowatt-hora por metro quadrado)</option>
              <option value="tCO₂e/unidade">tCO₂e/unidade de produção</option>
              <option value="unidades/hora">unidades/hora</option>
              <option value="USD">USD (dólares americanos)</option>
              <option value="EUR">EUR (euros)</option>
              <option value="BRL">BRL (reais brasileiros)</option>
              <option value="horas/dia">horas/dia</option>
              <option value="%">%</option>
              <option value="km">km (quilômetros)</option>
              <option value="m">m (metros)</option>
              <option value="unidades/ano">unidades/ano</option>
              <option value="litros/dia">litros/dia</option>
              <option value="km/h">km/h (quilômetros por hora)</option>
              <option value="m/s">m/s (metros por segundo)</option>
              <option value="Pa">Pa (Pascal)</option>
              <option value="bar">bar</option>
              <option value="psi">psi (libras por polegada quadrada)</option>
              <option value="°C">°C (graus Celsius)</option>
              <option value="°F">°F (graus Fahrenheit)</option>
              <option value="m²">m² (metros quadrados)</option>
              <option value="ha">ha (hectares)</option>
              <option value="g">g (gramas)</option>
              <option value="t">t (toneladas)</option>
              <option value="Hz">Hz (Hertz)</option>
              <option value="ciclos/segundo">ciclos/segundo</option>
              <option value="%/ano">%/ano (porcentagem ao ano)</option>
              <option value="kg/m³">kg/m³ (quilogramas por metro cúbico)</option>
              <option value="s">s (segundos)</option>
              <option value="min">min (minutos)</option>
              <option value="h">h (horas)</option>
              <option value="dias">dias</option>
              <option value="GB">GB (gigabytes)</option>
              <option value="TB">TB (terabytes)</option>
              <option value="MB">MB (megabytes)</option>
              <option value="V">V (volts)</option>
              <option value="A">A (ampère)</option>
              <option value="W">W (watts)</option>
              <option value="MW">MW (megawatts)</option>
              <option value="bpm">bpm (batimentos por minuto)</option>
              <option value="kg/m²">kg/m² (quilogramas por metro quadrado)</option>
              <option value="N">N (newtons)</option>
              <option value="dB">dB (decibéis)</option>
              <option value="hab/km²">hab/km² (habitantes por quilômetro quadrado)</option>
              <option value="ton/ha">ton/ha (toneladas por hectare)</option>
              <option value="L/s">L/s (litros por segundo)</option>
              <option value="m³/h">m³/h (metros cúbicos por hora)</option>
              <option value="%/mês">%/mês</option>
              <option value="mortes/1000 habitantes">mortes/1000 habitantes</option>
              <option value="km/l">km/l (quilômetros por litro)</option>
              <option value="mpg">mpg (milhas por galão)</option>
            </select>

            <select
              value={newKPI.category}
              onChange={(e) => setNewKPI({ ...newKPI, category: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="environment">Meio Ambiente</option>
              <option value="governance">Governança</option>
              <option value="social">Social</option>
            </select>
            <input
              type="number"
              placeholder="Ano"
              value={newKPI.year}
              onChange={(e) => setNewKPI({ ...newKPI, year: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Descrição"
              value={newKPI.description}
              onChange={(e) => setNewKPI({ ...newKPI, description: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Valor Alvo"
              value={newKPI.target_value}
              onChange={(e) => setNewKPI({ ...newKPI, target_value: parseFloat(e.target.value) })}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Valor Atual"
              value={newKPI.actual_value}
              onChange={(e) => setNewKPI({ ...newKPI, actual_value: parseFloat(e.target.value) })}
              className="w-full p-2 border rounded"
            />

            {/* Dropdown para Frequência */}
            <select
              value={newKPI.frequency}
              onChange={(e) => setNewKPI({ ...newKPI, frequency: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione a Frequência</option>
              <option value="diário">Diário</option>
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
              <option value="anual">Anual</option>
            </select>

            {/* Dropdown para Método de Coleta */}
            <select
              value={newKPI.collection_method}
              onChange={(e) => setNewKPI({ ...newKPI, collection_method: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione o Método de Coleta</option>
              <option value="Monitoramento Direto de Consumo de Energia">Monitoramento Direto de Consumo de Energia</option>
              <option value="Inventário de Emissões de GEE (Protocolo GHG)">Inventário de Emissões de GEE (Protocolo GHG)</option>
              <option value="Sistemas de Gestão de Recursos Humanos (HRMS)">Sistemas de Gestão de Recursos Humanos (HRMS)</option>
              <option value="Relatórios de Saúde e Segurança no Trabalho">Relatórios de Saúde e Segurança no Trabalho</option>
              <option value="Pesquisas de Satisfação de Empregados">Pesquisas de Satisfação de Empregados</option>
              <option value="Auditorias e Verificações Ambientais">Auditorias e Verificações Ambientais</option>
              <option value="Análise de Ciclo de Vida (ACV)">Análise de Ciclo de Vida (ACV)</option>
              <option value="Relatórios de Cadeia de Suprimentos">Relatórios de Cadeia de Suprimentos</option>
              <option value="Sistemas de Gestão de Água e Resíduos">Sistemas de Gestão de Água e Resíduos</option>
              <option value="Relatórios Financeiros Integrados">Relatórios Financeiros Integrados</option>
            </select>

            {/* Dropdown para Status */}
            <select
              value={newKPI.status}
              onChange={(e) => setNewKPI({ ...newKPI, status: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione o Status</option>
              <option value="Monitoramento Contínuo">Monitoramento Contínuo</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Atrasado">Atrasado</option>
              <option value="Pendente">Pendente</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Em revisão">Em revisão</option>
              <option value="Aguardando Aprovação">Aguardando Aprovação</option>
              <option value="Suspenso">Suspenso</option>
              <option value="Não iniciado">Não iniciado</option>
              <option value="Em risco">Em risco</option>
            </select>
          </div>
          <div className="mt-4 space-x-2">
            <button
              onClick={handleAddKPI}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Salvar
            </button>
            <button
              onClick={() => setIsAddingKPI(false)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="bg-white p-4 rounded-lg shadow-md">
            {editingKPI && editingKPI.id === kpi.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editingKPI.name}
                  onChange={(e) => setEditingKPI({ ...editingKPI, name: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  value={editingKPI.unit}
                  onChange={(e) => setEditingKPI({ ...editingKPI, unit: e.target.value })}
                  className="w-full p-2 border rounded"
                />

                {/* Dropdown para Unidade de Medida na Edição */}
                <select
                  value={editingKPI.unit}
                  onChange={(e) => setEditingKPI({ ...editingKPI, unit: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Selecione a Unidade de Medida</option>
                  <option value="kWh">kWh (quilowatt-hora)</option>
                  <option value="tCO₂e">tCO₂e (toneladas de CO₂ equivalente)</option>
                  <option value="m³">m³ (metros cúbicos)</option>
                  <option value="kg">kg (quilogramas)</option>
                  <option value="kWh/m²">kWh/m² (quilowatt-hora por metro quadrado)</option>
                  <option value="tCO₂e/unidade">tCO₂e/unidade de produção</option>
                  <option value="unidades/hora">unidades/hora</option>
                  <option value="USD">USD (dólares americanos)</option>
                  <option value="EUR">EUR (euros)</option>
                  <option value="BRL">BRL (reais brasileiros)</option>
                  <option value="horas/dia">horas/dia</option>
                  <option value="%">%</option>
                  <option value="km">km (quilômetros)</option>
                  <option value="m">m (metros)</option>
                  <option value="unidades/ano">unidades/ano</option>
                  <option value="litros/dia">litros/dia</option>
                  <option value="km/h">km/h (quilômetros por hora)</option>
                  <option value="m/s">m/s (metros por segundo)</option>
                  <option value="Pa">Pa (Pascal)</option>
                  <option value="bar">bar</option>
                  <option value="psi">psi (libras por polegada quadrada)</option>
                  <option value="°C">°C (graus Celsius)</option>
                  <option value="°F">°F (graus Fahrenheit)</option>
                  <option value="m²">m² (metros quadrados)</option>
                  <option value="ha">ha (hectares)</option>
                  <option value="g">g (gramas)</option>
                  <option value="t">t (toneladas)</option>
                  <option value="Hz">Hz (Hertz)</option>
                  <option value="ciclos/segundo">ciclos/segundo</option>
                  <option value="%/ano">%/ano (porcentagem ao ano)</option>
                  <option value="kg/m³">kg/m³ (quilogramas por metro cúbico)</option>
                  <option value="s">s (segundos)</option>
                  <option value="min">min (minutos)</option>
                  <option value="h">h (horas)</option>
                  <option value="dias">dias</option>
                  <option value="GB">GB (gigabytes)</option>
                  <option value="TB">TB (terabytes)</option>
                  <option value="MB">MB (megabytes)</option>
                  <option value="V">V (volts)</option>
                  <option value="A">A (ampère)</option>
                  <option value="W">W (watts)</option>
                  <option value="MW">MW (megawatts)</option>
                  <option value="bpm">bpm (batimentos por minuto)</option>
                  <option value="kg/m²">kg/m² (quilogramas por metro quadrado)</option>
                  <option value="N">N (newtons)</option>
                  <option value="dB">dB (decibéis)</option>
                  <option value="hab/km²">hab/km² (habitantes por quilômetro quadrado)</option>
                  <option value="ton/ha">ton/ha (toneladas por hectare)</option>
                  <option value="L/s">L/s (litros por segundo)</option>
                  <option value="m³/h">m³/h (metros cúbicos por hora)</option>
                  <option value="%/mês">%/mês</option>
                  <option value="mortes/1000 habitantes">mortes/1000 habitantes</option>
                  <option value="km/l">km/l (quilômetros por litro)</option>
                  <option value="mpg">mpg (milhas por galão)</option>
                </select>

                <select
                  value={editingKPI.category}
                  onChange={(e) => setEditingKPI({ ...editingKPI, category: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="environment">Meio Ambiente</option>
                  <option value="governance">Governança</option>
                  <option value="social">Social</option>
                </select>
                <textarea
                  value={editingKPI.description}
                  onChange={(e) => setEditingKPI({ ...editingKPI, description: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="number"
                  value={editingKPI.target_value}
                  onChange={(e) => setEditingKPI({ ...editingKPI, target_value: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="number"
                  value={editingKPI.actual_value}
                  onChange={(e) => setEditingKPI({ ...editingKPI, actual_value: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded"
                />

                {/* Dropdown para Frequência */}
                <select
                  value={editingKPI.frequency}
                  onChange={(e) => setEditingKPI({ ...editingKPI, frequency: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Selecione a Frequência</option>
                  <option value="diário">Diário</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                  <option value="anual">Anual</option>
                </select>

                {/* Dropdown para Método de Coleta */}
                <select
                  value={editingKPI.collection_method}
                  onChange={(e) => setEditingKPI({ ...editingKPI, collection_method: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Selecione o Método de Coleta</option>
                  <option value="Monitoramento Direto de Consumo de Energia">Monitoramento Direto de Consumo de Energia</option>
                  <option value="Inventário de Emissões de GEE (Protocolo GHG)">Inventário de Emissões de GEE (Protocolo GHG)</option>
                  <option value="Sistemas de Gestão de Recursos Humanos (HRMS)">Sistemas de Gestão de Recursos Humanos (HRMS)</option>
                  <option value="Relatórios de Saúde e Segurança no Trabalho">Relatórios de Saúde e Segurança no Trabalho</option>
                  <option value="Pesquisas de Satisfação de Empregados">Pesquisas de Satisfação de Empregados</option>
                  <option value="Auditorias e Verificações Ambientais">Auditorias e Verificações Ambientais</option>
                  <option value="Análise de Ciclo de Vida (ACV)">Análise de Ciclo de Vida (ACV)</option>
                  <option value="Relatórios de Cadeia de Suprimentos">Relatórios de Cadeia de Suprimentos</option>
                  <option value="Sistemas de Gestão de Água e Resíduos">Sistemas de Gestão de Água e Resíduos</option>
                  <option value="Relatórios Financeiros Integrados">Relatórios Financeiros Integrados</option>
                </select>

                {/* Dropdown para Status */}
                <select
                  value={editingKPI.status}
                  onChange={(e) => setEditingKPI({ ...editingKPI, status: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Selecione o Status</option>
                  <option value="Monitoramento Contínuo">Monitoramento Contínuo</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Atrasado">Atrasado</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Cancelado">Cancelado</option>
                  <option value="Em revisão">Em revisão</option>
                  <option value="Aguardando Aprovação">Aguardando Aprovação</option>
                  <option value="Suspenso">Suspenso</option>
                  <option value="Não iniciado">Não iniciado</option>
                  <option value="Em risco">Em risco</option>
                </select>
                <div className="space-x-2">
                  <button
                    onClick={handleUpdateKPI}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditingKPI(null)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold">{kpi.name}</h3>
                <p>Categoria: {kpi.category}</p>
                <p>
                  Valor Alvo: {kpi.target_value} {kpi.unit}
                </p>
                <p>
                  Valor Atual: {kpi.actual_value} {kpi.unit}
                </p>
                <p>Ano: {kpi.year}</p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => setEditingKPI(kpi)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteKPI(kpi.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default KPIManagement;