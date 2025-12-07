import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  People,
  LocalHospital,
  Event,
  Medication,
  Folder,
  Assessment,
  Refresh,
  CheckCircle,
  Cancel,
  Visibility,
  Description,
  Download,
  Close,
  TrendingUp,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../utils/api';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.light`,
            borderRadius: '50%',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    totalAppointments: 0,
    totalVisits: 0,
    totalPrescriptions: 0,
    totalMedicalRecords: 0,
    pendingVerifications: 0,
    analytics: {
      dailyRegistrations: [],
      appointmentsTrend: [],
      appointmentStatusDistribution: [],
      topDoctors: [],
      patientEngagement: { avgVisitsPerPatient: 0, totalActivePatients: 0 }
    }
  });
  
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState({ open: false, action: '', doctor: null });
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    loadStats();
    loadPendingVerifications();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setError('Failed to load statistics');
    }
  };

  const loadPendingVerifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/verifications/pending');
      setPendingDoctors(response.data.data);
    } catch (error) {
      console.error('Failed to load pending verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (doctorId) => {
    try {
      const response = await api.get(`/admin/verifications/${doctorId}`);
      setSelectedDoctor(response.data.data);
      setDetailsDialog(true);
    } catch (error) {
      setError('Failed to load doctor details');
    }
  };

  const handleApprove = async () => {
    try {
      await api.post(`/admin/verifications/${actionDialog.doctor._id}/approve`, {
        notes: notes,
      });
      setSuccess('Doctor approved successfully!');
      setActionDialog({ open: false, action: '', doctor: null });
      setNotes('');
      loadStats();
      loadPendingVerifications();
    } catch (error) {
      setError('Failed to approve doctor');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    try {
      await api.post(`/admin/verifications/${actionDialog.doctor._id}/reject`, {
        reason: rejectionReason,
        notes: notes,
      });
      setSuccess('Doctor verification rejected');
      setActionDialog({ open: false, action: '', doctor: null });
      setNotes('');
      setRejectionReason('');
      loadStats();
      loadPendingVerifications();
    } catch (error) {
      setError('Failed to reject doctor');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const processRegistrationData = () => {
    const dailyData = {};
    const last7Days = [];
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push(dateStr);
      dailyData[dateStr] = { date: dateStr, patients: 0, doctors: 0 };
    }

    // Fill in actual data
    stats.analytics.dailyRegistrations.forEach(item => {
      if (dailyData[item._id.date]) {
        if (item._id.role === 'patient') {
          dailyData[item._id.date].patients = item.count;
        } else if (item._id.role === 'doctor') {
          dailyData[item._id.date].doctors = item.count;
        }
      }
    });

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      patients: dailyData[date].patients,
      doctors: dailyData[date].doctors,
    }));
  };

  

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Platform overview and statistics
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadStats}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Pending Doctor Verifications Section - TOP PRIORITY */}
      {stats.pendingVerifications > 0 && (
        <Paper sx={{ p: 3, mb: 4, border: '2px solid', borderColor: 'error.main' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Assessment sx={{ fontSize: 32, color: 'error.main' }} />
              <Box>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  Pending Doctor Verifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.pendingVerifications} doctor{stats.pendingVerifications > 1 ? 's' : ''} awaiting verification
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Refresh />}
              onClick={loadPendingVerifications}
            >
              Refresh
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Specialization</TableCell>
                    <TableCell>License Number</TableCell>
                    <TableCell>Documents</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingDoctors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" py={2}>
                          No pending verifications
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingDoctors.map((doctor) => (
                      <TableRow key={doctor._id}>
                        <TableCell>{`Dr. ${doctor.firstName} ${doctor.lastName}`}</TableCell>
                        <TableCell>{doctor.email}</TableCell>
                        <TableCell>{doctor.specialization || 'N/A'}</TableCell>
                        <TableCell>{doctor.licenseNumber || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${doctor.verificationDocuments?.length || 0} files`}
                            size="small"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>{formatDate(doctor.createdAt)}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetails(doctor._id)}
                            title="View Details"
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => setActionDialog({ open: true, action: 'approve', doctor })}
                            title="Approve"
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setActionDialog({ open: true, action: 'reject', doctor })}
                            title="Reject"
                          >
                            <Cancel />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Verifications"
            value={stats.pendingVerifications}
            icon={<Assessment sx={{ fontSize: 40, color: 'error.main' }} />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon={<LocalHospital sx={{ fontSize: 40, color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Doctors"
            value={stats.totalDoctors}
            icon={<LocalHospital sx={{ fontSize: 40, color: 'info.main' }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            icon={<Event sx={{ fontSize: 40, color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Appointments"
            value={stats.totalAppointments}
            icon={<Event sx={{ fontSize: 40, color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Visits"
            value={stats.totalVisits}
            icon={<Assessment sx={{ fontSize: 40, color: 'info.main' }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Prescriptions"
            value={stats.totalPrescriptions}
            icon={<Medication sx={{ fontSize: 40, color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Medical Records"
            value={stats.totalMedicalRecords}
            icon={<Folder sx={{ fontSize: 40, color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* No Pending Verifications - Show after stats */}
      {stats.pendingVerifications === 0 && (
        <Paper sx={{ p: 3, mb: 4, backgroundColor: '#f1f8f4' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                All Caught Up!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No pending doctor verifications at the moment.
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Analytics Section */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUp /> Platform Analytics & Engagement
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* User Registrations Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              User Registrations (Last 7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processRegistrationData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="patients" stroke="#2e7d32" strokeWidth={2} name="Patients" />
                <Line type="monotone" dataKey="doctors" stroke="#0288d1" strokeWidth={2} name="Doctors" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Appointment Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Appointment Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.analytics.appointmentStatusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count }) => `${_id}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.analytics.appointmentStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        

        {/* Patient Engagement Metrics moved to Patients Management page */}

        
      </Grid>

      {/* Doctor Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Doctor Verification Details
            <IconButton onClick={() => setDetailsDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDoctor && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Personal Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Full Name
                        </Typography>
                        <Typography variant="body1">
                          Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">{selectedDoctor.email}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">{selectedDoctor.phone || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Gender
                        </Typography>
                        <Typography variant="body1">{selectedDoctor.gender || 'N/A'}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Professional Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Specialization
                        </Typography>
                        <Typography variant="body1">
                          {selectedDoctor.specialization || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          License Number
                        </Typography>
                        <Typography variant="body1">
                          {selectedDoctor.licenseNumber || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Medical Council ID
                        </Typography>
                        <Typography variant="body1">
                          {selectedDoctor.medicalCouncilId || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Years of Experience
                        </Typography>
                        <Typography variant="body1">
                          {selectedDoctor.yearOfExperience || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Qualifications
                        </Typography>
                        <Typography variant="body1">
                          {selectedDoctor.qualifications?.join(', ') || 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Uploaded Documents
                    </Typography>
                    {selectedDoctor.verificationDocuments?.length > 0 ? (
                      <List>
                        {selectedDoctor.verificationDocuments.map((doc, index) => (
                          <React.Fragment key={index}>
                            <ListItem
                              secondaryAction={
                                <IconButton edge="end" color="primary">
                                  <Download />
                                </IconButton>
                              }
                            >
                              <Description sx={{ mr: 2, color: 'primary.main' }} />
                              <ListItemText
                                primary={doc.fileName}
                                secondary={`${doc.documentType} - Uploaded ${formatDate(
                                  doc.uploadedAt
                                )}`}
                              />
                            </ListItem>
                            {index < selectedDoctor.verificationDocuments.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No documents uploaded
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          {selectedDoctor && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => {
                  setDetailsDialog(false);
                  setActionDialog({ open: true, action: 'approve', doctor: selectedDoctor });
                }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<Cancel />}
                onClick={() => {
                  setDetailsDialog(false);
                  setActionDialog({ open: true, action: 'reject', doctor: selectedDoctor });
                }}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, action: '', doctor: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.action === 'approve' ? 'Approve Doctor' : 'Reject Doctor'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {actionDialog.action === 'approve'
              ? `Are you sure you want to approve Dr. ${actionDialog.doctor?.firstName} ${actionDialog.doctor?.lastName}?`
              : `Please provide a reason for rejecting Dr. ${actionDialog.doctor?.firstName} ${actionDialog.doctor?.lastName}.`}
          </Typography>

          {actionDialog.action === 'reject' && (
            <TextField
              fullWidth
              label="Rejection Reason *"
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
          )}

          <TextField
            fullWidth
            label="Additional Notes (Optional)"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, action: '', doctor: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionDialog.action === 'approve' ? 'success' : 'error'}
            onClick={actionDialog.action === 'approve' ? handleApprove : handleReject}
          >
            {actionDialog.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
