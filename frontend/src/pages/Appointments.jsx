import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Appointments = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Appointments
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Appointment management interface - Coming soon
        </Typography>
      </Paper>
    </Box>
  );
};

export default Appointments;
