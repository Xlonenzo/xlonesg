import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

function ActionPlanManagement() {
  const [actionPlans, setActionPlans] = useState([]);
  const [error, setError] = useState(null);

  const fetchActionPlans = async () => {
    try {
      console.log('Iniciando busca de planos de ação...');
      const response = await axios({
        method: 'get',
        url: `${API_URL}/action-plans?limit=1000`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false
      });
      
      console.log('Planos de ação recebidos:', response.data);
      
      if (response.data) {
        setActionPlans(response.data);
        setError(null);
      }
    } catch (error) {
      console.error('Erro detalhado ao buscar planos de ação:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Erro ao carregar planos de ação');
    }
  };

  useEffect(() => {
    fetchActionPlans();
  }, []);

  // ... resto do componente
}

export default ActionPlanManagement; 