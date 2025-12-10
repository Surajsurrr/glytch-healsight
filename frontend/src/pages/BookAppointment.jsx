import React, { useState, useEffect, useRef } from 'react';
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
  const [symptoms, setSymptoms] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const geocoderRef = useRef(null);
  const markersRef = useRef([]);
  const [form, setForm] = useState({ doctorId: '', date: '', time: '' });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchDoctors();
    // attempt to load Google Maps script (non-blocking)
    loadGoogleMaps();
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

  const loadGoogleMaps = () => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) return; // not configured
    if (window.google && window.google.maps) {
      geocoderRef.current = new window.google.maps.Geocoder();
      setMapLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.onload = () => {
      geocoderRef.current = new window.google.maps.Geocoder();
      setMapLoaded(true);
      // try to geocode doctors once map is ready
      setTimeout(() => geocodeAllDoctors(), 500);
    };
    document.head.appendChild(script);
  };

  const geocodeAllDoctors = () => {
    if (!geocoderRef.current || !doctors || doctors.length === 0) return;
    // clear previous markers
    markersRef.current.forEach(m => m.setMap && m.setMap(null));
    markersRef.current = [];

    doctors.forEach((d) => {
      const addressParts = [d.address?.street, d.address?.city, d.address?.state, d.address?.country].filter(Boolean).join(', ');
      if (!addressParts) return;
      geocoderRef.current.geocode({ address: addressParts }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location;
          if (!mapRef.current) {
            mapRef.current = new window.google.maps.Map(document.getElementById('doctors-map'), { center: loc, zoom: 12 });
          }
          const marker = new window.google.maps.Marker({ position: loc, map: mapRef.current, title: `${d.firstName} ${d.lastName}` });
          const info = new window.google.maps.InfoWindow({ content: `<div style="min-width:160px"><strong>Dr. ${d.firstName} ${d.lastName}</strong><div>${d.specialization || ''}</div><div>Fee: ${d.consultationFee || 'N/A'}</div><button id='book-${d._id}'>Book</button></div>` });
          marker.addListener('click', () => info.open(mapRef.current, marker));
          // attach click handler when info opened
          window.google.maps.event.addListener(info, 'domready', () => {
            const btn = document.getElementById(`book-${d._id}`);
            if (btn) btn.onclick = () => { setForm({ ...form, doctorId: d._id }); window.scrollTo({ top: 200 }); };
          });
          markersRef.current.push(marker);
        }
      });
    });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSymptomsChange = (e) => setSymptoms(e.target.value);

  const recommendDoctors = () => {
    if (!symptoms.trim()) return setRecommendations([]);
    const text = symptoms.toLowerCase();
    // simple keyword -> specialization mapping
    const map = {
      cardi: ['cardiologist'],
      chest: ['cardiologist'],
      heart: ['cardiologist'],
      diabetes: ['endocrinologist'],
      sugar: ['endocrinologist'],
      skin: ['dermatologist'],
      rash: ['dermatologist'],
      tooth: ['dentist'],
      dental: ['dentist'],
      fever: ['general physician', 'internist'],
      cough: ['pulmonologist', 'general physician'],
      pregnancy: ['obstetrician', 'gynecologist'],
      gyn: ['obstetrician', 'gynecologist'],
      neuro: ['neurologist'],
      brain: ['neurologist'],
      ortho: ['orthopedic', 'orthopedist', 'orthopaedic'],
      bone: ['orthopedic']
    };

    const candidates = new Set();
    Object.keys(map).forEach(k => { if (text.includes(k)) map[k].forEach(s => candidates.add(s)); });

    let matched = doctors;
    if (candidates.size > 0) {
      matched = doctors.filter(d => {
        const spec = (d.specialization || '').toLowerCase();
        for (const c of candidates) if (spec.includes(c)) return true;
        return false;
      });
    }

    // fallback: sort by experience
    matched = matched.sort((a,b) => (b.yearOfExperience || 0) - (a.yearOfExperience || 0));
    setRecommendations(matched.slice(0,6));
    // optionally geocode the subset and show on map
    setTimeout(() => geocodeAllDoctors(), 400);
  };

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
          <TextField label="Describe your problem / symptoms" name="symptoms" value={symptoms} onChange={handleSymptomsChange} fullWidth multiline rows={2} sx={{ mb: 2 }} placeholder="E.g. chest pain, severe headache, skin rash" />
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button variant="outlined" onClick={recommendDoctors}>Recommend Doctor</Button>
            <Button variant="text" onClick={() => { setSymptoms(''); setRecommendations([]); }}>Clear</Button>
          </Box>

          {/* Map and nearby search - shows only when Google Maps API key is set */}
          <Box sx={{ mb: 2 }}>
            <div id="doctors-map" style={{ width: '100%', height: 300, borderRadius: 8, overflow: 'hidden' }}></div>
            {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
              <Typography variant="caption" color="text.secondary">To enable map search, set `VITE_GOOGLE_MAPS_API_KEY` in your environment.</Typography>
            )}
          </Box>
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
