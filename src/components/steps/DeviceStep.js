import React from 'react';

const DeviceStep = ({ config, setConfig }) => {
  const handleChange = (field, value) => {
    setConfig({
      ...config,
      device: {
        ...config.device,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Configuração do Dispositivo</h2>
      
      {/* Tipo de Dispositivo */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tipo de Dispositivo
        </label>
        <select
          value={config.device.type || ''}
          onChange={(e) => handleChange('type', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Selecione um tipo</option>
          <option value="sensor">Sensor</option>
          <option value="actuator">Atuador</option>
          <option value="gateway">Gateway</option>
          <option value="hybrid">Dispositivo Híbrido</option>
        </select>
      </div>

      {/* Subtipo (condicional baseado no tipo) */}
      {config.device.type === 'sensor' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Sensor
          </label>
          <select
            value={config.device.subtype || ''}
            onChange={(e) => handleChange('subtype', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Selecione um tipo de sensor</option>
            <option value="temperature">Temperatura</option>
            <option value="humidity">Umidade</option>
            <option value="motion">Movimento</option>
            <option value="light">Luminosidade</option>
          </select>
        </div>
      )}

      {/* Fabricante */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Fabricante
        </label>
        <input
          type="text"
          value={config.device.manufacturer || ''}
          onChange={(e) => handleChange('manufacturer', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Nome do fabricante"
        />
      </div>

      {/* Modelo */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Modelo
        </label>
        <input
          type="text"
          value={config.device.model || ''}
          onChange={(e) => handleChange('model', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Modelo do dispositivo"
        />
      </div>

      {/* Localização */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Localização
        </label>
        <input
          type="text"
          value={config.device.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Localização do dispositivo"
        />
      </div>
    </div>
  );
};

export default DeviceStep; 