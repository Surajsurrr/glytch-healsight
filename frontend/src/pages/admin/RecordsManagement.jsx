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
  Alert,
  CircularProgress,
  Pagination,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Refresh, Search, Download, Visibility } from '@mui/icons-material';
import api from '../../utils/api';

const RecordsManagement = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRecords();
  }, [page]);

  const loadRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/admin/medical-records?page=${page}&limit=15`);
      setRecords(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      setError('Failed to load medical records');
      console.error('Load records error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRecordTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'lab report':
        return 'info';
      case 'imaging':
        return 'warning';
      case 'prescription':
        return 'success';
      case 'discharge summary':
        return 'primary';
      default:
        return 'default';
    }
  };

  const filteredRecords = records.filter((record) => {
    const searchString = `${record.patientId?.firstName} ${record.patientId?.lastName} ${record.recordType} ${record.fileName}`;
    return searchString.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Medical Records Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all medical records
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={loadRecords}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          placeholder="Search records by patient, type, or filename..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Record Type</TableCell>
                    <TableCell>File Name</TableCell>
                    <TableCell>Upload Date</TableCell>
                    <TableCell>Uploaded By</TableCell>
                    <TableCell>File Size</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" py={3}>
                          No medical records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell>
                          {record.patientId
                            ? `${record.patientId.firstName} ${record.patientId.lastName}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={record.recordType}
                            size="small"
                            color={getRecordTypeColor(record.recordType)}
                          />
                        </TableCell>
                        <TableCell>{record.fileName}</TableCell>
                        <TableCell>{formatDate(record.uploadDate)}</TableCell>
                        <TableCell>
                          {record.uploadedBy
                            ? `${record.uploadedBy.firstName} ${record.uploadedBy.lastName}`
                            : 'System'}
                        </TableCell>
                        <TableCell>
                          {record.fileSize ? `${(record.fileSize / 1024).toFixed(2)} KB` : 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="primary" title="View">
                            <Visibility />
                          </IconButton>
                          <IconButton size="small" color="success" title="Download">
                            <Download />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default RecordsManagement;
