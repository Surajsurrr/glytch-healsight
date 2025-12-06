import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Download,
  Description,
  Refresh,
  Close,
} from '@mui/icons-material';
import api from '../../utils/api';

const DoctorVerification = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState({ open: false, action: '', doctor: null });
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPendingVerifications();
  }, []);

  const loadPendingVerifications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/verifications/pending');
      setPendingDoctors(response.data.data);
    } catch (error) {
      setError('Failed to load pending verifications');
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (doctorId) => {
    try {
      const response = await api.get(`/admin/verifications/${doctorId}`);
      setSelectedDoctor(response.data.data);
      setDetailsDialog(true);
    } catch (error) {
      setError('Failed to load doctor details');
    }
  };

  const handleApprove = async () => {
    try {
      await api.post(`/admin/verifications/${actionDialog.doctor._id}/approve`, {
        notes: notes,
      });
      setSuccess('Doctor approved successfully!');
      setActionDialog({ open: false, action: '', doctor: null });
      setNotes('');
      loadPendingVerifications();
    } catch (error) {
      setError('Failed to approve doctor');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    try {
      await api.post(`/admin/verifications/${actionDialog.doctor._id}/reject`, {
        reason: rejectionReason,
        notes: notes,
      });
      setSuccess('Doctor verification rejected');
      setActionDialog({ open: false, action: '', doctor: null });
      setNotes('');
      setRejectionReason('');
      loadPendingVerifications();
    } catch (error) {
      setError('Failed to reject doctor');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Doctor Verification
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and verify doctor registration requests
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={loadPendingVerifications}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {pendingDoctors.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No pending verifications
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            All doctor registrations have been processed
          </Typography>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Specialization</TableCell>
                  <TableCell>License Number</TableCell>
                  <TableCell>Documents</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingDoctors.map((doctor) => (
                  <TableRow key={doctor._id}>
                    <TableCell>{`Dr. ${doctor.firstName} ${doctor.lastName}`}</TableCell>
                    <TableCell>{doctor.email}</TableCell>
                    <TableCell>{doctor.specialization || 'N/A'}</TableCell>
                    <TableCell>{doctor.licenseNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${doctor.verificationDocuments?.length || 0} files`}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>{formatDate(doctor.createdAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewDetails(doctor._id)}
                        title="View Details"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => setActionDialog({ open: true, action: 'approve', doctor })}
                        title="Approve"
                      >
                        <CheckCircle />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setActionDialog({ open: true, action: 'reject', doctor })}
                        title="Reject"
                      >
                        <Cancel />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Doctor Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Doctor Verification Details
            <IconButton onClick={() => setDetailsDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDoctor && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Personal Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Full Name
                        </Typography>
                        <Typography variant="body1">
                          Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">{selectedDoctor.email}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">{selectedDoctor.phone || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Gender
                        </Typography>
                        <Typography variant="body1">
                          {selectedDoctor.gender || 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Professional Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Specialization
                        </Typography>
                        <Typography variant="body1">
                          {selectedDoctor.specialization || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          License Number
                        </Typography>
                        <Typography variant="body1">
                          {selectedDoctor.licenseNumber || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Medical Council ID
                        </Typography>
                        <Typography variant="body1">
                          {selectedDoctor.medicalCouncilId || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Years of Experience
                        </Typography>
                        <Typography variant="body1">
                          {selectedDoctor.yearOfExperience || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Qualifications
                        </Typography>
                        <Typography variant="body1">
                          {selectedDoctor.qualifications?.join(', ') || 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Uploaded Documents
                    </Typography>
                    {selectedDoctor.verificationDocuments?.length > 0 ? (
                      <List>
                        {selectedDoctor.verificationDocuments.map((doc, index) => (
                          <React.Fragment key={index}>
                            <ListItem
                              secondaryAction={
                                <IconButton edge="end" color="primary">
                                  <Download />
                                </IconButton>
                              }
                            >
                              <Description sx={{ mr: 2, color: 'primary.main' }} />
                              <ListItemText
                                primary={doc.fileName}
                                secondary={`${doc.documentType} - Uploaded ${formatDate(
                                  doc.uploadedAt
                                )}`}
                              />
                            </ListItem>
                            {index < selectedDoctor.verificationDocuments.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No documents uploaded
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          {selectedDoctor && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => {
                  setDetailsDialog(false);
                  setActionDialog({ open: true, action: 'approve', doctor: selectedDoctor });
                }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<Cancel />}
                onClick={() => {
                  setDetailsDialog(false);
                  setActionDialog({ open: true, action: 'reject', doctor: selectedDoctor });
                }}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, action: '', doctor: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.action === 'approve' ? 'Approve Doctor' : 'Reject Doctor'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {actionDialog.action === 'approve'
              ? `Are you sure you want to approve Dr. ${actionDialog.doctor?.firstName} ${actionDialog.doctor?.lastName}?`
              : `Please provide a reason for rejecting Dr. ${actionDialog.doctor?.firstName} ${actionDialog.doctor?.lastName}.`}
          </Typography>

          {actionDialog.action === 'reject' && (
            <TextField
              fullWidth
              label="Rejection Reason *"
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
          )}

          <TextField
            fullWidth
            label="Additional Notes (Optional)"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, action: '', doctor: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionDialog.action === 'approve' ? 'success' : 'error'}
            onClick={actionDialog.action === 'approve' ? handleApprove : handleReject}
          >
            {actionDialog.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorVerification;
