import React from 'react';

const ManagementStep = ({ config, setConfig }) => {
  const handleChange = (field, value) => {
    setConfig({
      ...config,
      management: {
        ...config.management,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Configuração de Gerenciamento</h2>
      
      {/* Provisionamento de Dispositivos */}
      <div>
        <h3 className="text-lg font-medium mb-4">Provisionamento de Dispositivos</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Método de Provisionamento
            </label>
            <div className="mt-2 space-y-2">
              <div className="relative flex items-center">
                <input
                  type="radio"
                  name="provisioningMethod"
                  value="manual"
                  checked={config.management.provisioningMethod === 'manual'}
                  onChange={(e) => handleChange('provisioningMethod', e.target.value)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-3 block text-sm font-medium text-gray-700">
                  Manual
                </label>
              </div>
              <div className="relative flex items-center">
                <input
                  type="radio"
                  name="provisioningMethod"
                  value="automatic"
                  checked={config.management.provisioningMethod === 'automatic'}
                  onChange={(e) => handleChange('provisioningMethod', e.target.value)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-3 block text-sm font-medium text-gray-700">
                  Automático
                </label>
              </div>
            </div>
          </div>

          {config.management.provisioningMethod === 'automatic' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Template de Provisionamento
              </label>
              <textarea
                value={config.management.provisioningTemplate || ''}
                onChange={(e) => handleChange('provisioningTemplate', e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Template JSON para provisionamento automático"
              />
            </div>
          )}
        </div>
      </div>

      {/* Monitoramento */}
      <div>
        <h3 className="text-lg font-medium mb-4">Monitoramento</h3>
        
        {/* Status do Dispositivo */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Métricas de Monitoramento
            </label>
            <div className="space-y-2">
              {[
                'Status do Dispositivo',
                'Uso de CPU',
                'Uso de Memória',
                'Latência',
                'Taxa de Transferência',
                'Erros',
                'Bateria'
              ].map((metric) => (
                <div key={metric} className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      type="checkbox"
                      checked={(config.management.monitoringMetrics || []).includes(metric)}
                      onChange={(e) => {
                        const metrics = config.management.monitoringMetrics || [];
                        if (e.target.checked) {
                          handleChange('monitoringMetrics', [...metrics, metric]);
                        } else {
                          handleChange('monitoringMetrics', metrics.filter(m => m !== metric));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label className="font-medium text-gray-700">{metric}</label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Intervalo de Coleta (segundos)
            </label>
            <input
              type="number"
              value={config.management.monitoringInterval || ''}
              onChange={(e) => handleChange('monitoringInterval', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Atualizações de Firmware */}
      <div>
        <h3 className="text-lg font-medium mb-4">Atualizações de Firmware</h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={config.management.otaEnabled || false}
              onChange={(e) => handleChange('otaEnabled', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 block text-sm font-medium text-gray-700">
              Habilitar Atualizações OTA (Over-The-Air)
            </label>
          </div>

          {config.management.otaEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Política de Atualização
                </label>
                <select
                  value={config.management.updatePolicy || ''}
                  onChange={(e) => handleChange('updatePolicy', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Selecione uma política</option>
                  <option value="automatic">Automática</option>
                  <option value="scheduled">Agendada</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Versão Mínima Requerida
                </label>
                <input
                  type="text"
                  value={config.management.minFirmwareVersion || ''}
                  onChange={(e) => handleChange('minFirmwareVersion', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="1.0.0"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Diagnóstico e Logs */}
      <div>
        <h3 className="text-lg font-medium mb-4">Diagnóstico e Logs</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nível de Log
            </label>
            <select
              value={config.management.logLevel || ''}
              onChange={(e) => handleChange('logLevel', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione um nível</option>
              <option value="ERROR">ERROR</option>
              <option value="WARN">WARN</option>
              <option value="INFO">INFO</option>
              <option value="DEBUG">DEBUG</option>
              <option value="TRACE">TRACE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Retenção de Logs (dias)
            </label>
            <input
              type="number"
              value={config.management.logRetention || ''}
              onChange={(e) => handleChange('logRetention', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={config.management.remoteDebugEnabled || false}
              onChange={(e) => handleChange('remoteDebugEnabled', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 block text-sm font-medium text-gray-700">
              Habilitar Depuração Remota
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementStep; 