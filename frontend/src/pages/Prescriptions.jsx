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
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import {
  Search,
  Add,
  Medication,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  Print,
  Edit,
  Visibility,
  LocalPharmacy,
  Person,
  CalendarToday,
  AccessTime,
  Description,
  Download
} from '@mui/icons-material';
import { format, parseISO, addDays } from 'date-fns';
import api from '../utils/api';

const Prescriptions = () => {
  const [tabValue, setTabValue] = useState(0);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // New prescription form state
  const [newPrescription, setNewPrescription] = useState({
    patientName: '',
    patientId: '',
    medications: [
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ],
    diagnosis: '',
    validUntil: '',
    notes: ''
  });

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/prescriptions');
      
      const prescriptionsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.data || response.data.items || []);

      if (prescriptionsData.length === 0 || typeof prescriptionsData[0] === 'string') {
        setPrescriptions(getMockPrescriptions());
        setUsingMockData(true);
      } else {
        setPrescriptions(prescriptionsData);
        setUsingMockData(false);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setPrescriptions(getMockPrescriptions());
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const getMockPrescriptions = () => {
    const now = new Date();
    return [
      {
        _id: '1',
        prescriptionId: 'RX001',
        patient: {
          name: 'John Doe',
          patientId: 'P001',
          age: 45,
          gender: 'Male'
        },
        prescribedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        validUntil: addDays(now, 28).toISOString(),
        diagnosis: 'Type 2 Diabetes Mellitus',
        medications: [
          {
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '30 days',
            instructions: 'Take with meals'
          },
          {
            name: 'Glimepiride',
            dosage: '2mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take before breakfast'
          }
        ],
        status: 'active',
        doctor: 'Dr. Rishi Ram',
        notes: 'Monitor blood sugar levels regularly. Follow up in 4 weeks.'
      },
      {
        _id: '2',
        prescriptionId: 'RX002',
        patient: {
          name: 'Jane Smith',
          patientId: 'P002',
          age: 32,
          gender: 'Female'
        },
        prescribedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        validUntil: addDays(now, 25).toISOString(),
        diagnosis: 'Upper Respiratory Tract Infection',
        medications: [
          {
            name: 'Azithromycin',
            dosage: '500mg',
            frequency: 'Once daily',
            duration: '5 days',
            instructions: 'Complete full course'
          },
          {
            name: 'Paracetamol',
            dosage: '650mg',
            frequency: 'As needed',
            duration: '7 days',
            instructions: 'For fever or pain, max 4 times daily'
          }
        ],
        status: 'dispensed',
        doctor: 'Dr. Rishi Ram',
        notes: 'Stay hydrated. Rest recommended.'
      },
      {
        _id: '3',
        prescriptionId: 'RX003',
        patient: {
          name: 'Robert Johnson',
          patientId: 'P003',
          age: 58,
          gender: 'Male'
        },
        prescribedDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        validUntil: addDays(now, 23).toISOString(),
        diagnosis: 'Hypertension - Stage 1',
        medications: [
          {
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take in the morning'
          }
        ],
        status: 'active',
        doctor: 'Dr. Rishi Ram',
        notes: 'Monitor blood pressure daily. Reduce salt intake.'
      },
      {
        _id: '4',
        prescriptionId: 'RX004',
        patient: {
          name: 'Emily Davis',
          patientId: 'P004',
          age: 28,
          gender: 'Female'
        },
        prescribedDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        validUntil: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        diagnosis: 'Vitamin D Deficiency',
        medications: [
          {
            name: 'Vitamin D3',
            dosage: '60000 IU',
            frequency: 'Once weekly',
            duration: '8 weeks',
            instructions: 'Take with food'
          }
        ],
        status: 'expired',
        doctor: 'Dr. Rishi Ram',
        notes: 'Follow up for repeat blood test after 2 months.'
      },
      {
        _id: '5',
        prescriptionId: 'RX005',
        patient: {
          name: 'Michael Brown',
          patientId: 'P005',
          age: 42,
          gender: 'Male'
        },
        prescribedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        validUntil: addDays(now, 29).toISOString(),
        diagnosis: 'Migraine',
        medications: [
          {
            name: 'Sumatriptan',
            dosage: '50mg',
            frequency: 'As needed',
            duration: '30 days',
            instructions: 'For acute migraine attacks, max 2 per day'
          },
          {
            name: 'Propranolol',
            dosage: '40mg',
            frequency: 'Twice daily',
            duration: '30 days',
            instructions: 'For migraine prevention'
          }
        ],
        status: 'active',
        doctor: 'Dr. Rishi Ram',
        notes: 'Keep headache diary. Avoid triggers.'
      },
      {
        _id: '6',
        prescriptionId: 'RX006',
        patient: {
          name: 'Sarah Wilson',
          patientId: 'P006',
          age: 35,
          gender: 'Female'
        },
        prescribedDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        validUntil: addDays(now, 20).toISOString(),
        diagnosis: 'Gastritis',
        medications: [
          {
            name: 'Omeprazole',
            dosage: '20mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take before breakfast'
          }
        ],
        status: 'dispensed',
        doctor: 'Dr. Rishi Ram',
        notes: 'Avoid spicy foods and caffeine.'
      }
    ];
  };

  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setDetailsDialogOpen(true);
  };

  const handleCreatePrescription = () => {
    setNewPrescription({
      patientName: '',
      patientId: '',
      medications: [
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
      ],
      diagnosis: '',
      validUntil: '',
      notes: ''
    });
    setCreateDialogOpen(true);
  };

  const handleAddMedication = () => {
    setNewPrescription({
      ...newPrescription,
      medications: [
        ...newPrescription.medications,
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
      ]
    });
  };

  const handleRemoveMedication = (index) => {
    const updatedMedications = newPrescription.medications.filter((_, i) => i !== index);
    setNewPrescription({ ...newPrescription, medications: updatedMedications });
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...newPrescription.medications];
    updatedMedications[index][field] = value;
    setNewPrescription({ ...newPrescription, medications: updatedMedications });
  };

  const handleSavePrescription = () => {
    const mockPrescription = {
      _id: `mock_${Date.now()}`,
      prescriptionId: `RX${String(prescriptions.length + 1).padStart(3, '0')}`,
      patient: {
        name: newPrescription.patientName,
        patientId: newPrescription.patientId,
        age: 0,
        gender: 'Unknown'
      },
      prescribedDate: new Date().toISOString(),
      validUntil: new Date(newPrescription.validUntil).toISOString(),
      diagnosis: newPrescription.diagnosis,
      medications: newPrescription.medications.filter(m => m.name),
      status: 'active',
      doctor: 'Dr. Rishi Ram',
      notes: newPrescription.notes
    };

    setPrescriptions(prev => [mockPrescription, ...prev]);
    setCreateDialogOpen(false);
    setSnackbar({
      open: true,
      message: 'Prescription created successfully',
      severity: 'success'
    });
  };

  const handleUpdateStatus = (prescriptionId, newStatus) => {
    if (usingMockData) {
      setPrescriptions(prev => 
        prev.map(p => 
          p._id === prescriptionId ? { ...p, status: newStatus } : p
        )
      );
      setSnackbar({
        open: true,
        message: `Prescription marked as ${newStatus}`,
        severity: 'success'
      });
      if (selectedPrescription && selectedPrescription._id === prescriptionId) {
        setSelectedPrescription({ ...selectedPrescription, status: newStatus });
      }
    }
  };

  const handlePrint = (prescription) => {
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'dispensed': return 'info';
      case 'expired': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'dispensed': return <LocalPharmacy />;
      case 'expired': return <HourglassEmpty />;
      case 'cancelled': return <Cancel />;
      default: return <Medication />;
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = !searchQuery || 
      prescription.patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.prescriptionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.medications?.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activePrescriptions = filteredPrescriptions.filter(p => p.status === 'active');
  const dispensedPrescriptions = filteredPrescriptions.filter(p => p.status === 'dispensed');
  const expiredPrescriptions = filteredPrescriptions.filter(p => p.status === 'expired');

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
            Prescriptions
          </Typography>
          {usingMockData && (
            <Chip label="Demo Mode" size="small" color="info" variant="outlined" />
          )}
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={handleCreatePrescription}
        >
          New Prescription
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Medication />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {prescriptions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Prescriptions
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
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {activePrescriptions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active
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
                  <LocalPharmacy />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dispensedPrescriptions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dispensed
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
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <HourglassEmpty />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {expiredPrescriptions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expired
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search by patient, prescription ID, diagnosis, or medication..."
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
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="dispensed">Dispensed</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`All (${filteredPrescriptions.length})`} />
          <Tab label={`Active (${activePrescriptions.length})`} />
          <Tab label={`Dispensed (${dispensedPrescriptions.length})`} />
          <Tab label={`Expired (${expiredPrescriptions.length})`} />
        </Tabs>
      </Paper>

      {/* Prescriptions List */}
      <Box>
        {(() => {
          let displayPrescriptions;
          switch(tabValue) {
            case 1: displayPrescriptions = activePrescriptions; break;
            case 2: displayPrescriptions = dispensedPrescriptions; break;
            case 3: displayPrescriptions = expiredPrescriptions; break;
            default: displayPrescriptions = filteredPrescriptions;
          }

          if (displayPrescriptions.length === 0) {
            return (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No prescriptions found
                </Typography>
              </Paper>
            );
          }

          return displayPrescriptions.map((prescription) => (
            <Card key={prescription._id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={3}>
                  {/* Patient Info */}
                  <Grid item xs={12} md={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        {prescription.patient?.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {prescription.patient?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {prescription.patient?.patientId}
                        </Typography>
                        <Chip 
                          icon={getStatusIcon(prescription.status)}
                          label={prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                          size="small"
                          color={getStatusColor(prescription.status)}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Stack>
                  </Grid>

                  {/* Prescription Details */}
                  <Grid item xs={12} md={5}>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="overline" color="text.secondary">
                          Rx ID: {prescription.prescriptionId}
                        </Typography>
                        <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
                          <Chip 
                            icon={<CalendarToday />}
                            label={format(parseISO(prescription.prescribedDate), 'MMM dd, yyyy')}
                            size="small"
                            variant="outlined"
                          />
                          <Chip 
                            icon={<AccessTime />}
                            label={`Valid until ${format(parseISO(prescription.validUntil), 'MMM dd')}`}
                            size="small"
                            variant="outlined"
                            color={new Date(prescription.validUntil) < new Date() ? 'error' : 'default'}
                          />
                        </Stack>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Diagnosis
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {prescription.diagnosis}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Medications ({prescription.medications?.length})
                        </Typography>
                        <Stack spacing={0.5} mt={0.5}>
                          {prescription.medications?.slice(0, 2).map((med, idx) => (
                            <Typography key={idx} variant="body2">
                              • {med.name} - {med.dosage} ({med.frequency})
                            </Typography>
                          ))}
                          {prescription.medications?.length > 2 && (
                            <Typography variant="caption" color="primary">
                              +{prescription.medications.length - 2} more
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </Grid>

                  {/* Actions */}
                  <Grid item xs={12} md={4}>
                    <Stack spacing={1.5}>
                      <Typography variant="caption" color="text.secondary">
                        Prescribed by {prescription.doctor}
                      </Typography>
                      
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewDetails(prescription)}
                          fullWidth
                        >
                          View Details
                        </Button>
                        <Tooltip title="Print">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handlePrint(prescription)}
                          >
                            <Print />
                          </IconButton>
                        </Tooltip>
                      </Stack>

                      {prescription.status === 'active' && (
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          startIcon={<LocalPharmacy />}
                          onClick={() => handleUpdateStatus(prescription._id, 'dispensed')}
                          fullWidth
                        >
                          Mark as Dispensed
                        </Button>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ));
        })()}
      </Box>

      {/* Prescription Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Prescription Details</Typography>
            {selectedPrescription && (
              <Chip 
                label={selectedPrescription.prescriptionId} 
                color="primary"
              />
            )}
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPrescription && (
            <Grid container spacing={3}>
              {/* Header Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        {selectedPrescription.patient?.name}
                      </Typography>
                      <Typography variant="body2">
                        Patient ID: {selectedPrescription.patient?.patientId}
                      </Typography>
                    </Box>
                    <Chip 
                      icon={getStatusIcon(selectedPrescription.status)}
                      label={selectedPrescription.status.toUpperCase()}
                      color={getStatusColor(selectedPrescription.status)}
                      sx={{ bgcolor: 'white' }}
                    />
                  </Stack>
                </Paper>
              </Grid>

              {/* Prescription Info */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Prescribed Date</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {format(parseISO(selectedPrescription.prescribedDate), 'MMMM dd, yyyy')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Valid Until</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {format(parseISO(selectedPrescription.validUntil), 'MMMM dd, yyyy')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Prescribed By</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedPrescription.doctor}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Diagnosis */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Diagnosis
                </Typography>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body1">
                    {selectedPrescription.diagnosis}
                  </Typography>
                </Paper>
              </Grid>

              {/* Medications Table */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Medications
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Medication</strong></TableCell>
                        <TableCell><strong>Dosage</strong></TableCell>
                        <TableCell><strong>Frequency</strong></TableCell>
                        <TableCell><strong>Duration</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPrescription.medications?.map((med, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {med.name}
                            </Typography>
                            {med.instructions && (
                              <Typography variant="caption" color="text.secondary">
                                {med.instructions}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{med.dosage}</TableCell>
                          <TableCell>{med.frequency}</TableCell>
                          <TableCell>{med.duration}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Notes */}
              {selectedPrescription.notes && (
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Additional Notes
                  </Typography>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2">
                      {selectedPrescription.notes}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedPrescription && selectedPrescription.status === 'active' && (
            <Button 
              color="success"
              startIcon={<LocalPharmacy />}
              onClick={() => {
                handleUpdateStatus(selectedPrescription._id, 'dispensed');
              }}
            >
              Mark as Dispensed
            </Button>
          )}
          <Button startIcon={<Print />} onClick={() => handlePrint(selectedPrescription)}>
            Print
          </Button>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Prescription Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Prescription</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
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
                value={newPrescription.patientName}
                onChange={(e) => setNewPrescription({ ...newPrescription, patientName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Patient ID"
                value={newPrescription.patientId}
                onChange={(e) => setNewPrescription({ ...newPrescription, patientId: e.target.value })}
              />
            </Grid>

            {/* Diagnosis */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnosis"
                multiline
                rows={2}
                value={newPrescription.diagnosis}
                onChange={(e) => setNewPrescription({ ...newPrescription, diagnosis: e.target.value })}
              />
            </Grid>

            {/* Medications */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" color="primary">
                  Medications
                </Typography>
                <Button 
                  size="small" 
                  startIcon={<Add />}
                  onClick={handleAddMedication}
                >
                  Add Medication
                </Button>
              </Box>
            </Grid>

            {newPrescription.medications.map((medication, index) => (
              <Grid item xs={12} key={index}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2">
                      Medication {index + 1}
                    </Typography>
                    {newPrescription.medications.length > 1 && (
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleRemoveMedication(index)}
                      >
                        <Cancel />
                      </IconButton>
                    )}
                  </Stack>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Medication Name"
                        value={medication.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Dosage"
                        placeholder="e.g., 500mg"
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Frequency"
                        placeholder="e.g., Twice daily"
                        value={medication.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Duration"
                        placeholder="e.g., 7 days"
                        value={medication.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Instructions"
                        placeholder="e.g., Take with meals"
                        value={medication.instructions}
                        onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}

            {/* Valid Until */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Valid Until"
                type="date"
                value={newPrescription.validUntil}
                onChange={(e) => setNewPrescription({ ...newPrescription, validUntil: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={2}
                value={newPrescription.notes}
                onChange={(e) => setNewPrescription({ ...newPrescription, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePrescription}>
            Create Prescription
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Prescriptions;
