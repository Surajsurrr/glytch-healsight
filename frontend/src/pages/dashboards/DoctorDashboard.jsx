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
} from '@mui/material';
import {
  Event,
  People,
  LocalHospital,
  TrendingUp,
  Person,
  AccessTime,
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
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    thisWeekVisits: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/dashboard/doctor/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const todayAppointments = [
    { id: 1, patient: 'John Doe', time: '09:00 AM', type: 'Consultation', status: 'scheduled' },
    { id: 2, patient: 'Jane Smith', time: '10:30 AM', type: 'Follow-up', status: 'confirmed' },
    { id: 3, patient: 'Mike Johnson', time: '02:00 PM', type: 'Emergency', status: 'in-progress' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'in-progress':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Doctor Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Good morning, Dr.! Here's your schedule for today.
      </Typography>

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
              <Button variant="outlined" size="small">
                View All
              </Button>
            </Box>
            <List>
              {todayAppointments.map((appointment, index) => (
                <ListItem
                  key={appointment.id}
                  sx={{
                    mb: 1,
                    backgroundColor: 'background.default',
                    borderRadius: 1,
                  }}
                  secondaryAction={
                    <Box>
                      <Chip
                        label={appointment.status}
                        size="small"
                        color={getStatusColor(appointment.status)}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        Start
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
                    primary={appointment.patient}
                    secondary={`${appointment.time} • ${appointment.type}`}
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
              <Button variant="contained" fullWidth startIcon={<Event />}>
                View Schedule
              </Button>
              <Button variant="outlined" fullWidth startIcon={<People />}>
                Patient List
              </Button>
              <Button variant="outlined" fullWidth startIcon={<LocalHospital />}>
                New Visit
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Activity
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Visit completed"
                  secondary="John Doe - 2 hours ago"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Prescription issued"
                  secondary="Jane Smith - 3 hours ago"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="New appointment"
                  secondary="Mike Johnson - 5 hours ago"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DoctorDashboard;
