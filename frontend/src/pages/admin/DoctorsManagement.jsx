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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Pagination,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Block,
  CheckCircle,
  Delete,
  Refresh,
  Search,
  Visibility,
} from '@mui/icons-material';
import api from '../../utils/api';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

const DoctorsManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, doctor: null });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadDoctors();
    loadStats();
  }, [page]);

  const loadDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/admin/doctors?page=${page}&limit=15`);
      setDoctors(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      setError('Failed to load doctors');
      console.error('Load doctors error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data || {});
    } catch (error) {
      console.error('Failed to load admin stats for doctors page:', error);
    }
  };

  const handleToggleStatus = async (doctorId) => {
    try {
      await api.patch(`/admin/users/${doctorId}/toggle-status`);
      loadDoctors();
    } catch (error) {
      setError('Failed to toggle doctor status');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/users/${deleteDialog.doctor._id}`);
      setDeleteDialog({ open: false, doctor: null });
      loadDoctors();
    } catch (error) {
      setError('Failed to delete doctor');
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.firstName} ${doctor.lastName} ${doctor.email} ${doctor.specialization}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Doctors Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all registered doctors
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={loadDoctors}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        {/* Top 5 Most Active Doctors */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Top 5 Most Active Doctors
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.analytics?.topDoctors || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="appointmentCount" fill="#1976d2" name="Appointments" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <TextField
          fullWidth
          placeholder="Search doctors by name, email, or specialization..."
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
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Specialization</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>License Number</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDoctors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" py={3}>
                          No doctors found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDoctors.map((doctor) => (
                      <TableRow key={doctor._id}>
                        <TableCell>{`${doctor.firstName} ${doctor.lastName}`}</TableCell>
                        <TableCell>{doctor.email}</TableCell>
                        <TableCell>{doctor.specialization || 'N/A'}</TableCell>
                        <TableCell>{doctor.phone || 'N/A'}</TableCell>
                        <TableCell>{doctor.licenseNumber || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={doctor.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={doctor.isActive ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color={doctor.isActive ? 'warning' : 'success'}
                            onClick={() => handleToggleStatus(doctor._id)}
                            title={doctor.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {doctor.isActive ? <Block /> : <CheckCircle />}
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, doctor })}
                            title="Delete"
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, doctor: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete Dr. {deleteDialog.doctor?.firstName} {deleteDialog.doctor?.lastName}?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, doctor: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorsManagement;
