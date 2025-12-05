import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Search,
  Add,
  Person,
  CalendarToday,
  LocalHospital,
  Favorite,
  Thermostat,
  MonitorWeight,
  Height,
  Bloodtype,
  ExpandMore,
  Edit,
  Visibility,
  AccessTime,
  Notes,
  MedicalServices,
  Assignment
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import api from '../utils/api';

const Visits = () => {
  const [tabValue, setTabValue] = useState(0);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [addVisitDialogOpen, setAddVisitDialogOpen] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // New visit form state
  const [newVisit, setNewVisit] = useState({
    patientName: '',
    patientId: '',
    visitDate: '',
    visitType: 'Consultation',
    chiefComplaint: '',
    vitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: '',
      oxygenSaturation: ''
    },
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: ''
  });

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const response = await api.get('/visits');
      
      const visitsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.data || response.data.items || []);

      if (visitsData.length === 0 || typeof visitsData[0] === 'string') {
        setVisits(getMockVisits());
        setUsingMockData(true);
      } else {
        setVisits(visitsData);
        setUsingMockData(false);
      }
    } catch (err) {
      console.error('Error fetching visits:', err);
      setVisits(getMockVisits());
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const getMockVisits = () => {
    const now = new Date();
    return [
      {
        _id: '1',
        visitId: 'VST001',
        patient: {
          name: 'John Doe',
          patientId: 'P001',
          age: 45,
          gender: 'Male'
        },
        visitDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        visitType: 'Follow-up',
        chiefComplaint: 'Diabetes follow-up and blood sugar monitoring',
        vitals: {
          bloodPressure: '130/85',
          heartRate: 78,
          temperature: 98.4,
          weight: 82,
          height: 175,
          oxygenSaturation: 98
        },
        symptoms: ['Fatigue', 'Increased thirst'],
        diagnosis: 'Type 2 Diabetes Mellitus - Well controlled',
        treatment: 'Continue Metformin 500mg twice daily. Increase physical activity.',
        prescriptions: [
          { medication: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
        ],
        notes: 'Patient reports improved energy levels. HbA1c improved to 6.8%.',
        status: 'completed',
        doctor: 'Dr. Rishi Ram'
      },
      {
        _id: '2',
        visitId: 'VST002',
        patient: {
          name: 'Jane Smith',
          patientId: 'P002',
          age: 32,
          gender: 'Female'
        },
        visitDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        visitType: 'Consultation',
        chiefComplaint: 'Persistent cough and fever',
        vitals: {
          bloodPressure: '120/80',
          heartRate: 82,
          temperature: 100.2,
          weight: 65,
          height: 162,
          oxygenSaturation: 97
        },
        symptoms: ['Cough', 'Fever', 'Fatigue'],
        diagnosis: 'Upper Respiratory Tract Infection',
        treatment: 'Prescribed antibiotics and rest. Follow up if symptoms persist.',
        prescriptions: [
          { medication: 'Azithromycin', dosage: '500mg', frequency: 'Once daily for 5 days' },
          { medication: 'Paracetamol', dosage: '650mg', frequency: 'As needed for fever' }
        ],
        notes: 'Advised to drink plenty of fluids and rest.',
        status: 'completed',
        doctor: 'Dr. Rishi Ram'
      },
      {
        _id: '3',
        visitId: 'VST003',
        patient: {
          name: 'Robert Johnson',
          patientId: 'P003',
          age: 58,
          gender: 'Male'
        },
        visitDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        visitType: 'Routine Checkup',
        chiefComplaint: 'Annual physical examination',
        vitals: {
          bloodPressure: '145/90',
          heartRate: 76,
          temperature: 98.6,
          weight: 88,
          height: 178,
          oxygenSaturation: 98
        },
        symptoms: [],
        diagnosis: 'Hypertension - Stage 1, Otherwise healthy',
        treatment: 'Started on Lisinopril. Lifestyle modifications recommended.',
        prescriptions: [
          { medication: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' }
        ],
        notes: 'Recommended dietary changes and regular exercise. Follow up in 3 months.',
        status: 'completed',
        doctor: 'Dr. Rishi Ram'
      },
      {
        _id: '4',
        visitId: 'VST004',
        patient: {
          name: 'Emily Davis',
          patientId: 'P004',
          age: 28,
          gender: 'Female'
        },
        visitDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        visitType: 'Post-Surgery Follow-up',
        chiefComplaint: 'Post-appendectomy follow-up',
        vitals: {
          bloodPressure: '118/75',
          heartRate: 72,
          temperature: 98.2,
          weight: 58,
          height: 165,
          oxygenSaturation: 99
        },
        symptoms: [],
        diagnosis: 'Post-surgical recovery - Excellent progress',
        treatment: 'Wound healing well. No complications noted.',
        prescriptions: [],
        notes: 'Patient recovering well. No signs of infection. Cleared for normal activities.',
        status: 'completed',
        doctor: 'Dr. Rishi Ram'
      }
    ];
  };

  const handleViewDetails = (visit) => {
    setSelectedVisit(visit);
    setDetailsDialogOpen(true);
  };

  const handleAddVisit = () => {
    setNewVisit({
      patientName: '',
      patientId: '',
      visitDate: '',
      visitType: 'Consultation',
      chiefComplaint: '',
      vitals: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: '',
        oxygenSaturation: ''
      },
      symptoms: '',
      diagnosis: '',
      treatment: '',
      notes: ''
    });
    setAddVisitDialogOpen(true);
  };

  const handleSaveVisit = () => {
    const mockVisit = {
      _id: `mock_${Date.now()}`,
      visitId: `VST${String(visits.length + 1).padStart(3, '0')}`,
      patient: {
        name: newVisit.patientName,
        patientId: newVisit.patientId,
        age: 0,
        gender: 'Unknown'
      },
      visitDate: new Date(newVisit.visitDate).toISOString(),
      visitType: newVisit.visitType,
      chiefComplaint: newVisit.chiefComplaint,
      vitals: newVisit.vitals,
      symptoms: newVisit.symptoms.split(',').map(s => s.trim()).filter(s => s),
      diagnosis: newVisit.diagnosis,
      treatment: newVisit.treatment,
      prescriptions: [],
      notes: newVisit.notes,
      status: 'completed',
      doctor: 'Dr. Rishi Ram'
    };

    setVisits(prev => [mockVisit, ...prev]);
    setAddVisitDialogOpen(false);
    setSnackbar({
      open: true,
      message: 'Visit record added successfully',
      severity: 'success'
    });
  };

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = !searchQuery || 
      visit.patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.visitId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase());

    const vDate = new Date(visit.visitDate);

    // Apply date range if provided
    let withinRange = true;
    if (startDate) {
      const s = new Date(startDate);
      s.setHours(0,0,0,0);
      withinRange = withinRange && (vDate >= s);
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23,59,59,999);
      withinRange = withinRange && (vDate <= e);
    }

    return matchesSearch && withinRange;
  });

  const recentVisits = filteredVisits.filter(v => {
    const visitDate = new Date(v.visitDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return visitDate >= thirtyDaysAgo;
  });

  const olderVisits = filteredVisits.filter(v => {
    const visitDate = new Date(v.visitDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return visitDate < thirtyDaysAgo;
  });

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
            Visits & Consultations
          </Typography>
          {usingMockData && (
            <Chip label="Demo Mode" size="small" color="info" variant="outlined" />
          )}
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={handleAddVisit}
        >
          New Visit Record
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <LocalHospital />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {visits.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Visits
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CalendarToday />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {recentVisits.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Recent (30 days)
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {new Set(visits.map(v => v.patient?.patientId)).size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unique Patients
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <MedicalServices />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {visits.filter(v => v.visitType === 'Consultation').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Consultations
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by patient name, visit ID, or diagnosis..."
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
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Recent Visits (${recentVisits.length})`} />
          <Tab label={`History (${olderVisits.length})`} />
        </Tabs>
      </Paper>

      {/* Visit Records */}
      <Box>
        {(tabValue === 0 ? recentVisits : olderVisits).length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No visits found
            </Typography>
          </Paper>
        ) : (
          (tabValue === 0 ? recentVisits : olderVisits).map((visit) => (
            <Card key={visit._id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={3}>
                  {/* Patient Info */}
                  <Grid item xs={12} md={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        {visit.patient?.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {visit.patient?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {visit.patient?.patientId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {visit.patient?.age} yrs • {visit.patient?.gender}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  {/* Visit Details */}
                  <Grid item xs={12} md={5}>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="overline" color="text.secondary">
                          Visit ID: {visit.visitId}
                        </Typography>
                        <Stack direction="row" spacing={2} mt={0.5}>
                          <Chip 
                            label={visit.visitType} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                          <Chip 
                            icon={<CalendarToday />}
                            label={format(parseISO(visit.visitDate), 'MMM dd, yyyy')}
                            size="small"
                          />
                        </Stack>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Chief Complaint
                        </Typography>
                        <Typography variant="body2">
                          {visit.chiefComplaint}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Diagnosis
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {visit.diagnosis}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  {/* Vitals & Actions */}
                  <Grid item xs={12} md={4}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Vital Signs
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              BP
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {visit.vitals?.bloodPressure}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              HR
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {visit.vitals?.heartRate} bpm
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Temp
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {visit.vitals?.temperature}°F
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              SpO2
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {visit.vitals?.oxygenSaturation}%
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>

                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Visibility />}
                        onClick={() => handleViewDetails(visit)}
                      >
                        View Full Details
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Visit Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Visit Details</Typography>
            {selectedVisit && (
              <Chip label={selectedVisit.visitId} color="primary" />
            )}
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedVisit && (
            <Grid container spacing={3}>
              {/* Patient Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Patient Information
                </Typography>
                <Paper sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1" fontWeight="bold">{selectedVisit.patient?.name}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Patient ID</Typography>
                      <Typography variant="body1" fontWeight="bold">{selectedVisit.patient?.patientId}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Age</Typography>
                      <Typography variant="body1">{selectedVisit.patient?.age} years</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Gender</Typography>
                      <Typography variant="body1">{selectedVisit.patient?.gender}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Visit Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Visit Information
                </Typography>
                <Paper sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Visit Date</Typography>
                      <Typography variant="body1">{format(parseISO(selectedVisit.visitDate), 'MMMM dd, yyyy')}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Visit Type</Typography>
                      <Typography variant="body1">{selectedVisit.visitType}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Chief Complaint</Typography>
                      <Typography variant="body1">{selectedVisit.chiefComplaint}</Typography>
                    </Grid>
                    {selectedVisit.symptoms && selectedVisit.symptoms.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Symptoms</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                          {selectedVisit.symptoms.map((symptom, idx) => (
                            <Chip key={idx} label={symptom} size="small" />
                          ))}
                        </Stack>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>

              {/* Vital Signs */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Vital Signs
                </Typography>
                <Paper sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={4}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Favorite color="error" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Blood Pressure</Typography>
                          <Typography variant="body1" fontWeight="bold">{selectedVisit.vitals?.bloodPressure}</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={6} md={4}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Favorite color="error" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Heart Rate</Typography>
                          <Typography variant="body1" fontWeight="bold">{selectedVisit.vitals?.heartRate} bpm</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={6} md={4}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Thermostat color="primary" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Temperature</Typography>
                          <Typography variant="body1" fontWeight="bold">{selectedVisit.vitals?.temperature}°F</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={6} md={4}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <MonitorWeight color="primary" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Weight</Typography>
                          <Typography variant="body1" fontWeight="bold">{selectedVisit.vitals?.weight} kg</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={6} md={4}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Height color="primary" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Height</Typography>
                          <Typography variant="body1" fontWeight="bold">{selectedVisit.vitals?.height} cm</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={6} md={4}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Bloodtype color="error" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">SpO2</Typography>
                          <Typography variant="body1" fontWeight="bold">{selectedVisit.vitals?.oxygenSaturation}%</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Diagnosis & Treatment */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Diagnosis & Treatment
                </Typography>
                <Paper sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Diagnosis</Typography>
                      <Typography variant="body1">{selectedVisit.diagnosis}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Treatment Plan</Typography>
                      <Typography variant="body1">{selectedVisit.treatment}</Typography>
                    </Box>
                    {selectedVisit.prescriptions && selectedVisit.prescriptions.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Prescriptions
                        </Typography>
                        {selectedVisit.prescriptions.map((prescription, idx) => (
                          <Paper key={idx} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {prescription.medication}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {prescription.dosage} - {prescription.frequency}
                            </Typography>
                          </Paper>
                        ))}
                      </Box>
                    )}
                    {selectedVisit.notes && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Additional Notes</Typography>
                        <Typography variant="body1">{selectedVisit.notes}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Visit Dialog */}
      <Dialog
        open={addVisitDialogOpen}
        onClose={() => setAddVisitDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Visit Record</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Patient Name"
                value={newVisit.patientName}
                onChange={(e) => setNewVisit({ ...newVisit, patientName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Patient ID"
                value={newVisit.patientId}
                onChange={(e) => setNewVisit({ ...newVisit, patientId: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Visit Date"
                type="date"
                value={newVisit.visitDate}
                onChange={(e) => setNewVisit({ ...newVisit, visitDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Visit Type"
                value={newVisit.visitType}
                onChange={(e) => setNewVisit({ ...newVisit, visitType: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Routine Checkup">Routine Checkup</option>
                <option value="Emergency">Emergency</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Chief Complaint"
                multiline
                rows={2}
                value={newVisit.chiefComplaint}
                onChange={(e) => setNewVisit({ ...newVisit, chiefComplaint: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary">Vital Signs</Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                fullWidth
                label="Blood Pressure"
                placeholder="120/80"
                value={newVisit.vitals.bloodPressure}
                onChange={(e) => setNewVisit({ 
                  ...newVisit, 
                  vitals: { ...newVisit.vitals, bloodPressure: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                fullWidth
                label="Heart Rate"
                placeholder="72"
                value={newVisit.vitals.heartRate}
                onChange={(e) => setNewVisit({ 
                  ...newVisit, 
                  vitals: { ...newVisit.vitals, heartRate: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                fullWidth
                label="Temperature (°F)"
                placeholder="98.6"
                value={newVisit.vitals.temperature}
                onChange={(e) => setNewVisit({ 
                  ...newVisit, 
                  vitals: { ...newVisit.vitals, temperature: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                fullWidth
                label="Weight (kg)"
                placeholder="70"
                value={newVisit.vitals.weight}
                onChange={(e) => setNewVisit({ 
                  ...newVisit, 
                  vitals: { ...newVisit.vitals, weight: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                fullWidth
                label="Height (cm)"
                placeholder="170"
                value={newVisit.vitals.height}
                onChange={(e) => setNewVisit({ 
                  ...newVisit, 
                  vitals: { ...newVisit.vitals, height: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                fullWidth
                label="SpO2 (%)"
                placeholder="98"
                value={newVisit.vitals.oxygenSaturation}
                onChange={(e) => setNewVisit({ 
                  ...newVisit, 
                  vitals: { ...newVisit.vitals, oxygenSaturation: e.target.value }
                })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Symptoms (comma separated)"
                value={newVisit.symptoms}
                onChange={(e) => setNewVisit({ ...newVisit, symptoms: e.target.value })}
                placeholder="e.g., Cough, Fever, Fatigue"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnosis"
                multiline
                rows={2}
                value={newVisit.diagnosis}
                onChange={(e) => setNewVisit({ ...newVisit, diagnosis: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Treatment Plan"
                multiline
                rows={2}
                value={newVisit.treatment}
                onChange={(e) => setNewVisit({ ...newVisit, treatment: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={2}
                value={newVisit.notes}
                onChange={(e) => setNewVisit({ ...newVisit, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddVisitDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveVisit}>Save Visit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Visits;
