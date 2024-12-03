import React from 'react';

const SecurityStep = ({ config, setConfig }) => {
  const handleChange = (field, value) => {
    setConfig({
      ...config,
      security: {
        ...config.security,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Configuração de Segurança</h2>
      
      {/* Autenticação */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de Autenticação
        </label>
        <div className="grid grid-cols-2 gap-4">
          {['API Keys', 'OAuth 2.0', 'Certificados TLS/SSL', 'Token JWT'].map((method) => (
            <div key={method} className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  checked={(config.security.authMethods || []).includes(method)}
                  onChange={(e) => {
                    const methods = config.security.authMethods || [];
                    if (e.target.checked) {
                      handleChange('authMethods', [...methods, method]);
                    } else {
                      handleChange('authMethods', methods.filter(m => m !== method));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">{method}</label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Autorização */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Controle de Acesso
        </label>
        <div className="space-y-2">
          <div className="relative flex items-center">
            <input
              type="radio"
              name="accessControl"
              value="RBAC"
              checked={config.security.accessControl === 'RBAC'}
              onChange={(e) => handleChange('accessControl', e.target.value)}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-3 block text-sm font-medium text-gray-700">
              Controle de Acesso Baseado em Funções (RBAC)
            </label>
          </div>
          <div className="relative flex items-center">
            <input
              type="radio"
              name="accessControl"
              value="ACL"
              checked={config.security.accessControl === 'ACL'}
              onChange={(e) => handleChange('accessControl', e.target.value)}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-3 block text-sm font-medium text-gray-700">
              Listas de Controle de Acesso (ACL)
            </label>
          </div>
        </div>
      </div>

      {/* Criptografia */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Criptografia</h3>
        
        {/* Dados em Trânsito */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Criptografia em Trânsito
          </label>
          <select
            value={config.security.transitEncryption || ''}
            onChange={(e) => handleChange('transitEncryption', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Selecione o tipo de criptografia</option>
            <option value="TLS_1_2">TLS 1.2</option>
            <option value="TLS_1_3">TLS 1.3</option>
            <option value="AES_256">AES-256</option>
          </select>
        </div>

        {/* Dados em Repouso */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Criptografia em Repouso
          </label>
          <select
            value={config.security.restEncryption || ''}
            onChange={(e) => handleChange('restEncryption', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Selecione o tipo de criptografia</option>
            <option value="AES_256">AES-256</option>
            <option value="RSA_2048">RSA 2048</option>
            <option value="RSA_4096">RSA 4096</option>
          </select>
        </div>
      </div>

      {/* Integridade de Dados */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Integridade de Dados
        </label>
        <div className="space-y-2">
          {['Hashing', 'Assinaturas Digitais', 'Checksums'].map((method) => (
            <div key={method} className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  checked={(config.security.integrityMethods || []).includes(method)}
                  onChange={(e) => {
                    const methods = config.security.integrityMethods || [];
                    if (e.target.checked) {
                      handleChange('integrityMethods', [...methods, method]);
                    } else {
                      handleChange('integrityMethods', methods.filter(m => m !== method));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">{method}</label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificados */}
      {(config.security.authMethods || []).includes('Certificados TLS/SSL') && (
        <div className="space-y-4 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-medium">Configuração de Certificados</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Autoridade Certificadora (CA)
            </label>
            <input
              type="text"
              value={config.security.ca || ''}
              onChange={(e) => handleChange('ca', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nome da CA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Validade do Certificado (dias)
            </label>
            <input
              type="number"
              value={config.security.certValidity || ''}
              onChange={(e) => handleChange('certValidity', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="1"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityStep; 