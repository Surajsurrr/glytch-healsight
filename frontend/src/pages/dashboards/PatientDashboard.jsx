import React, { useState, useEffect } from 'react';
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
  Divider,
} from '@mui/material';
import {
  Event,
  Medication,
  Folder,
  LocalHospital,
  CalendarToday,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
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

const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    totalVisits: 0,
    activePrescriptions: 0,
    lastVisit: null,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/dashboard/patient/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const upcomingAppointments = [
    { id: 1, doctor: 'Dr. John Smith', specialty: 'Cardiologist', date: '2025-12-10', time: '10:00 AM', status: 'confirmed' },
    { id: 2, doctor: 'Dr. Sarah Wilson', specialty: 'General Physician', date: '2025-12-15', time: '02:30 PM', status: 'scheduled' },
  ];

  const activePrescriptions = [
    { id: 1, medication: 'Paracetamol 500mg', frequency: 'Twice daily', daysLeft: 5 },
    { id: 2, medication: 'Vitamin D', frequency: 'Once daily', daysLeft: 28 },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's an overview of your health information.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Upcoming Appointments"
            value={stats.upcomingAppointments}
            icon={<Event sx={{ fontSize: 40, color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Visits"
            value={stats.totalVisits}
            icon={<LocalHospital sx={{ fontSize: 40, color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Prescriptions"
            value={stats.activePrescriptions}
            icon={<Medication sx={{ fontSize: 40, color: 'info.main' }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Last Visit
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {stats.lastVisit || 'No visits yet'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Upcoming Appointments
              </Typography>
              <Button variant="outlined" size="small">
                Book New
              </Button>
            </Box>
            <List>
              {upcomingAppointments.map((appointment) => (
                <Box key={appointment.id}>
                  <ListItem
                    sx={{
                      backgroundColor: 'background.default',
                      borderRadius: 1,
                      mb: 2,
                    }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Chip
                          label={appointment.status}
                          size="small"
                          color={appointment.status === 'confirmed' ? 'success' : 'warning'}
                        />
                        <Button variant="text" size="small">
                          View Details
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
                      primary={appointment.doctor}
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {appointment.specialty}
                          </Typography>
                          <br />
                          <Typography variant="body2" component="span" color="text.secondary">
                            {appointment.date} at {appointment.time}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Active Prescriptions
            </Typography>
            <List>
              {activePrescriptions.map((prescription) => (
                <ListItem
                  key={prescription.id}
                  sx={{
                    backgroundColor: 'background.default',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <Medication />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={prescription.medication}
                    secondary={`${prescription.frequency} • ${prescription.daysLeft} days remaining`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="contained" fullWidth startIcon={<CalendarToday />}>
                Book Appointment
              </Button>
              <Button variant="outlined" fullWidth startIcon={<Folder />}>
                Medical Records
              </Button>
              <Button variant="outlined" fullWidth startIcon={<Medication />}>
                Prescriptions
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Health Tips
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="💊 Take medications on time"
                  secondary="Set reminders for your prescriptions"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="🏃 Stay active"
                  secondary="30 minutes of exercise daily"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="💧 Stay hydrated"
                  secondary="Drink 8 glasses of water daily"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientDashboard;
