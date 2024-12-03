import React, { useState } from 'react';
import { Network, ArrowLeft, ArrowRight, Save } from 'lucide-react';

const IoTConfigurator = ({ buttonColor }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState({
    device: {
      type: '',
      name: '',
      manufacturer: '',
      model: '',
      location: '',
      description: '',
      serialNumber: '',
      firmware: '',
      status: 'active'
    },
    communication: {
      protocol: '',
      topology: '',
      host: '',
      port: '',
      username: '',
      password: '',
      qos: '',
      keepAlive: '',
      timeout: '',
      retryInterval: ''
    },
    data: {
      format: '',
      frequency: '',
      retention: '',
      schema: '',
      compression: false,
      validation: false,
      preprocessing: '',
      storage: '',
      backup: false
    },
    security: {
      authentication: '',
      encryption: '',
      certificates: false,
      tokenType: '',
      tokenExpiration: '',
      accessControl: '',
      firewall: false,
      vpn: false
    },
    integration: {
      type: '',
      endpoint: '',
      apiKey: '',
      format: '',
      mapping: '',
      transformation: '',
      validation: '',
      errorHandling: ''
    },
    monitoring: {
      alerts: false,
      metrics: [],
      logging: false,
      healthCheck: false,
      diagnostics: false,
      notifications: {
        email: false,
        sms: false,
        webhook: false
      }
    }
  });

  const steps = [
    {
      title: "Dispositivo",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Dispositivo</label>
            <select
              value={config.device.type}
              onChange={(e) => setConfig({
                ...config,
                device: { ...config.device, type: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione um tipo</option>
              <option value="sensor">Sensor</option>
              <option value="actuator">Atuador</option>
              <option value="gateway">Gateway</option>
              <option value="controller">Controlador</option>
              <option value="hybrid">Híbrido</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Dispositivo</label>
            <input
              type="text"
              value={config.device.name}
              onChange={(e) => setConfig({
                ...config,
                device: { ...config.device, name: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: Sensor de Temperatura 01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fabricante</label>
            <input
              type="text"
              value={config.device.manufacturer}
              onChange={(e) => setConfig({
                ...config,
                device: { ...config.device, manufacturer: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: Fabricante XYZ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Modelo</label>
            <input
              type="text"
              value={config.device.model}
              onChange={(e) => setConfig({
                ...config,
                device: { ...config.device, model: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: ST-1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Número de Série</label>
            <input
              type="text"
              value={config.device.serialNumber}
              onChange={(e) => setConfig({
                ...config,
                device: { ...config.device, serialNumber: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: SN123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Versão do Firmware</label>
            <input
              type="text"
              value={config.device.firmware}
              onChange={(e) => setConfig({
                ...config,
                device: { ...config.device, firmware: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: v1.2.3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Localização</label>
            <input
              type="text"
              value={config.device.location}
              onChange={(e) => setConfig({
                ...config,
                device: { ...config.device, location: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: Sala 101, Prédio A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              value={config.device.description}
              onChange={(e) => setConfig({
                ...config,
                device: { ...config.device, description: e.target.value }
              })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Descreva o dispositivo e sua função..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={config.device.status}
              onChange={(e) => setConfig({
                ...config,
                device: { ...config.device, status: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="maintenance">Manutenção</option>
              <option value="error">Erro</option>
            </select>
          </div>
        </div>
      )
    },
    {
      title: "Comunicação",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Protocolo</label>
            <select
              value={config.communication.protocol}
              onChange={(e) => setConfig({
                ...config,
                communication: { ...config.communication, protocol: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione um protocolo</option>
              <option value="mqtt">MQTT</option>
              <option value="http">HTTP/HTTPS</option>
              <option value="coap">CoAP</option>
              <option value="websocket">WebSocket</option>
              <option value="modbus">Modbus</option>
              <option value="opcua">OPC UA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Topologia</label>
            <select
              value={config.communication.topology}
              onChange={(e) => setConfig({
                ...config,
                communication: { ...config.communication, topology: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione uma topologia</option>
              <option value="pointToPoint">Ponto a Ponto</option>
              <option value="pubsub">Publicador/Assinante</option>
              <option value="mesh">Malha</option>
              <option value="star">Estrela</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Host/Broker</label>
            <input
              type="text"
              value={config.communication.host}
              onChange={(e) => setConfig({
                ...config,
                communication: { ...config.communication, host: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: broker.exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Porta</label>
            <input
              type="number"
              value={config.communication.port}
              onChange={(e) => setConfig({
                ...config,
                communication: { ...config.communication, port: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: 1883"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Usuário</label>
            <input
              type="text"
              value={config.communication.username}
              onChange={(e) => setConfig({
                ...config,
                communication: { ...config.communication, username: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nome de usuário"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              value={config.communication.password}
              onChange={(e) => setConfig({
                ...config,
                communication: { ...config.communication, password: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Senha"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">QoS (Quality of Service)</label>
            <select
              value={config.communication.qos}
              onChange={(e) => setConfig({
                ...config,
                communication: { ...config.communication, qos: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione o nível de QoS</option>
              <option value="0">0 - No máximo uma vez</option>
              <option value="1">1 - Pelo menos uma vez</option>
              <option value="2">2 - Exatamente uma vez</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Keep Alive (segundos)</label>
            <input
              type="number"
              value={config.communication.keepAlive}
              onChange={(e) => setConfig({
                ...config,
                communication: { ...config.communication, keepAlive: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: 60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Timeout (segundos)</label>
            <input
              type="number"
              value={config.communication.timeout}
              onChange={(e) => setConfig({
                ...config,
                communication: { ...config.communication, timeout: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: 30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Intervalo de Retry (segundos)</label>
            <input
              type="number"
              value={config.communication.retryInterval}
              onChange={(e) => setConfig({
                ...config,
                communication: { ...config.communication, retryInterval: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: 5"
            />
          </div>
        </div>
      )
    },
    {
      title: "Dados",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Formato dos Dados</label>
            <select
              value={config.data.format}
              onChange={(e) => setConfig({
                ...config,
                data: { ...config.data, format: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione um formato</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
              <option value="csv">CSV</option>
              <option value="binary">Binário</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Frequência de Coleta</label>
            <select
              value={config.data.frequency}
              onChange={(e) => setConfig({
                ...config,
                data: { ...config.data, frequency: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione a frequência</option>
              <option value="realtime">Tempo Real</option>
              <option value="1min">A cada minuto</option>
              <option value="5min">A cada 5 minutos</option>
              <option value="15min">A cada 15 minutos</option>
              <option value="1hour">A cada hora</option>
              <option value="1day">Diário</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Período de Retenção</label>
            <select
              value={config.data.retention}
              onChange={(e) => setConfig({
                ...config,
                data: { ...config.data, retention: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione o período</option>
              <option value="7days">7 dias</option>
              <option value="30days">30 dias</option>
              <option value="90days">90 dias</option>
              <option value="1year">1 ano</option>
              <option value="unlimited">Ilimitado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Schema dos Dados</label>
            <textarea
              value={config.data.schema}
              onChange={(e) => setConfig({
                ...config,
                data: { ...config.data, schema: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
              placeholder="Defina o schema dos dados (JSON, XML, etc)"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.data.compression}
                onChange={(e) => setConfig({
                  ...config,
                  data: { ...config.data, compression: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Compressão de Dados</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.data.validation}
                onChange={(e) => setConfig({
                  ...config,
                  data: { ...config.data, validation: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Validação de Dados</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pré-processamento</label>
            <select
              value={config.data.preprocessing}
              onChange={(e) => setConfig({
                ...config,
                data: { ...config.data, preprocessing: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione o tipo</option>
              <option value="none">Nenhum</option>
              <option value="filtering">Filtragem</option>
              <option value="aggregation">Agregação</option>
              <option value="normalization">Normalização</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Armazenamento</label>
            <select
              value={config.data.storage}
              onChange={(e) => setConfig({
                ...config,
                data: { ...config.data, storage: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione o tipo</option>
              <option value="local">Local</option>
              <option value="cloud">Nuvem</option>
              <option value="hybrid">Híbrido</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={config.data.backup}
              onChange={(e) => setConfig({
                ...config,
                data: { ...config.data, backup: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">Backup Automático</label>
          </div>
        </div>
      )
    },
    {
      title: "Segurança",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Método de Autenticação</label>
            <select
              value={config.security.authentication}
              onChange={(e) => setConfig({
                ...config,
                security: { ...config.security, authentication: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione um método</option>
              <option value="token">Token</option>
              <option value="oauth">OAuth 2.0</option>
              <option value="certificate">Certificado Digital</option>
              <option value="basic">Basic Auth</option>
              <option value="apikey">API Key</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Criptografia</label>
            <select
              value={config.security.encryption}
              onChange={(e) => setConfig({
                ...config,
                security: { ...config.security, encryption: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione o tipo</option>
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
              <option value="aes">AES</option>
              <option value="rsa">RSA</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.security.certificates}
                onChange={(e) => setConfig({
                  ...config,
                  security: { ...config.security, certificates: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Usar Certificados SSL/TLS</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Token</label>
            <select
              value={config.security.tokenType}
              onChange={(e) => setConfig({
                ...config,
                security: { ...config.security, tokenType: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione o tipo</option>
              <option value="jwt">JWT</option>
              <option value="bearer">Bearer</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Expiração do Token (horas)</label>
            <input
              type="number"
              value={config.security.tokenExpiration}
              onChange={(e) => setConfig({
                ...config,
                security: { ...config.security, tokenExpiration: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: 24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Controle de Acesso</label>
            <select
              value={config.security.accessControl}
              onChange={(e) => setConfig({
                ...config,
                security: { ...config.security, accessControl: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione o tipo</option>
              <option value="rbac">RBAC (Role Based)</option>
              <option value="abac">ABAC (Attribute Based)</option>
              <option value="mac">MAC (Mandatory)</option>
              <option value="dac">DAC (Discretionary)</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.security.firewall}
                onChange={(e) => setConfig({
                  ...config,
                  security: { ...config.security, firewall: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Firewall Ativo</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.security.vpn}
                onChange={(e) => setConfig({
                  ...config,
                  security: { ...config.security, vpn: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Conexão VPN</label>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Integração",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Integração</label>
            <select
              value={config.integration.type}
              onChange={(e) => setConfig({
                ...config,
                integration: { ...config.integration, type: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione o tipo</option>
              <option value="rest">REST API</option>
              <option value="graphql">GraphQL</option>
              <option value="grpc">gRPC</option>
              <option value="webhook">Webhook</option>
              <option value="kafka">Apache Kafka</option>
              <option value="rabbitmq">RabbitMQ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Endpoint</label>
            <input
              type="text"
              value={config.integration.endpoint}
              onChange={(e) => setConfig({
                ...config,
                integration: { ...config.integration, endpoint: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://api.exemplo.com/endpoint"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Chave de API</label>
            <input
              type="password"
              value={config.integration.apiKey}
              onChange={(e) => setConfig({
                ...config,
                integration: { ...config.integration, apiKey: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Sua chave de API"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Formato de Dados</label>
            <select
              value={config.integration.format}
              onChange={(e) => setConfig({
                ...config,
                integration: { ...config.integration, format: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione o formato</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
              <option value="protobuf">Protocol Buffers</option>
              <option value="avro">Apache Avro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mapeamento de Dados</label>
            <textarea
              value={config.integration.mapping}
              onChange={(e) => setConfig({
                ...config,
                integration: { ...config.integration, mapping: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
              placeholder="Defina o mapeamento dos dados"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Transformação</label>
            <select
              value={config.integration.transformation}
              onChange={(e) => setConfig({
                ...config,
                integration: { ...config.integration, transformation: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione o tipo</option>
              <option value="none">Nenhuma</option>
              <option value="custom">Personalizada</option>
              <option value="template">Template</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Validação</label>
            <select
              value={config.integration.validation}
              onChange={(e) => setConfig({
                ...config,
                integration: { ...config.integration, validation: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione o tipo</option>
              <option value="schema">Schema</option>
              <option value="custom">Personalizada</option>
              <option value="none">Nenhuma</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tratamento de Erros</label>
            <select
              value={config.integration.errorHandling}
              onChange={(e) => setConfig({
                ...config,
                integration: { ...config.integration, errorHandling: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione a estratégia</option>
              <option value="retry">Retry</option>
              <option value="queue">Fila de Erros</option>
              <option value="ignore">Ignorar</option>
              <option value="alert">Alertar</option>
            </select>
          </div>
        </div>
      )
    },
    {
      title: "Monitoramento",
      content: (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.monitoring.alerts}
                onChange={(e) => setConfig({
                  ...config,
                  monitoring: { ...config.monitoring, alerts: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Alertas Ativos</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.monitoring.logging}
                onChange={(e) => setConfig({
                  ...config,
                  monitoring: { ...config.monitoring, logging: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Logging</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.monitoring.healthCheck}
                onChange={(e) => setConfig({
                  ...config,
                  monitoring: { ...config.monitoring, healthCheck: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Health Check</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.monitoring.diagnostics}
                onChange={(e) => setConfig({
                  ...config,
                  monitoring: { ...config.monitoring, diagnostics: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Diagnósticos</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Métricas para Monitorar</label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.monitoring.metrics.includes('cpu')}
                  onChange={(e) => {
                    const metrics = e.target.checked 
                      ? [...config.monitoring.metrics, 'cpu']
                      : config.monitoring.metrics.filter(m => m !== 'cpu');
                    setConfig({
                      ...config,
                      monitoring: { ...config.monitoring, metrics }
                    });
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">CPU</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.monitoring.metrics.includes('memory')}
                  onChange={(e) => {
                    const metrics = e.target.checked 
                      ? [...config.monitoring.metrics, 'memory']
                      : config.monitoring.metrics.filter(m => m !== 'memory');
                    setConfig({
                      ...config,
                      monitoring: { ...config.monitoring, metrics }
                    });
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Memória</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.monitoring.metrics.includes('network')}
                  onChange={(e) => {
                    const metrics = e.target.checked 
                      ? [...config.monitoring.metrics, 'network']
                      : config.monitoring.metrics.filter(m => m !== 'network');
                    setConfig({
                      ...config,
                      monitoring: { ...config.monitoring, metrics }
                    });
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Rede</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.monitoring.metrics.includes('latency')}
                  onChange={(e) => {
                    const metrics = e.target.checked 
                      ? [...config.monitoring.metrics, 'latency']
                      : config.monitoring.metrics.filter(m => m !== 'latency');
                    setConfig({
                      ...config,
                      monitoring: { ...config.monitoring, metrics }
                    });
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Latência</label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notificações</label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.monitoring.notifications.email}
                  onChange={(e) => setConfig({
                    ...config,
                    monitoring: { 
                      ...config.monitoring, 
                      notifications: {
                        ...config.monitoring.notifications,
                        email: e.target.checked
                      }
                    }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Email</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.monitoring.notifications.sms}
                  onChange={(e) => setConfig({
                    ...config,
                    monitoring: { 
                      ...config.monitoring, 
                      notifications: {
                        ...config.monitoring.notifications,
                        sms: e.target.checked
                      }
                    }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">SMS</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.monitoring.notifications.webhook}
                  onChange={(e) => setConfig({
                    ...config,
                    monitoring: { 
                      ...config.monitoring, 
                      notifications: {
                        ...config.monitoring.notifications,
                        webhook: e.target.checked
                      }
                    }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Webhook</label>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-lg p-6">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <span
              key={index}
              className={`text-sm font-medium ${
                index === currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              {step.title}
            </span>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="mb-8">
        {steps[currentStep].content}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 flex items-center space-x-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          style={{ backgroundColor: currentStep === 0 ? '#f3f4f6' : buttonColor }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Anterior</span>
        </button>

        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          className="px-4 py-2 flex items-center space-x-2 text-white rounded-md"
          style={{ backgroundColor: buttonColor }}
        >
          <span>Próximo</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default IoTConfigurator; 