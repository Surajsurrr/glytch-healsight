import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const MedicalRecords = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Medical Records
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Medical records and document management - Coming soon
        </Typography>
      </Paper>
    </Box>
  );
};

export default MedicalRecords;
