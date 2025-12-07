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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Pagination,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Menu,
  MenuItem,
  Tooltip,
  LinearProgress,
  Stack,
  Divider,
} from '@mui/material';
import {
  Search,
  Refresh,
  AutoFixHigh,
  Category,
  CheckCircle,
  Warning,
  FilterList,
  Science,
  LocalHospital,
  Biotech,
  Image as ImageIcon,
  Description,
  Healing,
  Download,
  Visibility,
  Delete,
} from '@mui/icons-material';
import api from '../../utils/api';

const MedicalRecordsManagement = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [filterAnchor, setFilterAnchor] = useState(null);

  useEffect(() => {
    loadRecords();
    loadCategories();
    loadStats();
  }, [page, selectedCategory]);

  const loadRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 20,
        search: searchQuery || undefined,
        aiCategory: selectedCategory !== 'all' ? selectedCategory : undefined
      };
      
      const response = await api.get('/medical-records/admin/records', { params });
      setRecords(response.data.data || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Load records error:', error);
      setError('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/medical-records/admin/records/categories');
      setCategories(response.data.data.categories || []);
      setCategoryCounts(response.data.data.categoryCounts || []);
    } catch (error) {
      console.error('Load categories error:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/medical-records/admin/records/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const handleAutoCategorizeAll = async () => {
    if (!window.confirm('This will automatically categorize all uncategorized records. Continue?')) {
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/medical-records/admin/records/auto-categorize-all');
      setSuccess(response.data.message);
      await loadRecords();
      await loadStats();
      await loadCategories();
    } catch (error) {
      console.error('Auto categorize error:', error);
      setError('Failed to auto-categorize records');
    } finally {
      setProcessing(false);
    }
  };

  const handleCategorizeRecord = async (recordId) => {
    setProcessing(true);
    try {
      await api.post(`/medical-records/admin/records/${recordId}/ai-categorize`);
      setSuccess('Record categorized successfully');
      await loadRecords();
      await loadStats();
    } catch (error) {
      console.error('Categorize record error:', error);
      setError('Failed to categorize record');
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchCategorize = async () => {
    if (selectedRecords.length === 0) {
      setError('Please select records to categorize');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/medical-records/admin/records/batch-categorize', {
        recordIds: selectedRecords
      });
      setSuccess(response.data.message);
      setSelectedRecords([]);
      await loadRecords();
      await loadStats();
    } catch (error) {
      console.error('Batch categorize error:', error);
      setError('Failed to batch categorize records');
    } finally {
      setProcessing(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadRecords();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Blood Test': <Biotech />,
      'Lab Report': <Science />,
      'X-Ray': <ImageIcon />,
      'CT Scan': <ImageIcon />,
      'MRI Scan': <ImageIcon />,
      'Ultrasound': <ImageIcon />,
      'Prescription': <Description />,
      'Surgical Report': <Healing />,
      'Diagnosis Report': <LocalHospital />,
    };
    return iconMap[category] || <Category />;
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Blood Test': 'error',
      'Lab Report': 'primary',
      'X-Ray': 'secondary',
      'CT Scan': 'info',
      'MRI Scan': 'info',
      'Ultrasound': 'success',
      'Prescription': 'warning',
      'Surgical Report': 'error',
      'Diagnosis Report': 'primary',
    };
    return colorMap[category] || 'default';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  const filteredRecords = records.filter((record) =>
    searchQuery === '' ||
    record.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.aiCategory?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Medical Records Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            AI-powered categorization and management
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="AI Categorization"
          />
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              loadRecords();
              loadStats();
              loadCategories();
            }}
          >
            Refresh
          </Button>
        </Stack>
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

      {processing && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            Processing AI categorization...
          </Typography>
        </Box>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Records
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalRecords}
                    </Typography>
                  </Box>
                  <Description sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      AI Categorized
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {stats.categorizedRecords}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stats.categorizationRate}% completion
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Avg Confidence
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {(parseFloat(stats.avgConfidence) * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  <Science sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Uncategorized
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {stats.uncategorizedRecords}
                    </Typography>
                  </Box>
                  <Warning sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Action Buttons */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<AutoFixHigh />}
            onClick={handleAutoCategorizeAll}
            disabled={processing || !aiEnabled}
          >
            Auto-Categorize All
          </Button>
          <Button
            variant="outlined"
            startIcon={<Category />}
            onClick={handleBatchCategorize}
            disabled={processing || selectedRecords.length === 0 || !aiEnabled}
          >
            Categorize Selected ({selectedRecords.length})
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={(e) => setFilterAnchor(e.currentTarget)}
          >
            Filter: {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
          </Button>
        </Stack>
      </Paper>

      {/* Category Filter Menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setSelectedCategory('all');
            setFilterAnchor(null);
            setPage(1);
          }}
          selected={selectedCategory === 'all'}
        >
          All Categories
        </MenuItem>
        <Divider />
        {categoryCounts.map((item) => (
          <MenuItem
            key={item.category}
            onClick={() => {
              setSelectedCategory(item.category);
              setFilterAnchor(null);
              setPage(1);
            }}
            selected={selectedCategory === item.category}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Typography>{item.category}</Typography>
              <Chip label={item.count} size="small" sx={{ ml: 2 }} />
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Search Bar */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by filename, title, category, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <Button size="small" onClick={handleSearch}>
                  Search
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Records Table */}
      <Paper sx={{ p: 3 }}>
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
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRecords(filteredRecords.map(r => r._id));
                          } else {
                            setSelectedRecords([]);
                          }
                        }}
                        checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                      />
                    </TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>File Name</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>AI Category</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Keywords</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography variant="body2" color="text.secondary" py={3}>
                          No medical records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell padding="checkbox">
                          <input
                            type="checkbox"
                            checked={selectedRecords.includes(record._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRecords([...selectedRecords, record._id]);
                              } else {
                                setSelectedRecords(selectedRecords.filter(id => id !== record._id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {record.patientId ? 
                            `${record.patientId.firstName} ${record.patientId.lastName}` : 
                            'N/A'}
                        </TableCell>
                        <TableCell>
                          <Tooltip title={record.fileName}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                              {record.fileName}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{record.title}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getCategoryIcon(record.aiCategory)}
                            label={record.aiCategory || 'Not Categorized'}
                            size="small"
                            color={record.aiCategory ? getCategoryColor(record.aiCategory) : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {record.isAICategorized ? (
                            <Chip
                              label={`${(record.aiCategoryConfidence * 100).toFixed(0)}%`}
                              size="small"
                              color={getConfidenceColor(record.aiCategoryConfidence)}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.aiDetectedKeywords?.length > 0 ? (
                            <Tooltip title={record.aiDetectedKeywords.join(', ')}>
                              <Chip
                                label={`${record.aiDetectedKeywords.length} keywords`}
                                size="small"
                                variant="outlined"
                              />
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(record.recordDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="AI Categorize">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleCategorizeRecord(record._id)}
                              disabled={processing || !aiEnabled}
                            >
                              <AutoFixHigh />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View">
                            <IconButton size="small" color="info">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton size="small" color="success">
                              <Download />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default MedicalRecordsManagement;
