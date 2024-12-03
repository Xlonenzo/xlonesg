import React from 'react';

const DataStep = ({ config, setConfig }) => {
  const handleChange = (field, value) => {
    setConfig({
      ...config,
      data: {
        ...config.data,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Configuração de Dados</h2>
      
      {/* Formato de Dados */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Formato de Dados
        </label>
        <select
          value={config.data.format || ''}
          onChange={(e) => handleChange('format', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Selecione um formato</option>
          <option value="JSON">JSON</option>
          <option value="XML">XML</option>
          <option value="CBOR">CBOR</option>
          <option value="Protobuf">Protocol Buffers</option>
        </select>
      </div>

      {/* Tipo de Dados */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Dados
        </label>
        <div className="space-y-2">
          {['Tempo Real', 'Histórico', 'Eventos'].map((type) => (
            <div key={type} className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  checked={(config.data.types || []).includes(type)}
                  onChange={(e) => {
                    const types = config.data.types || [];
                    if (e.target.checked) {
                      handleChange('types', [...types, type]);
                    } else {
                      handleChange('types', types.filter(t => t !== type));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">{type}</label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Esquema de Dados */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Esquema de Dados
        </label>
        <div className="mt-2 space-y-2">
          {['Estruturado', 'Semi-estruturado', 'Não estruturado'].map((schema) => (
            <div key={schema} className="relative flex items-center">
              <input
                type="radio"
                name="schema"
                value={schema}
                checked={config.data.schema === schema}
                onChange={(e) => handleChange('schema', e.target.value)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-3 block text-sm font-medium text-gray-700">
                {schema}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Exemplo de Payload */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Exemplo de Payload
        </label>
        <textarea
          value={config.data.payloadExample || ''}
          onChange={(e) => handleChange('payloadExample', e.target.value)}
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder={`{\n  "temperature": 25.5,\n  "humidity": 60,\n  "timestamp": "2024-03-19T10:00:00Z"\n}`}
        />
      </div>

      {/* Validação de Dados */}
      <div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={config.data.validation || false}
            onChange={(e) => handleChange('validation', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-2 block text-sm font-medium text-gray-700">
            Habilitar Validação de Dados
          </label>
        </div>
      </div>
    </div>
  );
};

export default DataStep; 