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

const AppointmentsManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [page]);

  const loadAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/admin/appointments?page=${page}&limit=15`);
      setAppointments(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      setError('Failed to load appointments');
      console.error('Load appointments error:', error);
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
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const searchString = `${apt.patientId?.firstName} ${apt.patientId?.lastName} ${apt.doctorId?.firstName} ${apt.doctorId?.lastName} ${apt.status}`;
    return searchString.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Appointments Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all appointments
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={loadAppointments}>
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
          placeholder="Search appointments by patient, doctor, or status..."
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
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" py={3}>
                          No appointments found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <TableRow key={apt._id}>
                        <TableCell>
                          {apt.patientId ? `${apt.patientId.firstName} ${apt.patientId.lastName}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {apt.doctorId ? `Dr. ${apt.doctorId.firstName} ${apt.doctorId.lastName}` : 'N/A'}
                        </TableCell>
                        <TableCell>{formatDate(apt.appointmentDate)}</TableCell>
                        <TableCell>{apt.timeSlot}</TableCell>
                        <TableCell>
                          <Chip label={apt.appointmentType} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={apt.status} size="small" color={getStatusColor(apt.status)} />
                        </TableCell>
                        <TableCell>{apt.reason?.substring(0, 30)}...</TableCell>
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

export default AppointmentsManagement;
