import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Event,
  People,
  LocalHospital,
  TrendingUp,
  Person,
  AccessTime,
  VideoCall,
  Assignment,
  Refresh,
  CalendarToday,
} from '@mui/icons-material';
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

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    thisWeekVisits: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load all dashboard data in parallel
      const [statsRes, todayRes, activityRes] = await Promise.all([
        api.get('/dashboard/doctor/stats'),
        api.get('/dashboard/doctor/today'),
        api.get('/dashboard/doctor/activity')
      ]);

      setStats(statsRes.data.data);
      setTodayAppointments(todayRes.data.data || []);
      setRecentActivity(activityRes.data.data || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      // Use mock data as fallback
      setStats({
        todayAppointments: 8,
        pendingAppointments: 3,
        totalPatients: 156,
        thisWeekVisits: 42
      });
      setTodayAppointments([
        { id: 1, patient: 'John Doe', time: '09:00 AM', type: 'consultation', status: 'scheduled', reason: 'Regular checkup' },
        { id: 2, patient: 'Jane Smith', time: '10:30 AM', type: 'follow-up', status: 'confirmed', reason: 'Follow-up visit' },
        { id: 3, patient: 'Mike Johnson', time: '02:00 PM', type: 'emergency', status: 'in-progress', reason: 'Emergency consultation' },
      ]);
      setRecentActivity([
        { id: 1, type: 'visit_completed', title: 'Visit completed', description: 'John Doe - 2 hours ago' },
        { id: 2, type: 'prescription_issued', title: 'Prescription issued', description: 'Jane Smith - 3 hours ago' },
        { id: 3, type: 'new_appointment', title: 'New appointment', description: 'Mike Johnson - 5 hours ago' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'in-progress':
        return 'success';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatAppointmentType = (type) => {
    return type?.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || 'Consultation';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleStartAppointment = (appointmentId) => {
    navigate(`/appointments?highlight=${appointmentId}`);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Doctor Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {getGreeting()}, Dr.! Here's your schedule for today.
          </Typography>
        </Box>
        <Tooltip title="Refresh dashboard">
          <IconButton onClick={handleRefresh} disabled={refreshing}>
            <Refresh 
              sx={{ 
                ...(refreshing && {
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': {
                      transform: 'rotate(0deg)',
                    },
                    '100%': {
                      transform: 'rotate(360deg)',
                    },
                  },
                })
              }} 
            />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            icon={<Event sx={{ fontSize: 40, color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Appointments"
            value={stats.pendingAppointments}
            icon={<AccessTime sx={{ fontSize: 40, color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon={<People sx={{ fontSize: 40, color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Week's Visits"
            value={stats.thisWeekVisits}
            icon={<LocalHospital sx={{ fontSize: 40, color: 'info.main' }} />}
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Today's Appointments
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/appointments')}
              >
                View All
              </Button>
            </Box>

            {todayAppointments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CalendarToday sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No appointments scheduled for today
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/appointments')}
                >
                  View All Appointments
                </Button>
              </Box>
            ) : (
              <List>
                {todayAppointments.map((appointment) => (
                  <ListItem
                    key={appointment.id}
                    sx={{
                      mb: 1,
                      backgroundColor: 'background.default',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={appointment.status}
                          size="small"
                          color={getStatusColor(appointment.status)}
                        />
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleStartAppointment(appointment.id)}
                        >
                          {appointment.status === 'in-progress' ? 'Continue' : 'Start'}
                        </Button>
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {appointment.patient}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.time} • {formatAppointmentType(appointment.type)}
                          </Typography>
                          {appointment.reason && (
                            <Typography variant="caption" color="text.secondary">
                              Reason: {appointment.reason}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                variant="contained" 
                fullWidth 
                startIcon={<Event />}
                onClick={() => navigate('/appointments')}
              >
                View Schedule
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<People />}
                onClick={() => navigate('/patients')}
              >
                Patient List
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<LocalHospital />}
                onClick={() => navigate('/visits')}
              >
                New Visit
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Activity
            </Typography>
            {recentActivity.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No recent activity
              </Typography>
            ) : (
              <List dense>
                {recentActivity.map((activity) => (
                  <ListItem key={activity.id}>
                    <ListItemText
                      primary={activity.title}
                      secondary={activity.description}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DoctorDashboard;
