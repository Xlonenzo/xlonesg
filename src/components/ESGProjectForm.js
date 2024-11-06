import React from 'react';

function ESGProjectForm({
  project,
  companies,
  bonds,
  kpis,
  onCompanyChange,
  onSave,
  onCancel,
  buttonColor
}) {
  const [formData, setFormData] = React.useState({
    name: project?.name || '',
    company_id: project?.company_id || '',
    bond_id: project?.bond_id || '',
    category: project?.category || '',
    allocated_value: project?.allocated_value || 0,
    compliance_reported: project?.compliance_reported || false,
    social_impact_measured: project?.social_impact_measured || '',
    impact_report_date: project?.impact_report_date || '',
    external_audit: project?.external_audit || false,
    kpi_entry_id: project?.kpi_entry_id || '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    if (name === 'company_id') {
      onCompanyChange(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h3 className="text-xl font-bold mb-4">
          {project ? 'Editar Projeto ESG' : 'Novo Projeto ESG'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome do Projeto</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Empresa</label>
              <select
                name="company_id"
                value={formData.company_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              >
                <option value="">Selecione uma empresa</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <select
                name="bond_id"
                value={formData.bond_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              >
                <option value="">Selecione um título</option>
                {bonds.map(bond => (
                  <option key={bond.id} value={bond.id}>{bond.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">KPI</label>
              <select
                name="kpi_entry_id"
                value={formData.kpi_entry_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
                disabled={!formData.company_id}
              >
                <option value="">Selecione um KPI</option>
                {kpis.map(kpi => (
                  <option key={kpi.entry_id} value={kpi.entry_id}>
                    {kpi.template_name} - {kpi.category} ({kpi.actual_value} {kpi.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Outros campos do formulário */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Categoria</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Valor Alocado</label>
              <input
                type="number"
                name="allocated_value"
                value={formData.allocated_value}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Data do Relatório</label>
              <input
                type="date"
                name="impact_report_date"
                value={formData.impact_report_date}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Impacto Social Medido</label>
              <input
                type="text"
                name="social_impact_measured"
                value={formData.social_impact_measured}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div className="col-span-2 flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="compliance_reported"
                  checked={formData.compliance_reported}
                  onChange={handleChange}
                  className="rounded border-gray-300"
                />
                <span className="ml-2">Conformidade Reportada</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="external_audit"
                  checked={formData.external_audit}
                  onChange={handleChange}
                  className="rounded border-gray-300"
                />
                <span className="ml-2">Auditoria Externa</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{ backgroundColor: buttonColor }}
              className="px-4 py-2 rounded-md text-white"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ESGProjectForm; 