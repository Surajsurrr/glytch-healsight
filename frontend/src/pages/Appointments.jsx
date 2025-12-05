import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Divider,
  Avatar,
  Stack,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  Person,
  Phone,
  Email,
  LocationOn,
  Search,
  VideoCall,
  CheckCircle,
  Cancel,
  Schedule,
  Event
} from '@mui/icons-material';
import { format, isPast, isFuture, parseISO } from 'date-fns';
import api from '../utils/api';

const Appointments = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments');
      
      // Handle both array and object with data/items property
      const appointmentsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.data || response.data.items || []);

      // If backend returns placeholder, use mock data
      if (appointmentsData.length === 0 || typeof appointmentsData[0] === 'string') {
        setAppointments(getMockAppointments());
        setUsingMockData(true);
      } else {
        setAppointments(appointmentsData);
        setUsingMockData(false);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Using sample data - backend not fully connected');
      setAppointments(getMockAppointments());
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (appointmentId) => {
    try {
      // If using mock data, find the appointment locally
      if (usingMockData) {
        const appointment = appointments.find(apt => apt._id === appointmentId);
        if (appointment) {
          setSelectedAppointment(appointment);
          setDetailsDialogOpen(true);
        } else {
          setSnackbar({ 
            open: true, 
            message: 'Appointment not found', 
            severity: 'error' 
          });
        }
        return;
      }

      // Otherwise fetch from backend
      const response = await api.get(`/appointments/${appointmentId}`);
      setSelectedAppointment(response.data.data);
      setDetailsDialogOpen(true);
    } catch (err) {
      console.error('Error fetching appointment details:', err);
      setSnackbar({ 
        open: true, 
        message: 'Could not load appointment details', 
        severity: 'error' 
      });
    }
  };

  const handleJoinCall = async (appointmentId) => {
    try {
      // If using mock data, generate a mock room ID
      if (usingMockData) {
        const appointment = appointments.find(apt => apt._id === appointmentId);
        if (appointment) {
          const mockRoomId = `mock_room_${appointmentId}_${Date.now()}`;
          navigate(`/video-call/${mockRoomId}`);
        } else {
          setSnackbar({ 
            open: true, 
            message: 'Appointment not found', 
            severity: 'error' 
          });
        }
        return;
      }

      // Otherwise fetch from backend
      const response = await api.get(`/appointments/${appointmentId}/video-call`);
      const { roomId } = response.data.data;
      
      // Navigate to video call page
      navigate(`/video-call/${roomId}`);
    } catch (err) {
      console.error('Error joining call:', err);
      setSnackbar({ 
        open: true, 
        message: 'Could not start video call', 
        severity: 'error' 
      });
    }
  };

  const handleCancelAppointment = async () => {
    try {
      // If using mock data, just update locally
      if (usingMockData) {
        setAppointments(prev => 
          prev.map(apt => 
            apt._id === selectedAppointment._id 
              ? { ...apt, status: 'cancelled' }
              : apt
          )
        );
        setSnackbar({ 
          open: true, 
          message: 'Appointment cancelled successfully (mock mode)', 
          severity: 'success' 
        });
        setCancelDialogOpen(false);
        setSelectedAppointment(null);
        return;
      }

      // Otherwise call backend
      await api.delete(`/appointments/${selectedAppointment._id}`);
      
      setSnackbar({ 
        open: true, 
        message: 'Appointment cancelled successfully', 
        severity: 'success' 
      });
      
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
      
      // Refresh appointments
      fetchAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setSnackbar({ 
        open: true, 
        message: 'Could not cancel appointment', 
        severity: 'error' 
      });
    }
  };

  const getMockAppointments = () => {
    const now = new Date();
    return [
      {
        _id: '1',
        appointmentId: 'APT001',
        patient: {
          name: 'John Doe',
          patientId: 'P001',
          phone: '+1 234-567-8900',
          email: 'john.doe@email.com'
        },
        appointmentDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        appointmentTime: '10:00 AM',
        type: 'In-Person',
        status: 'scheduled',
        reason: 'Regular Checkup',
        notes: 'Annual physical examination'
      },
      {
        _id: '2',
        appointmentId: 'APT002',
        patient: {
          name: 'Jane Smith',
          patientId: 'P002',
          phone: '+1 234-567-8901',
          email: 'jane.smith@email.com'
        },
        appointmentDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        appointmentTime: '02:30 PM',
        type: 'Video',
        status: 'scheduled',
        reason: 'Follow-up Consultation',
        notes: 'Discuss test results'
      },
      {
        _id: '3',
        appointmentId: 'APT003',
        patient: {
          name: 'Robert Johnson',
          patientId: 'P003',
          phone: '+1 234-567-8902',
          email: 'robert.j@email.com'
        },
        appointmentDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        appointmentTime: '11:00 AM',
        type: 'In-Person',
        status: 'completed',
        reason: 'Diabetes Management',
        notes: 'Blood sugar monitoring and medication review'
      },
      {
        _id: '4',
        appointmentId: 'APT004',
        patient: {
          name: 'Emily Davis',
          patientId: 'P004',
          phone: '+1 234-567-8903',
          email: 'emily.davis@email.com'
        },
        appointmentDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        appointmentTime: '03:00 PM',
        type: 'Video',
        status: 'completed',
        reason: 'Post-Surgery Follow-up',
        notes: 'Recovery progress assessment'
      },
      {
        _id: '5',
        appointmentId: 'APT005',
        patient: {
          name: 'Michael Brown',
          patientId: 'P005',
          phone: '+1 234-567-8904',
          email: 'michael.b@email.com'
        },
        appointmentDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        appointmentTime: '09:30 AM',
        type: 'In-Person',
        status: 'cancelled',
        reason: 'General Consultation',
        notes: 'Patient requested cancellation'
      },
      {
        _id: '6',
        appointmentId: 'APT006',
        patient: {
          name: 'Sarah Wilson',
          patientId: 'P006',
          phone: '+1 234-567-8905',
          email: 'sarah.w@email.com'
        },
        appointmentDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        appointmentTime: '01:00 PM',
        type: 'Video',
        status: 'scheduled',
        reason: 'Hypertension Management',
        notes: 'Blood pressure monitoring'
      }
    ];
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'no-show':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return <Schedule />;
      case 'completed':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <Event />;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = !searchQuery || 
      apt.patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.appointmentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.reason?.toLowerCase().includes(searchQuery.toLowerCase());

    const aptDate = parseISO(apt.appointmentDate);
    
    if (tabValue === 0) {
      // Upcoming - scheduled and in future
      return matchesSearch && isFuture(aptDate) && apt.status !== 'cancelled';
    } else {
      // Past - completed, cancelled, or past date
      return matchesSearch && (isPast(aptDate) || apt.status === 'completed' || apt.status === 'cancelled');
    }
  });

  const upcomingCount = appointments.filter(apt => 
    isFuture(parseISO(apt.appointmentDate)) && apt.status !== 'cancelled'
  ).length;

  const pastCount = appointments.filter(apt =>
    isPast(parseISO(apt.appointmentDate)) || apt.status === 'completed' || apt.status === 'cancelled'
  ).length;

  const AppointmentCard = ({ appointment }) => {
    const aptDate = parseISO(appointment.appointmentDate);
    
    return (
      <Card 
        sx={{ 
          mb: 2, 
          '&:hover': { 
            boxShadow: 6,
            transform: 'translateY(-2px)',
            transition: 'all 0.3s'
          } 
        }}
      >
        <CardContent>
          <Grid container spacing={2}>
            {/* Left Section - Patient Info */}
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    width: 56, 
                    height: 56 
                  }}
                >
                  {appointment.patient?.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {appointment.patient?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {appointment.patient?.patientId}
                  </Typography>
                </Box>
              </Stack>
              
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2">
                    {appointment.patient?.phone}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2" noWrap>
                    {appointment.patient?.email}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            {/* Middle Section - Appointment Details */}
            <Grid item xs={12} md={5}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Appointment ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {appointment.appointmentId}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={3} flexWrap="wrap">
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                      <CalendarToday fontSize="small" color="primary" />
                      <Typography variant="body2" fontWeight="medium">
                        {format(aptDate, 'MMM dd, yyyy')}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                      <AccessTime fontSize="small" color="primary" />
                      <Typography variant="body2" fontWeight="medium">
                        {appointment.appointmentTime}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Reason
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {appointment.reason}
                  </Typography>
                </Box>

                {appointment.notes && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {appointment.notes}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Grid>

            {/* Right Section - Status & Actions */}
            <Grid item xs={12} md={3}>
              <Stack spacing={2} alignItems="flex-end" height="100%">
                <Chip
                  icon={getStatusIcon(appointment.status)}
                  label={appointment.status?.toUpperCase()}
                  color={getStatusColor(appointment.status)}
                  sx={{ fontWeight: 'bold' }}
                />
                
                <Chip
                  icon={appointment.type === 'Video' ? <VideoCall /> : <LocationOn />}
                  label={appointment.type}
                  variant="outlined"
                  size="small"
                />

                {appointment.status === 'scheduled' && (
                  <Stack spacing={1} width="100%">
                    <Button 
                      variant="contained" 
                      size="small"
                      fullWidth
                      startIcon={appointment.type === 'Video' ? <VideoCall /> : <LocationOn />}
                      onClick={() => appointment.type === 'Video' ? handleJoinCall(appointment._id) : handleViewDetails(appointment._id)}
                    >
                      {appointment.type === 'Video' ? 'Join Call' : 'View Details'}
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error"
                      size="small"
                      fullWidth
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setCancelDialogOpen(true);
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                )}

                {appointment.status === 'completed' && (
                  <Button 
                    variant="outlined" 
                    size="small"
                    fullWidth
                    onClick={() => handleViewDetails(appointment._id)}
                  >
                    View Report
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4" fontWeight="bold">
            Appointments
          </Typography>
          {usingMockData && (
            <Chip 
              label="Demo Mode" 
              size="small" 
              color="info" 
              variant="outlined"
            />
          )}
        </Box>
        <Button variant="contained" startIcon={<Event />}>
          Schedule New
        </Button>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">
              {upcomingCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upcoming
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="success.main" fontWeight="bold">
              {appointments.filter(a => a.status === 'completed').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="error.main" fontWeight="bold">
              {appointments.filter(a => a.status === 'cancelled').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cancelled
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="text.primary" fontWeight="bold">
              {appointments.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by patient name, appointment ID, or reason..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab 
            label={`Upcoming (${upcomingCount})`} 
            icon={<Schedule />} 
            iconPosition="start"
          />
          <Tab 
            label={`Past (${pastCount})`} 
            icon={<CheckCircle />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Appointments List */}
      <Box>
        {filteredAppointments.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No appointments found
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {searchQuery 
                ? 'Try adjusting your search criteria'
                : tabValue === 0 
                  ? 'No upcoming appointments scheduled'
                  : 'No past appointments'
              }
            </Typography>
          </Paper>
        ) : (
          filteredAppointments.map((appointment) => (
            <AppointmentCard key={appointment._id} appointment={appointment} />
          ))
        )}
      </Box>

      {/* Appointment Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Appointment Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedAppointment && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="overline" color="text.secondary">
                  Patient Information
                </Typography>
                <Stack spacing={1} mt={1}>
                  <Typography variant="body1">
                    <strong>Name:</strong> {selectedAppointment.patient?.name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Patient ID:</strong> {selectedAppointment.patient?.patientId}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Phone:</strong> {selectedAppointment.patient?.phone}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Email:</strong> {selectedAppointment.patient?.email}
                  </Typography>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="overline" color="text.secondary">
                  Appointment Information
                </Typography>
                <Stack spacing={1} mt={1}>
                  <Typography variant="body1">
                    <strong>Appointment ID:</strong> {selectedAppointment.appointmentId}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Date:</strong> {format(parseISO(selectedAppointment.appointmentDate), 'MMM dd, yyyy')}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Time:</strong> {selectedAppointment.appointmentTime}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Type:</strong> {selectedAppointment.type}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Status:</strong> {selectedAppointment.status?.toUpperCase()}
                  </Typography>
                </Stack>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="overline" color="text.secondary">
                  Reason for Visit
                </Typography>
                <Typography variant="body1" mt={1}>
                  {selectedAppointment.reason}
                </Typography>
              </Grid>
              
              {selectedAppointment.notes && (
                <Grid item xs={12}>
                  <Typography variant="overline" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body1" mt={1}>
                    {selectedAppointment.notes}
                  </Typography>
                </Grid>
              )}
              
              {selectedAppointment.diagnosis && (
                <Grid item xs={12}>
                  <Typography variant="overline" color="text.secondary">
                    Diagnosis
                  </Typography>
                  <Typography variant="body1" mt={1}>
                    {selectedAppointment.diagnosis}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog 
        open={cancelDialogOpen} 
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Cancel Appointment?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this appointment?
          </Typography>
          {selectedAppointment && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                <strong>Patient:</strong> {selectedAppointment.patient?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Date:</strong> {format(parseISO(selectedAppointment.appointmentDate), 'MMM dd, yyyy')} at {selectedAppointment.appointmentTime}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            No, Keep It
          </Button>
          <Button onClick={handleCancelAppointment} color="error" variant="contained">
            Yes, Cancel Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Appointments;
