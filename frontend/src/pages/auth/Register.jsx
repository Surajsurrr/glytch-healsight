import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Grid,
  MenuItem,
} from '@mui/material';
import { Visibility, VisibilityOff, LocalHospital } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    specialization: '',
    licenseNumber: '',
    yearOfExperience: '',
  });
  const [doctorDocuments, setDoctorDocuments] = useState({
    qualificationCertificate: null,
    specializationCertificate: null,
    experienceProof: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setDoctorDocuments({
        ...doctorDocuments,
        [name]: files[0],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.role === 'doctor' && (!formData.specialization || !formData.licenseNumber)) {
      setError('Specialization and License Number are required for doctors');
      return;
    }

    if (formData.role === 'doctor' && (!doctorDocuments.qualificationCertificate || !doctorDocuments.specializationCertificate || !doctorDocuments.experienceProof)) {
      setError('Please upload all required documents (Qualification Certificate, Specialization Certificate, and Experience Proof)');
      return;
    }

    setLoading(true);

    try {
      // Remove confirmPassword and filter out empty optional fields
      const { confirmPassword, ...dataToSend } = formData;
      
      // For doctors, prepare FormData to include file uploads
      if (formData.role === 'doctor') {
        const formDataToSend = new FormData();
        
        // Append text fields
        Object.keys(dataToSend).forEach(key => {
          if (dataToSend[key] !== '' && dataToSend[key] !== null && dataToSend[key] !== undefined) {
            formDataToSend.append(key, dataToSend[key]);
          }
        });
        
        // Append documents with metadata
        const documents = [];
        if (doctorDocuments.qualificationCertificate) {
          documents.push({
            documentType: 'degree',
            fileName: doctorDocuments.qualificationCertificate.name,
            fileUrl: 'pending-upload' // This will be handled by backend
          });
          formDataToSend.append('qualificationCertificate', doctorDocuments.qualificationCertificate);
        }
        if (doctorDocuments.specializationCertificate) {
          documents.push({
            documentType: 'specialization',
            fileName: doctorDocuments.specializationCertificate.name,
            fileUrl: 'pending-upload'
          });
          formDataToSend.append('specializationCertificate', doctorDocuments.specializationCertificate);
        }
        if (doctorDocuments.experienceProof) {
          documents.push({
            documentType: 'experience',
            fileName: doctorDocuments.experienceProof.name,
            fileUrl: 'pending-upload'
          });
          formDataToSend.append('experienceProof', doctorDocuments.experienceProof);
        }
        
        formDataToSend.append('verificationDocuments', JSON.stringify(documents));
        
        await register(formDataToSend, true); // Pass true to indicate multipart form data
      } else {
        // Remove empty strings to avoid validation errors
        Object.keys(dataToSend).forEach(key => {
          if (dataToSend[key] === '' || dataToSend[key] === null || dataToSend[key] === undefined) {
            delete dataToSend[key];
          }
        });
        
        await register(dataToSend);
      }
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Paper elevation={6} sx={{ p: 4, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <LocalHospital sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join Glytch Medical Platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <MenuItem value="patient">Patient</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>

              {formData.role === 'doctor' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="e.g., Cardiologist, Neurologist"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="License Number"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Years of Experience"
                      name="yearOfExperience"
                      type="number"
                      value={formData.yearOfExperience}
                      onChange={handleChange}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Required Documents for Verification
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      {doctorDocuments.qualificationCertificate ? '✓ Qualification Cert' : 'Upload Qualification *'}
                      <input
                        type="file"
                        name="qualificationCertificate"
                        hidden
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                    </Button>
                    {doctorDocuments.qualificationCertificate && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {doctorDocuments.qualificationCertificate.name}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      {doctorDocuments.specializationCertificate ? '✓ Specialization Cert' : 'Upload Specialization *'}
                      <input
                        type="file"
                        name="specializationCertificate"
                        hidden
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                    </Button>
                    {doctorDocuments.specializationCertificate && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {doctorDocuments.specializationCertificate.name}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      {doctorDocuments.experienceProof ? '✓ Experience Proof' : 'Upload Experience *'}
                      <input
                        type="file"
                        name="experienceProof"
                        hidden
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                    </Button>
                    {doctorDocuments.experienceProof && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {doctorDocuments.experienceProof.name}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Your account will be pending verification until an admin reviews your documents.
                    </Alert>
                  </Grid>
                </>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
