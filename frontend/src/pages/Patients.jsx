import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Drawer,
  Grid,
  Stack,
  Tooltip,
  Divider,
  Chip,
  CircularProgress,
  Popover,
  InputAdornment
} from '@mui/material';
import { Search, Visibility, Download, Event } from '@mui/icons-material';
import api from '../utils/api';

const mockPatients = [
  {
    _id: '64f1a1c8b5',
    patientId: 'PAT-00001',
    user: { firstName: 'Alice', lastName: 'Morris', email: 'alice@example.com', phone: '555-1234' },
    medicalHistory: {
      chronicConditions: ['Hypertension', 'Type II Diabetes'],
      currentMedications: ['Metformin 500mg', 'Lisinopril 10mg'],
      pastSurgeries: ['Appendectomy (2010)']
    },
    latestVitals: { bloodPressure: '130/82', heartRate: 78, bmi: 27.5, recordedAt: new Date() },
    lastVisitDate: new Date('2025-11-20'),
    status: 'active'
  },
  {
    _id: '64f1a2d9c6',
    patientId: 'PAT-00002',
    user: { firstName: 'Bob', lastName: 'Sharma', email: 'bob@example.com', phone: '555-5678' },
    medicalHistory: {
      chronicConditions: ['Asthma'],
      currentMedications: ['Salbutamol inhaler'],
      pastSurgeries: []
    },
    latestVitals: { bloodPressure: '118/76', heartRate: 72, bmi: 23.1, recordedAt: new Date() },
    lastVisitDate: new Date('2025-10-05'),
    status: 'active'
  }
];

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('');
  const [historyQuery, setHistoryQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const res = await api.get('/patients');
        // Backend placeholder may return message only; detect real data shape
        const data = res.data?.data;
        if (data && Array.isArray(data.items)) {
          if (mounted) setPatients(data.items);
        } else if (data && Array.isArray(data)) {
          if (mounted) setPatients(data);
        } else {
          // fallback to mock data
          if (mounted) setPatients(mockPatients);
        }
      } catch (err) {
        // If API unavailable or returns simple message, use mock
        setPatients(mockPatients);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
    return () => { mounted = false; };
  }, []);

  const diseaseOptions = useMemo(() => {
    const set = new Set();
    patients.forEach(p => (p.medicalHistory?.chronicConditions || []).forEach(c => set.add(c)));
    return Array.from(set).sort();
  }, [patients]);

  const filtered = useMemo(() => {
    let list = patients.slice();

    // global search (name, email, id)
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(p => {
        const name = `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.toLowerCase();
        return name.includes(q) || (p.user?.email || '').toLowerCase().includes(q) || (p.patientId || '').toLowerCase().includes(q);
      });
    }

    // filter by disease
    if (diseaseFilter) {
      const df = diseaseFilter.toLowerCase();
      list = list.filter(p => (p.medicalHistory?.chronicConditions || []).some(c => c.toLowerCase().includes(df)));
    }

    // filter by history text
    if (historyQuery) {
      const hq = historyQuery.toLowerCase();
      list = list.filter(p => {
        const mh = JSON.stringify(p.medicalHistory || {}).toLowerCase();
        return mh.includes(hq);
      });
    }

    // filter by appointment date range (based on lastVisitDate)
    if (dateFrom || dateTo) {
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;
      list = list.filter(p => {
        if (!p.lastVisitDate) return false;
        const lv = new Date(p.lastVisitDate);
        if (from && lv < from) return false;
        if (to) {
          // include entire day for 'to'
          const toEnd = new Date(to);
          toEnd.setHours(23,59,59,999);
          if (lv > toEnd) return false;
        }
        return true;
      });
    }

    return list;
  }, [patients, query, diseaseFilter, historyQuery, dateFrom, dateTo]);

  const openDetails = (p) => { setSelected(p); setDrawerOpen(true); };
  const closeDetails = () => { setDrawerOpen(false); setSelected(null); };

  const handleCalendarClick = (e) => setAnchorEl(e.currentTarget);
  const handleCalendarClose = () => setAnchorEl(null);
  const calendarOpen = Boolean(anchorEl);
  const calendarId = calendarOpen ? 'date-popover' : undefined;

  const exportCSV = () => {
    const rows = filtered.map(p => ({
      patientId: p.patientId,
      name: `${p.user?.firstName || ''} ${p.user?.lastName || ''}`,
      email: p.user?.email || '',
      phone: p.user?.phone || '',
      diseases: (p.medicalHistory?.chronicConditions || []).join('; '),
      medications: (p.medicalHistory?.currentMedications || []).join('; '),
      lastVisit: p.lastVisitDate ? new Date(p.lastVisitDate).toLocaleDateString() : ''
    }));

    const csv = [Object.keys(rows[0] || {}).join(',')]
      .concat(rows.map(r => Object.values(r).map(v => `"${String(v || '').replace(/"/g,'""')}"`).join(',')))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patients.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Patients
      </Typography>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search patients by name, email or ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleCalendarClick} aria-describedby={calendarId}>
                      <Event />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" startIcon={<Download />} onClick={exportCSV}>Export CSV</Button>
            </Stack>
          </Grid>
        </Grid>

        <Popover
          id={calendarId}
          open={calendarOpen}
          anchorEl={anchorEl}
          onClose={handleCalendarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ p: 2, width: 300 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Filter by appointment date</Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <TextField
                  label="From"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="To"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sx={{ mt: 1, textAlign: 'right' }}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" onClick={() => { setDateFrom(''); setDateTo(''); }}>Clear</Button>
                  <Button size="small" variant="contained" onClick={handleCalendarClose}>Apply</Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Popover>

        <TableContainer sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Diseases</TableCell>
                <TableCell>Medications</TableCell>
                <TableCell>Last Visit</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6 }}>No patients found</TableCell>
                </TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p._id || p.patientId} hover>
                  <TableCell>{p.patientId}</TableCell>
                  <TableCell>{`${p.user?.firstName || ''} ${p.user?.lastName || ''}`}</TableCell>
                  <TableCell>{p.user?.email}</TableCell>
                  <TableCell>{(p.medicalHistory?.chronicConditions || []).slice(0,2).join(', ')}{(p.medicalHistory?.chronicConditions || []).length>2 ? '…' : ''}</TableCell>
                  <TableCell>{(p.medicalHistory?.currentMedications || []).slice(0,2).join(', ')}{(p.medicalHistory?.currentMedications || []).length>2 ? '…' : ''}</TableCell>
                  <TableCell>{p.lastVisitDate ? new Date(p.lastVisitDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell><Chip label={p.status || 'active'} size="small" color={p.status==='active'? 'success':'default'} /></TableCell>
                  <TableCell align="right">
                    <Tooltip title="View details">
                      <IconButton onClick={() => openDetails(p)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Drawer anchor="right" open={drawerOpen} onClose={closeDetails} PaperProps={{ sx: { width: { xs: '100%', md: 560 } } }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Patient Details</Typography>
            <Button onClick={closeDetails}>Close</Button>
          </Box>

          {!selected ? (
            <Typography>No patient selected</Typography>
          ) : (
            <Box>
              <Typography variant="subtitle1" gutterBottom>{selected.patientId} — {selected.user?.firstName} {selected.user?.lastName}</Typography>
              <Typography variant="body2" color="text.secondary">Email: {selected.user?.email} • Phone: {selected.user?.phone}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2">Chronic Conditions</Typography>
              { (selected.medicalHistory?.chronicConditions || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">None listed</Typography>
              ) : (
                <Stack spacing={1} sx={{ my: 1 }}>
                  {selected.medicalHistory.chronicConditions.map((c, idx) => <Chip key={idx} label={c} />)}
                </Stack>
              )}

              <Typography variant="subtitle2" sx={{ mt: 2 }}>Medications</Typography>
              { (selected.medicalHistory?.currentMedications || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">None listed</Typography>
              ) : (
                <Stack spacing={1} sx={{ my: 1 }}>
                  {selected.medicalHistory.currentMedications.map((m, idx) => (
                    <Paper key={idx} sx={{ p: 1 }} elevation={0}>{m}</Paper>
                  ))}
                </Stack>
              )}

              <Typography variant="subtitle2" sx={{ mt: 2 }}>Latest Vitals</Typography>
              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid item xs={6}><Typography variant="body2">BP: {selected.latestVitals?.bloodPressure || '—'}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2">HR: {selected.latestVitals?.heartRate || '—'}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2">BMI: {selected.latestVitals?.bmi || '—'}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2">Recorded: {selected.latestVitals?.recordedAt ? new Date(selected.latestVitals.recordedAt).toLocaleString() : '—'}</Typography></Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2">Insurance</Typography>
              {selected.insurance ? (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">{selected.insurance.provider} — {selected.insurance.policyNumber}</Typography>
                  <Typography variant="body2" color="text.secondary">Valid until: {selected.insurance.validUntil ? new Date(selected.insurance.validUntil).toLocaleDateString() : '—'}</Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">No insurance information</Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Button variant="contained" fullWidth onClick={() => { navigator.clipboard?.writeText(window.location.href); }}>
                Copy Profile Link
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default Patients;
