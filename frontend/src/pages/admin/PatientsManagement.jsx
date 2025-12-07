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
  Grid,
  Card,
  CardContent,
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

const PatientsManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ analytics: { patientEngagement: { totalActivePatients: 0, avgVisitsPerPatient: 0 } } });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, patient: null });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPatients();
  }, [page]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/admin/patients?page=${page}&limit=15`);
      setPatients(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      setError('Failed to load patients');
      console.error('Load patients error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (patientId) => {
    try {
      await api.patch(`/admin/users/${patientId}/toggle-status`);
      loadPatients();
    } catch (error) {
      setError('Failed to toggle patient status');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/users/${deleteDialog.patient._id}`);
      setDeleteDialog({ open: false, patient: null });
      loadPatients();
    } catch (error) {
      setError('Failed to delete patient');
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filteredPatients = patients.filter((patient) =>
    `${patient.firstName} ${patient.lastName} ${patient.email} ${patient.bloodGroup}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Patients Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all registered patients
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={loadPatients}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Patient Engagement Metrics - moved from Admin Dashboard */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Patient Engagement Metrics
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ backgroundColor: '#e3f2fd', p: 2 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Active Patients
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {stats.analytics?.patientEngagement?.totalActivePatients || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ backgroundColor: '#f3e5f5', p: 2 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Avg Visits per Patient
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="secondary">
                    {(stats.analytics?.patientEngagement?.avgVisitsPerPatient || 0).toFixed(1)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                <strong>Engagement Rate:</strong> Higher average visits indicate better patient retention and platform engagement.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          placeholder="Search patients by name, email, or blood group..."
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
                    <TableCell>Phone</TableCell>
                    <TableCell>Blood Group</TableCell>
                    <TableCell>Date of Birth</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" py={3}>
                          No patients found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => (
                      <TableRow key={patient._id}>
                        <TableCell>{`${patient.firstName} ${patient.lastName}`}</TableCell>
                        <TableCell>{patient.email}</TableCell>
                        <TableCell>{patient.phone || 'N/A'}</TableCell>
                        <TableCell>{patient.bloodGroup || 'N/A'}</TableCell>
                        <TableCell>
                          {patient.dateOfBirth
                            ? new Date(patient.dateOfBirth).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={patient.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={patient.isActive ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color={patient.isActive ? 'warning' : 'success'}
                            onClick={() => handleToggleStatus(patient._id)}
                            title={patient.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {patient.isActive ? <Block /> : <CheckCircle />}
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, patient })}
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
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, patient: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {deleteDialog.patient?.firstName} {deleteDialog.patient?.lastName}?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, patient: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientsManagement;
