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
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
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

  const processAppointmentTrendData = () => {
    const trendData = {};
    const last30Days = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last30Days.push(dateStr);
      trendData[dateStr] = { date: dateStr, scheduled: 0, completed: 0, cancelled: 0 };
    }

    appointments.forEach((apt) => {
      if (!apt || !apt.appointmentDate) return;
      const d = new Date(apt.appointmentDate).toISOString().split('T')[0];
      if (!trendData[d]) return;
      const status = (apt.status || '').toLowerCase();
      if (status === 'completed') trendData[d].completed += 1;
      else if (status === 'cancelled') trendData[d].cancelled += 1;
      else trendData[d].scheduled += 1; // treat pending/confirmed/other as scheduled
    });

    return last30Days
      .filter((_, index) => index % 3 === 0)
      .map((date) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        scheduled: trendData[date].scheduled,
        completed: trendData[date].completed,
        cancelled: trendData[date].cancelled,
      }));
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
        {/* Appointments Trend (Last 30 Days) */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Appointments Trend (Last 30 Days)
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={processAppointmentTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="scheduled" stroke="#2196f3" strokeWidth={2} name="Scheduled" />
              <Line type="monotone" dataKey="completed" stroke="#4caf50" strokeWidth={2} name="Completed" />
              <Line type="monotone" dataKey="cancelled" stroke="#f44336" strokeWidth={2} name="Cancelled" />
            </LineChart>
          </ResponsiveContainer>
        </Box>

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
