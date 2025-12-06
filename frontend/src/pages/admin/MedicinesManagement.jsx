import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Pagination,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Refresh, Search } from '@mui/icons-material';
import api from '../../utils/api';

const MedicinesManagement = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPrescriptions();
  }, [page]);

  const loadPrescriptions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/admin/prescriptions?page=${page}&limit=15`);
      setPrescriptions(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      setError('Failed to load prescriptions');
      console.error('Load prescriptions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'dispensed':
        return 'info';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const searchString = `${rx.patientId?.firstName} ${rx.patientId?.lastName} ${rx.doctorId?.firstName} ${rx.doctorId?.lastName}`;
    return searchString.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Medicines & Prescriptions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View all prescriptions and medications
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={loadPrescriptions}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          placeholder="Search prescriptions by patient or doctor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Date Prescribed</TableCell>
                    <TableCell>Medications Count</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPrescriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary" py={3}>
                          No prescriptions found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPrescriptions.map((rx) => (
                      <TableRow key={rx._id}>
                        <TableCell>
                          {rx.patientId ? `${rx.patientId.firstName} ${rx.patientId.lastName}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {rx.doctorId ? `Dr. ${rx.doctorId.firstName} ${rx.doctorId.lastName}` : 'N/A'}
                        </TableCell>
                        <TableCell>{formatDate(rx.createdAt)}</TableCell>
                        <TableCell>
                          <Chip label={`${rx.medications?.length || 0} items`} size="small" color="primary" />
                        </TableCell>
                        <TableCell>
                          <Chip label={rx.status} size="small" color={getStatusColor(rx.status)} />
                        </TableCell>
                        <TableCell>{rx.notes?.substring(0, 40) || 'No notes'}...</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default MedicinesManagement;
