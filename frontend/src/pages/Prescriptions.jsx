import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Prescriptions = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Prescriptions
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Prescription management - Coming soon
        </Typography>
      </Paper>
    </Box>
  );
};

export default Prescriptions;
