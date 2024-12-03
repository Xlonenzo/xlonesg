import React from 'react';

const CommunicationStep = ({ config, setConfig }) => {
  const handleChange = (field, value) => {
    setConfig({
      ...config,
      communication: {
        ...config.communication,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Configuração de Comunicação</h2>
      
      {/* Protocolos */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Protocolo de Comunicação
        </label>
        <select
          value={config.communication?.protocol || ''}
          onChange={(e) => handleChange('protocol', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Selecione um protocolo</option>
          <option value="MQTT">MQTT</option>
          <option value="HTTP">HTTP/HTTPS</option>
          <option value="CoAP">CoAP</option>
          <option value="BLE">Bluetooth Low Energy</option>
          <option value="Zigbee">Zigbee</option>
          <option value="LoRaWAN">LoRaWAN</option>
        </select>
      </div>

      {/* Topologia */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Topologia de Rede
        </label>
        <select
          value={config.communication?.topology || ''}
          onChange={(e) => handleChange('topology', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Selecione uma topologia</option>
          <option value="star">Estrela</option>
          <option value="mesh">Malha</option>
          <option value="tree">Árvore</option>
        </select>
      </div>

      {/* Método de Transmissão */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Método de Transmissão
        </label>
        <select
          value={config.communication?.transmissionMethod || ''}
          onChange={(e) => handleChange('transmissionMethod', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Selecione um método</option>
          <option value="unicast">Unicast</option>
          <option value="multicast">Multicast</option>
          <option value="broadcast">Broadcast</option>
        </select>
      </div>

      {/* Configurações Específicas do Protocolo */}
      {config.communication?.protocol === 'MQTT' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tópico MQTT
            </label>
            <input
              type="text"
              value={config.communication?.mqttTopic || ''}
              onChange={(e) => handleChange('mqttTopic', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="device/sensor"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              QoS
            </label>
            <select
              value={config.communication?.mqttQos || ''}
              onChange={(e) => handleChange('mqttQos', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione um QoS</option>
              <option value="0">QoS 0</option>
              <option value="1">QoS 1</option>
              <option value="2">QoS 2</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationStep; 