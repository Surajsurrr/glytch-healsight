import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Profile
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Information
        </Typography>
        <Typography variant="body1">
          Name: {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant="body1">
          Email: {user?.email}
        </Typography>
        <Typography variant="body1">
          Role: {user?.role}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Profile;
