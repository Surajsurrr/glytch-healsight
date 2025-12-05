import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Visits = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Visits & Consultations
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Visit records and consultation notes - Coming soon
        </Typography>
      </Paper>
    </Box>
  );
};

export default Visits;
