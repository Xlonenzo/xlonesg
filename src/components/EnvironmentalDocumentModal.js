import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function EnvironmentalDocumentModal({ show, onClose, onSave, document, constants }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: '',
    document_subtype: '',
    thematic_area: '',
    document_status: '',
    validity_period: '',
    language: '',
    document_format: '',
    creation_date: '',
    last_modification_date: '',
    latitude: '',
    longitude: '',
    accessibility: '',
    executive_summary: '',
    notes: '',
    signature_authentication: '',
    legal_notice: ''
  });

  useEffect(() => {
    if (document) {
      setFormData({
        ...document,
        creation_date: document.creation_date ? document.creation_date.split('T')[0] : '',
        last_modification_date: document.last_modification_date ? document.last_modification_date.split('T')[0] : ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        document_type: '',
        document_subtype: '',
        thematic_area: '',
        document_status: '',
        validity_period: '',
        language: '',
        document_format: '',
        creation_date: '',
        last_modification_date: '',
        latitude: '',
        longitude: '',
        accessibility: '',
        executive_summary: '',
        notes: '',
        signature_authentication: '',
        legal_notice: ''
      });
    }
  }, [document]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {document ? 'Editar Documento' : 'Novo Documento'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos do formulário */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
              <select
                name="document_type"
                value={formData.document_type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Selecione...</option>
                {constants.documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Adicione mais campos conforme necessário */}
            {/* ... */}

          </div>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EnvironmentalDocumentModal; 