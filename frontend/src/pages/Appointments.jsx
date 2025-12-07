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
  Snackbar,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [appointmentReport, setAppointmentReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [usingMockData, setUsingMockData] = useState(false);
  
  // New appointment form state
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: 30,
    type: 'In-Person',
    reason: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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

  const handleViewReport = async (appointmentId) => {
    try {
      setLoadingReport(true);
      setReportDialogOpen(true);

      // If using mock data, create mock report
      if (usingMockData) {
        const appointment = appointments.find(apt => apt._id === appointmentId);
        if (appointment && appointment.status === 'completed') {
          const mockReport = {
            appointmentId: appointment.appointmentId,
            appointmentDate: appointment.appointmentDate,
            appointmentTime: appointment.appointmentTime,
            status: appointment.status,
            patient: appointment.patient,
            doctor: {
              name: 'Dr. Rishi Ram',
              email: 'rishi.ram@glytchmed.com',
              specialization: 'General Medicine'
            },
            reason: appointment.reason,
            diagnosis: appointment.diagnosis || 'Patient examined. Vital signs stable. Recommended continued medication and follow-up in 2 weeks.',
            prescriptions: appointment.prescriptions || [
              {
                medicationName: 'Metformin',
                dosage: '500mg',
                frequency: 'Twice daily',
                duration: '30 days',
                instructions: 'Take with meals'
              },
              {
                medicationName: 'Vitamin D3',
                dosage: '1000 IU',
                frequency: 'Once daily',
                duration: '30 days',
                instructions: 'Take in the morning'
              }
            ],
            reports: appointment.reports || [
              {
                fileName: 'Blood_Test_Report.pdf',
                fileType: 'application/pdf',
                fileSize: 245678,
                uploadedAt: new Date().toISOString(),
                description: 'Complete Blood Count (CBC) results'
              },
              {
                fileName: 'X-Ray_Chest.jpg',
                fileType: 'image/jpeg',
                fileSize: 512340,
                uploadedAt: new Date().toISOString(),
                description: 'Chest X-Ray'
              }
            ],
            notes: appointment.notes,
            completedAt: appointment.appointmentDate
          };
          setAppointmentReport(mockReport);
        } else {
          setSnackbar({ 
            open: true, 
            message: 'No report available for this appointment', 
            severity: 'warning' 
          });
          setReportDialogOpen(false);
        }
        setLoadingReport(false);
        return;
      }

      // Otherwise fetch from backend
      const response = await api.get(`/appointments/${appointmentId}/report`);
      setAppointmentReport(response.data.data);
      setLoadingReport(false);
    } catch (err) {
      console.error('Error fetching appointment report:', err);
      setLoadingReport(false);
      setSnackbar({ 
        open: true, 
        message: 'Could not load appointment report', 
        severity: 'error' 
      });
      setReportDialogOpen(false);
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

  const handleOpenScheduleDialog = () => {
    // Reset form
    setNewAppointment({
      patientId: '',
      patientName: '',
      patientPhone: '',
      patientEmail: '',
      appointmentDate: '',
      appointmentTime: '',
      duration: 30,
      type: 'In-Person',
      reason: '',
      notes: ''
    });
    setFormErrors({});
    setScheduleDialogOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!newAppointment.patientName.trim()) {
      errors.patientName = 'Patient name is required';
    }
    
    if (!newAppointment.patientPhone.trim()) {
      errors.patientPhone = 'Phone number is required';
    }
    
    if (!newAppointment.patientEmail.trim()) {
      errors.patientEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAppointment.patientEmail)) {
      errors.patientEmail = 'Invalid email format';
    }
    
    if (!newAppointment.appointmentDate) {
      errors.appointmentDate = 'Date is required';
    }
    
    if (!newAppointment.appointmentTime) {
      errors.appointmentTime = 'Time is required';
    }
    
    if (!newAppointment.reason.trim()) {
      errors.reason = 'Reason for visit is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleScheduleAppointment = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // If using mock data, create locally
      if (usingMockData) {
        const mockAppointment = {
          _id: `mock_${Date.now()}`,
          appointmentId: `APT${String(appointments.length + 1).padStart(3, '0')}`,
          patient: {
            name: newAppointment.patientName,
            patientId: newAppointment.patientId || `P${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
            phone: newAppointment.patientPhone,
            email: newAppointment.patientEmail
          },
          appointmentDate: new Date(newAppointment.appointmentDate).toISOString(),
          appointmentTime: newAppointment.appointmentTime,
          duration: newAppointment.duration,
          type: newAppointment.type,
          status: 'scheduled',
          reason: newAppointment.reason,
          notes: newAppointment.notes
        };

        setAppointments(prev => [...prev, mockAppointment]);
        
        setSnackbar({
          open: true,
          message: 'Appointment scheduled successfully (mock mode)',
          severity: 'success'
        });
        
        setScheduleDialogOpen(false);
        setSubmitting(false);
        return;
      }

      // Otherwise call backend
      const appointmentData = {
        patientId: newAppointment.patientId,
        appointmentDate: newAppointment.appointmentDate,
        appointmentTime: newAppointment.appointmentTime,
        duration: newAppointment.duration,
        type: newAppointment.type,
        reason: newAppointment.reason,
        notes: newAppointment.notes
      };

      await api.post('/appointments', appointmentData);
      
      setSnackbar({
        open: true,
        message: 'Appointment scheduled successfully',
        severity: 'success'
      });
      
      setScheduleDialogOpen(false);
      
      // Refresh appointments
      fetchAppointments();
    } catch (err) {
      console.error('Error scheduling appointment:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Could not schedule appointment',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (field, value) => {
    setNewAppointment(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
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

    // Date range filtering (if provided)
    let withinRange = true;
    if (startDate) {
      const s = new Date(startDate);
      s.setHours(0,0,0,0);
      withinRange = withinRange && (aptDate >= s);
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23,59,59,999);
      withinRange = withinRange && (aptDate <= e);
    }

    if (tabValue === 0) {
      // Upcoming - scheduled and in future
      return matchesSearch && withinRange && isFuture(aptDate) && apt.status !== 'cancelled';
    } else {
      // Past - completed, cancelled, or past date
      return matchesSearch && withinRange && (isPast(aptDate) || apt.status === 'completed' || apt.status === 'cancelled');
    }
  });

  const upcomingCount = appointments.filter(apt => 
    isFuture(parseISO(apt.appointmentDate)) && apt.status !== 'cancelled'
  ).length;

  const pastCount = appointments.filter(apt =>
    isPast(parseISO(apt.appointmentDate)) || apt.status === 'completed' || apt.status === 'cancelled'
  ).length;

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
      if (trendData[d]) {
        const status = (apt.status || '').toLowerCase();
        if (status === 'scheduled') trendData[d].scheduled += 1;
        else if (status === 'completed') trendData[d].completed += 1;
        else if (status === 'cancelled') trendData[d].cancelled += 1;
      }
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
                    onClick={() => handleViewReport(appointment._id)}
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
        <Button 
          variant="contained" 
          startIcon={<Event />}
          onClick={handleOpenScheduleDialog}
        >
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

      {/* Appointments Trend */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Appointments Trend (Last 30 Days)
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={processAppointmentTrendData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="scheduled" stroke="#2196f3" strokeWidth={2} name="Scheduled" />
            <Line type="monotone" dataKey="completed" stroke="#4caf50" strokeWidth={2} name="Completed" />
            <Line type="monotone" dataKey="cancelled" stroke="#f44336" strokeWidth={2} name="Cancelled" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
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
          </Grid>

          <Grid item xs={6} sm={3} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Start date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>

          <Grid item xs={6} sm={3} md={3}>
            <TextField
              fullWidth
              type="date"
              label="End date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>
        </Grid>
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

      {/* Schedule New Appointment Dialog */}
      <Dialog 
        open={scheduleDialogOpen} 
        onClose={() => !submitting && setScheduleDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Event color="primary" />
            <Typography variant="h6">Schedule New Appointment</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Patient Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Patient Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Patient Name"
                required
                value={newAppointment.patientName}
                onChange={(e) => handleFormChange('patientName', e.target.value)}
                error={!!formErrors.patientName}
                helperText={formErrors.patientName}
                disabled={submitting}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Patient ID (Optional)"
                value={newAppointment.patientId}
                onChange={(e) => handleFormChange('patientId', e.target.value)}
                disabled={submitting}
                helperText="Leave empty to auto-generate"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                required
                value={newAppointment.patientPhone}
                onChange={(e) => handleFormChange('patientPhone', e.target.value)}
                error={!!formErrors.patientPhone}
                helperText={formErrors.patientPhone}
                disabled={submitting}
                placeholder="+1 234-567-8900"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                value={newAppointment.patientEmail}
                onChange={(e) => handleFormChange('patientEmail', e.target.value)}
                error={!!formErrors.patientEmail}
                helperText={formErrors.patientEmail}
                disabled={submitting}
              />
            </Grid>

            {/* Appointment Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
                Appointment Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                required
                value={newAppointment.appointmentDate}
                onChange={(e) => handleFormChange('appointmentDate', e.target.value)}
                error={!!formErrors.appointmentDate}
                helperText={formErrors.appointmentDate}
                disabled={submitting}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                required
                value={newAppointment.appointmentTime}
                onChange={(e) => handleFormChange('appointmentTime', e.target.value)}
                error={!!formErrors.appointmentTime}
                helperText={formErrors.appointmentTime}
                disabled={submitting}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Appointment Type</InputLabel>
                <Select
                  value={newAppointment.type}
                  label="Appointment Type"
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  disabled={submitting}
                >
                  <MenuItem value="In-Person">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOn fontSize="small" />
                      <span>In-Person</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="Video">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <VideoCall fontSize="small" />
                      <span>Video Call</span>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={newAppointment.duration}
                onChange={(e) => handleFormChange('duration', parseInt(e.target.value) || 30)}
                disabled={submitting}
                inputProps={{ min: 15, max: 120, step: 15 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Visit"
                required
                value={newAppointment.reason}
                onChange={(e) => handleFormChange('reason', e.target.value)}
                error={!!formErrors.reason}
                helperText={formErrors.reason}
                disabled={submitting}
                placeholder="e.g., Regular Checkup, Follow-up, etc."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={3}
                value={newAppointment.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                disabled={submitting}
                placeholder="Any additional information..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setScheduleDialogOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleScheduleAppointment}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <Event />}
          >
            {submitting ? 'Scheduling...' : 'Schedule Appointment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog 
        open={reportDialogOpen} 
        onClose={() => setReportDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircle color="success" />
              <Typography variant="h6">Appointment Report & Prescription</Typography>
            </Stack>
            {appointmentReport && (
              <Chip 
                label={appointmentReport.appointmentId} 
                color="primary" 
                size="small"
              />
            )}
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {loadingReport ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
              <CircularProgress />
            </Box>
          ) : appointmentReport ? (
            <Grid container spacing={3}>
              {/* Header Info */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="caption" color="text.secondary">
                        Patient Name
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {appointmentReport.patient.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="caption" color="text.secondary">
                        Appointment Date
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {format(parseISO(appointmentReport.appointmentDate), 'MMM dd, yyyy')} at {appointmentReport.appointmentTime}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="caption" color="text.secondary">
                        Doctor
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {appointmentReport.doctor.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appointmentReport.doctor.specialization}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Diagnosis */}
              {appointmentReport.diagnosis && (
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Diagnosis & Assessment
                  </Typography>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body1">
                      {appointmentReport.diagnosis}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {/* Prescriptions */}
              {appointmentReport.prescriptions && appointmentReport.prescriptions.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Prescriptions
                  </Typography>
                  {appointmentReport.prescriptions.map((prescription, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Medication
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {prescription.medicationName}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Dosage
                          </Typography>
                          <Typography variant="body1">
                            {prescription.dosage}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Frequency
                          </Typography>
                          <Typography variant="body1">
                            {prescription.frequency}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Duration
                          </Typography>
                          <Typography variant="body1">
                            {prescription.duration}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={9}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Instructions
                          </Typography>
                          <Typography variant="body1">
                            {prescription.instructions}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Grid>
              )}

              {/* Lab Reports & Documents */}
              {appointmentReport.reports && appointmentReport.reports.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Lab Reports & Documents
                  </Typography>
                  {appointmentReport.reports.map((report, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {report.fileType.includes('pdf') ? '📄' : '🖼️'}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="body1" fontWeight="bold">
                            {report.fileName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {report.description}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            Uploaded: {format(parseISO(report.uploadedAt), 'MMM dd, yyyy HH:mm')} • 
                            Size: {(report.fileSize / 1024).toFixed(2)} KB
                          </Typography>
                        </Box>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => {
                            setSnackbar({
                              open: true,
                              message: 'File download feature - Coming soon',
                              severity: 'info'
                            });
                          }}
                        >
                          Download
                        </Button>
                      </Stack>
                    </Paper>
                  ))}
                </Grid>
              )}

              {/* Additional Notes */}
              {appointmentReport.notes && (
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Additional Notes
                  </Typography>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body1">
                      {appointmentReport.notes}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {/* No content message */}
              {!appointmentReport.diagnosis && 
               !appointmentReport.prescriptions?.length && 
               !appointmentReport.reports?.length && 
               !appointmentReport.notes && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      No report details available
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      The doctor has not yet uploaded the report for this appointment
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <Typography variant="body1" color="text.secondary">
                No report data available
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setReportDialogOpen(false)}
          >
            Close
          </Button>
          <Button 
            variant="contained"
            disabled={!appointmentReport}
            onClick={() => {
              setSnackbar({
                open: true,
                message: 'Print feature - Coming soon',
                severity: 'info'
              });
            }}
          >
            Print Report
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
