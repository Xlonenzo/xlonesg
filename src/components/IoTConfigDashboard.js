import React from 'react';
import IoTConfigurator from './IoTConfigurator';

const IoTConfigDashboard = ({ buttonColor, sidebarColor }) => {
  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Configurador IoT</h1>
        <IoTConfigurator 
          buttonColor={buttonColor}
          sidebarColor={sidebarColor}
        />
      </div>
    </div>
  );
};

export default IoTConfigDashboard; 