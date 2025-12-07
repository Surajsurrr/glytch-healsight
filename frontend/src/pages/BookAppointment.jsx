import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import api from '../utils/api';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [form, setForm] = useState({ doctorId: '', date: '', time: '' });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const res = await api.get('/doctors');
      const data = res.data?.data || res.data || [];
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load doctors', err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        doctorId: form.doctorId,
        date: form.date,
        time: form.time,
      };
      const res = await api.post('/appointments', payload);
      setFeedback({ type: 'success', message: 'Appointment request created.' });
      setForm({ doctorId: '', date: '', time: '' });
    } catch (err) {
      console.error('Booking failed', err);
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Booking failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">Book Appointment</Typography>
      <Paper sx={{ p: 3, maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            select
            fullWidth
            label="Select Doctor"
            name="doctorId"
            value={form.doctorId}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
          >
            {loadingDoctors ? (
              <MenuItem value="">Loading...</MenuItem>
            ) : (
              doctors.map((d) => (
                <MenuItem key={d._id || d.id} value={d._id || d.id}>{d.fullName || d.name || d.firstName}</MenuItem>
              ))
            )}
          </TextField>

          <TextField
            fullWidth
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            fullWidth
            label="Time"
            name="time"
            type="time"
            value={form.time}
            onChange={handleChange}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
            required
          />

          {feedback && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button type="submit" variant="contained" startIcon={<CalendarToday />} disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : 'Request Appointment'}
            </Button>
            <Button variant="outlined" onClick={() => setForm({ doctorId: '', date: '', time: '' })}>Reset</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default BookAppointment;
