import React, { useState, useEffect } from 'react';
import { FormControlLabel, Switch } from '@mui/material';

const UserEdit = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    full_name: '',
    is_active: true,
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        is_active: user.is_active,
      });
    }
  }, [user]);

  return (
    <FormControlLabel
      control={
        <Switch
          checked={formData.is_active}
          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
          name="is_active"
        />
      }
      label="Usuário Ativo"
    />
  );
};

export default UserEdit; 