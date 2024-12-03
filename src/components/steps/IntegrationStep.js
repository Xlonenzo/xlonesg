import React from 'react';

const IntegrationStep = ({ config, setConfig }) => {
  const handleChange = (field, value) => {
    setConfig({
      ...config,
      integration: {
        ...config.integration,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Configuração de Integração</h2>
      
      {/* Padrões de Integração */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Padrões de Integração
        </label>
        <div className="grid grid-cols-2 gap-4">
          {[
            'Publish/Subscribe',
            'Request/Response',
            'Streaming de Dados',
            'Event-Driven'
          ].map((pattern) => (
            <div key={pattern} className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  checked={(config.integration.patterns || []).includes(pattern)}
                  onChange={(e) => {
                    const patterns = config.integration.patterns || [];
                    if (e.target.checked) {
                      handleChange('patterns', [...patterns, pattern]);
                    } else {
                      handleChange('patterns', patterns.filter(p => p !== pattern));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">{pattern}</label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plataformas de Integração */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plataformas de Integração
        </label>
        <div className="grid grid-cols-2 gap-4">
          {[
            'AWS IoT',
            'Azure IoT Hub',
            'Google Cloud IoT',
            'IBM Watson IoT',
            'ThingsBoard',
            'Plataforma Personalizada'
          ].map((platform) => (
            <div key={platform} className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  checked={(config.integration.platforms || []).includes(platform)}
                  onChange={(e) => {
                    const platforms = config.integration.platforms || [];
                    if (e.target.checked) {
                      handleChange('platforms', [...platforms, platform]);
                    } else {
                      handleChange('platforms', platforms.filter(p => p !== platform));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">{platform}</label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configurações de API */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Configurações de API</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Endpoint Base
          </label>
          <input
            type="text"
            value={config.integration.baseEndpoint || ''}
            onChange={(e) => handleChange('baseEndpoint', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://api.exemplo.com/v1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Versão da API
          </label>
          <input
            type="text"
            value={config.integration.apiVersion || ''}
            onChange={(e) => handleChange('apiVersion', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="v1"
          />
        </div>
      </div>

      {/* Webhooks */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Webhooks</h3>
          <button
            type="button"
            onClick={() => {
              const webhooks = config.integration.webhooks || [];
              handleChange('webhooks', [...webhooks, { url: '', method: 'POST', events: [] }]);
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Adicionar Webhook
          </button>
        </div>

        {(config.integration.webhooks || []).map((webhook, index) => (
          <div key={index} className="p-4 border rounded-md space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-medium">Webhook #{index + 1}</h4>
              <button
                type="button"
                onClick={() => {
                  const webhooks = config.integration.webhooks.filter((_, i) => i !== index);
                  handleChange('webhooks', webhooks);
                }}
                className="text-red-600 hover:text-red-800"
              >
                Remover
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">URL</label>
              <input
                type="text"
                value={webhook.url}
                onChange={(e) => {
                  const webhooks = [...(config.integration.webhooks || [])];
                  webhooks[index] = { ...webhook, url: e.target.value };
                  handleChange('webhooks', webhooks);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://seu-servidor.com/webhook"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Método HTTP</label>
              <select
                value={webhook.method}
                onChange={(e) => {
                  const webhooks = [...(config.integration.webhooks || [])];
                  webhooks[index] = { ...webhook, method: e.target.value };
                  handleChange('webhooks', webhooks);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Eventos</label>
              <div className="space-y-2">
                {['Dados Recebidos', 'Alarme', 'Status Alterado', 'Erro'].map((event) => (
                  <div key={event} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(webhook.events || []).includes(event)}
                      onChange={(e) => {
                        const webhooks = [...(config.integration.webhooks || [])];
                        const events = webhook.events || [];
                        if (e.target.checked) {
                          webhooks[index] = { ...webhook, events: [...events, event] };
                        } else {
                          webhooks[index] = { 
                            ...webhook, 
                            events: events.filter(ev => ev !== event) 
                          };
                        }
                        handleChange('webhooks', webhooks);
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">{event}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationStep; 