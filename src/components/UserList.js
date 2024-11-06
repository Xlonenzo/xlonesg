import React from 'react';
import { Chip } from '@mui/material';

const UserList: React.FC = () => {
  // Your existing code here

  return (
    <TableCell>
      <Chip 
        label={user.is_active ? "Ativo" : "Inativo"}
        color={user.is_active ? "success" : "error"}
      />
    </TableCell>
  );
};

export default UserList; 