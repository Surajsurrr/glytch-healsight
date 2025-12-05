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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Search,
  Add,
  CloudUpload,
  Folder,
  Description,
  Image,
  PictureAsPdf,
  InsertDriveFile,
  Download,
  Visibility,
  Delete,
  CalendarToday,
  Person,
  LocalHospital,
  Biotech,
  Healing,
  AttachFile,
  FilterList
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import api from '../utils/api';

const MedicalRecords = () => {
  const [tabValue, setTabValue] = useState(0);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // AI Integration states - Ready for external AI service
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [aiPriorityData, setAiPriorityData] = useState(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    patientName: '',
    patientId: '',
    recordType: 'Lab Report',
    category: 'Laboratory',
    title: '',
    description: '',
    recordDate: '',
    fileName: '',
    fileSize: 0,
    fileType: ''
  });

  const categories = [
    { value: 'Laboratory', icon: <Biotech />, color: 'primary' },
    { value: 'Imaging', icon: <Image />, color: 'secondary' },
    { value: 'Prescription', icon: <Description />, color: 'success' },
    { value: 'Consultation', icon: <LocalHospital />, color: 'info' },
    { value: 'Surgery', icon: <Healing />, color: 'error' },
    { value: 'Other', icon: <Folder />, color: 'warning' }
  ];

  useEffect(() => {
    fetchRecords();
  }, []);

  // Effect to trigger AI prioritization when records change
  useEffect(() => {
    if (records.length > 0 && aiEnabled && sortBy === 'ai-priority') {
      requestAIPrioritization();
    }
  }, [records, aiEnabled, sortBy]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medical-records');
      
      const recordsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.data || response.data.items || []);

      if (recordsData.length === 0 || typeof recordsData[0] === 'string') {
        setRecords(getMockRecords());
        setUsingMockData(true);
      } else {
        setRecords(recordsData);
        setUsingMockData(false);
      }
    } catch (err) {
      console.error('Error fetching medical records:', err);
      setRecords(getMockRecords());
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const getMockRecords = () => {
    const now = new Date();
    return [
      {
        _id: '1',
        recordId: 'MR001',
        patient: {
          name: 'John Doe',
          patientId: 'P001',
          age: 45,
          gender: 'Male'
        },
        category: 'Laboratory',
        recordType: 'Lab Report',
        title: 'Complete Blood Count (CBC)',
        description: 'Routine blood work for diabetes monitoring',
        recordDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        uploadDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        fileName: 'CBC_Report_JohnDoe_Dec2025.pdf',
        fileSize: 245000,
        fileType: 'application/pdf',
        uploadedBy: 'Dr. Rishi Ram',
        status: 'available',
        fileUrl: '/mock/cbc-report.pdf'
      },
      {
        _id: '2',
        recordId: 'MR002',
        patient: {
          name: 'John Doe',
          patientId: 'P001',
          age: 45,
          gender: 'Male'
        },
        category: 'Laboratory',
        recordType: 'Lab Report',
        title: 'HbA1c Test',
        description: 'Glycated hemoglobin test for diabetes control',
        recordDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        uploadDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        fileName: 'HbA1c_Report_JohnDoe.pdf',
        fileSize: 180000,
        fileType: 'application/pdf',
        uploadedBy: 'Dr. Rishi Ram',
        status: 'available',
        fileUrl: '/mock/hba1c-report.pdf'
      },
      {
        _id: '3',
        recordId: 'MR003',
        patient: {
          name: 'Jane Smith',
          patientId: 'P002',
          age: 32,
          gender: 'Female'
        },
        category: 'Imaging',
        recordType: 'X-Ray',
        title: 'Chest X-Ray',
        description: 'Chest radiograph for respiratory infection',
        recordDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        uploadDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        fileName: 'Chest_XRay_JaneSmith.jpg',
        fileSize: 3200000,
        fileType: 'image/jpeg',
        uploadedBy: 'Radiology Department',
        status: 'available',
        fileUrl: '/mock/chest-xray.jpg'
      },
      {
        _id: '4',
        recordId: 'MR004',
        patient: {
          name: 'Robert Johnson',
          patientId: 'P003',
          age: 58,
          gender: 'Male'
        },
        category: 'Imaging',
        recordType: 'ECG',
        title: 'Electrocardiogram',
        description: 'ECG for cardiovascular assessment',
        recordDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        uploadDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        fileName: 'ECG_Report_RobertJohnson.pdf',
        fileSize: 425000,
        fileType: 'application/pdf',
        uploadedBy: 'Cardiology Department',
        status: 'available',
        fileUrl: '/mock/ecg-report.pdf'
      },
      {
        _id: '5',
        recordId: 'MR005',
        patient: {
          name: 'Emily Davis',
          patientId: 'P004',
          age: 28,
          gender: 'Female'
        },
        category: 'Surgery',
        recordType: 'Operative Report',
        title: 'Appendectomy Surgical Report',
        description: 'Post-operative surgical documentation',
        recordDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        uploadDate: new Date(now.getTime() - 34 * 24 * 60 * 60 * 1000).toISOString(),
        fileName: 'Appendectomy_Report_EmilyDavis.pdf',
        fileSize: 520000,
        fileType: 'application/pdf',
        uploadedBy: 'Dr. Sarah Wilson',
        status: 'available',
        fileUrl: '/mock/surgery-report.pdf'
      },
      {
        _id: '6',
        recordId: 'MR006',
        patient: {
          name: 'Michael Brown',
          patientId: 'P005',
          age: 42,
          gender: 'Male'
        },
        category: 'Imaging',
        recordType: 'MRI',
        title: 'Brain MRI Scan',
        description: 'MRI scan for migraine investigation',
        recordDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        uploadDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        fileName: 'Brain_MRI_MichaelBrown.dcm',
        fileSize: 8500000,
        fileType: 'application/dicom',
        uploadedBy: 'Radiology Department',
        status: 'available',
        fileUrl: '/mock/brain-mri.dcm'
      },
      {
        _id: '7',
        recordId: 'MR007',
        patient: {
          name: 'Sarah Wilson',
          patientId: 'P006',
          age: 35,
          gender: 'Female'
        },
        category: 'Laboratory',
        recordType: 'Lab Report',
        title: 'Upper GI Endoscopy Report',
        description: 'Endoscopy findings and biopsy results',
        recordDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        uploadDate: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        fileName: 'Endoscopy_Report_SarahWilson.pdf',
        fileSize: 680000,
        fileType: 'application/pdf',
        uploadedBy: 'Dr. Rishi Ram',
        status: 'available',
        fileUrl: '/mock/endoscopy-report.pdf'
      },
      {
        _id: '8',
        recordId: 'MR008',
        patient: {
          name: 'Robert Johnson',
          patientId: 'P003',
          age: 58,
          gender: 'Male'
        },
        category: 'Laboratory',
        recordType: 'Lab Report',
        title: 'Lipid Profile',
        description: 'Cholesterol and triglyceride levels',
        recordDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        uploadDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        fileName: 'Lipid_Profile_RobertJohnson.pdf',
        fileSize: 195000,
        fileType: 'application/pdf',
        uploadedBy: 'Lab Department',
        status: 'available',
        fileUrl: '/mock/lipid-profile.pdf'
      }
    ];
  };

  // ========================================
  // AI INTEGRATION FUNCTIONS - Ready for External AI Service
  // ========================================
  
  /**
   * Request AI prioritization from external AI service
   * This function will be called when you integrate your AI system
   * 
   * Expected AI Response Format:
   * {
   *   recordId: string,
   *   priorityScore: number (0-100),
   *   urgencyLevel: 'critical' | 'high' | 'medium' | 'low',
   *   clinicalRelevance: string,
   *   aiInsights: {
   *     summary: string,
   *     flags: string[],
   *     recommendations: string[]
   *   }
   * }
   */
  const requestAIPrioritization = async () => {
    setAiProcessing(true);
    try {
      // TODO: Replace with your actual AI service endpoint
      // const aiResponse = await api.post('/ai/prioritize-records', {
      //   records: records.map(r => ({
      //     recordId: r.recordId,
      //     category: r.category,
      //     recordType: r.recordType,
      //     title: r.title,
      //     description: r.description,
      //     patientAge: r.patient?.age,
      //     recordDate: r.recordDate
      //   }))
      // });
      
      // For now, this is a placeholder - your AI will populate this
      // const priorityMap = aiResponse.data.priorities;
      // setAiPriorityData(priorityMap);
      
      console.log('AI prioritization requested - awaiting external AI integration');
      
    } catch (error) {
      console.error('AI prioritization failed:', error);
      setSnackbar({
        open: true,
        message: 'AI service unavailable - using default sorting',
        severity: 'warning'
      });
    } finally {
      setAiProcessing(false);
    }
  };

  /**
   * Apply sorting based on selected method
   * When AI is integrated, it will prioritize based on aiPriorityData
   */
  const applySorting = (recordsList) => {
    let sortedRecords = [...recordsList];
    
    switch(sortBy) {
      case 'ai-priority':
        // AI-based sorting - will use external AI service data
        if (aiPriorityData) {
          sortedRecords.sort((a, b) => {
            const aPriority = aiPriorityData[a.recordId]?.priorityScore || 0;
            const bPriority = aiPriorityData[b.recordId]?.priorityScore || 0;
            return bPriority - aPriority;
          });
        } else {
          // Fallback: Sort by upload date when AI data not available
          sortedRecords.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        }
        break;
      
      case 'newest':
        sortedRecords.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        break;
      
      case 'oldest':
        sortedRecords.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
        break;
      
      case 'patient-name':
        sortedRecords.sort((a, b) => 
          (a.patient?.name || '').localeCompare(b.patient?.name || '')
        );
        break;
      
      case 'category':
        sortedRecords.sort((a, b) => 
          (a.category || '').localeCompare(b.category || '')
        );
        break;
      
      default:
        // Default: newest first
        sortedRecords.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    }
    
    return sortedRecords;
  };

  /**
   * Get AI-generated priority data for a specific record
   * Returns priority info if available from external AI
   */
  const getRecordAIPriority = (recordId) => {
    if (!aiPriorityData || !aiPriorityData[recordId]) {
      return null;
    }
    return aiPriorityData[recordId];
  };

  // ========================================
  // END AI INTEGRATION SECTION
  // ========================================

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setViewDialogOpen(true);
  };

  const handleUploadDialog = () => {
    setUploadForm({
      patientName: '',
      patientId: '',
      recordType: 'Lab Report',
      category: 'Laboratory',
      title: '',
      description: '',
      recordDate: '',
      fileName: '',
      fileSize: 0,
      fileType: ''
    });
    setUploadDialogOpen(true);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadForm({
        ...uploadForm,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
    }
  };

  const handleUploadSubmit = () => {
    const mockRecord = {
      _id: `mock_${Date.now()}`,
      recordId: `MR${String(records.length + 1).padStart(3, '0')}`,
      patient: {
        name: uploadForm.patientName,
        patientId: uploadForm.patientId,
        age: 0,
        gender: 'Unknown'
      },
      category: uploadForm.category,
      recordType: uploadForm.recordType,
      title: uploadForm.title,
      description: uploadForm.description,
      recordDate: new Date(uploadForm.recordDate).toISOString(),
      uploadDate: new Date().toISOString(),
      fileName: uploadForm.fileName,
      fileSize: uploadForm.fileSize,
      fileType: uploadForm.fileType,
      uploadedBy: 'Dr. Rishi Ram',
      status: 'available',
      fileUrl: `/mock/${uploadForm.fileName}`
    };

    setRecords(prev => [mockRecord, ...prev]);
    setUploadDialogOpen(false);
    setSnackbar({
      open: true,
      message: 'Medical record uploaded successfully',
      severity: 'success'
    });
  };

  const handleDownload = (record) => {
    // Placeholder for download functionality
    setSnackbar({
      open: true,
      message: `Download initiated for ${record.fileName}`,
      severity: 'info'
    });
  };

  const handleDelete = (recordId) => {
    if (usingMockData) {
      setRecords(prev => prev.filter(r => r._id !== recordId));
      setSnackbar({
        open: true,
        message: 'Record deleted successfully',
        severity: 'success'
      });
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <PictureAsPdf color="error" />;
    if (fileType.includes('image')) return <Image color="primary" />;
    if (fileType.includes('dicom')) return <Image color="secondary" />;
    return <InsertDriveFile />;
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : <Folder />;
  };

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : 'default';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = !searchQuery || 
      record.patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.recordId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.recordType?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || record.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Apply sorting (including AI-based sorting when available)
  const sortedRecords = applySorting(filteredRecords);

  const recordsByCategory = categoryFilter === 'all' 
    ? sortedRecords 
    : sortedRecords.filter(r => r.category === categoryFilter);

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
            Medical Records
          </Typography>
          {usingMockData && (
            <Chip label="Demo Mode" size="small" color="info" variant="outlined" />
          )}
        </Box>
        <Button 
          variant="contained" 
          startIcon={<CloudUpload />}
          onClick={handleUploadDialog}
        >
          Upload Record
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Folder />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {records.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Records
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {categories.slice(0, 3).map((cat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: `${cat.color}.main` }}>
                    {cat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {records.filter(r => r.category === cat.value).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {cat.value}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search by patient name, record ID, title, or type..."
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
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterList />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.value}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="default">📅 Newest First</MenuItem>
              <MenuItem value="oldest">📅 Oldest First</MenuItem>
              <MenuItem value="patient-name">👤 Patient Name</MenuItem>
              <MenuItem value="category">📁 Category</MenuItem>
              <MenuItem value="ai-priority">
                🤖 AI Smart Priority {aiProcessing && '(Processing...)'}
              </MenuItem>
            </TextField>
          </Grid>
        </Grid>
        
        {/* AI Integration Status Banner */}
        {sortBy === 'ai-priority' && (
          <Box mt={2}>
            <Alert 
              severity={aiPriorityData ? "success" : "info"}
              icon={<LocalHospital />}
            >
              {aiPriorityData ? (
                <Typography variant="body2">
                  🤖 AI Prioritization Active - Records sorted by clinical urgency and priority
                </Typography>
              ) : (
                <Typography variant="body2">
                  🤖 AI Prioritization Ready - Waiting for external AI service integration
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    Connect your AI service to enable intelligent record prioritization based on urgency, clinical needs, and patient conditions
                  </Typography>
                </Typography>
              )}
            </Alert>
          </Box>
        )}
      </Paper>

      {/* Category Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={`All (${records.length})`} 
              icon={<Folder />} 
              iconPosition="start"
            />
            {categories.map((cat, idx) => (
              <Tab 
                key={idx}
                label={`${cat.value} (${records.filter(r => r.category === cat.value).length})`}
                icon={cat.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>
      </Paper>

      {/* Records List */}
      <Box>
        {(() => {
          let displayRecords;
          if (tabValue === 0) {
            displayRecords = sortedRecords;
          } else {
            const selectedCategory = categories[tabValue - 1].value;
            displayRecords = sortedRecords.filter(r => r.category === selectedCategory);
          }

          if (displayRecords.length === 0) {
            return (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No medical records found
                </Typography>
              </Paper>
            );
          }

          return (
            <Grid container spacing={2}>
              {displayRecords.map((record) => {
                // Get AI priority data for this record (if available from external AI)
                const aiPriority = getRecordAIPriority(record.recordId);
                
                return (
                <Grid item xs={12} key={record._id}>
                  <Card>
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        {/* AI Priority Indicator - Shows when external AI provides data */}
                        {aiPriority && sortBy === 'ai-priority' && (
                          <Grid item xs={12}>
                            <Alert 
                              severity={
                                aiPriority.urgencyLevel === 'critical' ? 'error' :
                                aiPriority.urgencyLevel === 'high' ? 'warning' : 'info'
                              }
                              variant="outlined"
                              sx={{ py: 0.5 }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Typography variant="caption" fontWeight="bold">
                                  🤖 AI Priority: {aiPriority.urgencyLevel.toUpperCase()}
                                </Typography>
                                <Chip 
                                  label={`Score: ${aiPriority.priorityScore}/100`}
                                  size="small"
                                  color={
                                    aiPriority.urgencyLevel === 'critical' ? 'error' :
                                    aiPriority.urgencyLevel === 'high' ? 'warning' : 'info'
                                  }
                                />
                                {aiPriority.clinicalRelevance && (
                                  <Chip 
                                    label={aiPriority.clinicalRelevance}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Stack>
                            </Alert>
                          </Grid>
                        )}

                        {/* File Icon */}
                        <Grid item xs="auto">
                          <Badge
                            badgeContent={aiPriority?.urgencyLevel === 'critical' ? '!' : null}
                            color="error"
                          >
                            <Avatar sx={{ width: 56, height: 56, bgcolor: 'grey.200' }}>
                              {getFileIcon(record.fileType)}
                            </Avatar>
                          </Badge>
                        </Grid>

                        {/* Record Details */}
                        <Grid item xs={12} sm>
                          <Stack spacing={0.5}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="h6" fontWeight="bold">
                                {record.title}
                              </Typography>
                              <Chip 
                                icon={getCategoryIcon(record.category)}
                                label={record.category}
                                size="small"
                                color={getCategoryColor(record.category)}
                              />
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary">
                              {record.description}
                            </Typography>

                            <Stack direction="row" spacing={2} flexWrap="wrap" mt={1}>
                              <Chip 
                                icon={<Person />}
                                label={record.patient?.name}
                                size="small"
                                variant="outlined"
                              />
                              <Chip 
                                label={`ID: ${record.patient?.patientId}`}
                                size="small"
                                variant="outlined"
                              />
                              <Chip 
                                icon={<CalendarToday />}
                                label={format(parseISO(record.recordDate), 'MMM dd, yyyy')}
                                size="small"
                                variant="outlined"
                              />
                              <Chip 
                                label={record.recordType}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Stack>

                            <Stack direction="row" spacing={2} mt={1}>
                              <Typography variant="caption" color="text.secondary">
                                File: {record.fileName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Size: {formatFileSize(record.fileSize)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Uploaded by: {record.uploadedBy}
                              </Typography>
                            </Stack>

                            {/* AI Insights Preview - Shows when external AI provides insights */}
                            {aiPriority?.aiInsights && sortBy === 'ai-priority' && (
                              <Box mt={1} p={1.5} bgcolor="grey.50" borderRadius={1} border="1px solid" borderColor="grey.200">
                                <Typography variant="caption" color="primary" fontWeight="bold" display="block" mb={0.5}>
                                  🤖 AI Clinical Insights:
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary" mb={0.5}>
                                  {aiPriority.aiInsights.summary}
                                </Typography>
                                {aiPriority.aiInsights.flags && aiPriority.aiInsights.flags.length > 0 && (
                                  <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
                                    {aiPriority.aiInsights.flags.slice(0, 3).map((flag, idx) => (
                                      <Chip 
                                        key={idx}
                                        label={flag}
                                        size="small"
                                        variant="outlined"
                                        color="warning"
                                        sx={{ height: 20, fontSize: '0.65rem', mb: 0.5 }}
                                      />
                                    ))}
                                  </Stack>
                                )}
                              </Box>
                            )}
                          </Stack>
                        </Grid>

                        {/* Actions */}
                        <Grid item xs={12} sm="auto">
                          <Stack direction="row" spacing={1}>
                            <Tooltip title={aiPriority ? "View Details & AI Insights" : "View Details"}>
                              <IconButton 
                                color="primary"
                                onClick={() => handleViewRecord(record)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download">
                              <IconButton 
                                color="success"
                                onClick={() => handleDownload(record)}
                              >
                                <Download />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton 
                                color="error"
                                onClick={() => handleDelete(record._id)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )})}
            </Grid>
          );
        })()}
      </Box>

      {/* View Record Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Medical Record Details</Typography>
            {selectedRecord && (
              <Chip label={selectedRecord.recordId} color="primary" />
            )}
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRecord && (
            <Grid container spacing={3}>
              {/* Patient Information */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        {selectedRecord.patient?.name}
                      </Typography>
                      <Typography variant="body2">
                        Patient ID: {selectedRecord.patient?.patientId}
                      </Typography>
                    </Box>
                    <Chip 
                      icon={getCategoryIcon(selectedRecord.category)}
                      label={selectedRecord.category}
                      sx={{ bgcolor: 'white' }}
                      color={getCategoryColor(selectedRecord.category)}
                    />
                  </Stack>
                </Paper>
              </Grid>

              {/* Record Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Record Information
                </Typography>
                <Paper sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Title</Typography>
                      <Typography variant="body1" fontWeight="bold">{selectedRecord.title}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Record Type</Typography>
                      <Typography variant="body1" fontWeight="bold">{selectedRecord.recordType}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Record Date</Typography>
                      <Typography variant="body1">{format(parseISO(selectedRecord.recordDate), 'MMMM dd, yyyy')}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Upload Date</Typography>
                      <Typography variant="body1">{format(parseISO(selectedRecord.uploadDate), 'MMMM dd, yyyy')}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Description</Typography>
                      <Typography variant="body1">{selectedRecord.description}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Uploaded By</Typography>
                      <Typography variant="body1">{selectedRecord.uploadedBy}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* AI Insights Section - Shows when external AI provides data */}
              {(() => {
                const aiPriority = getRecordAIPriority(selectedRecord.recordId);
                if (!aiPriority) return null;
                
                return (
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      🤖 AI Clinical Insights
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                      <Stack spacing={2}>
                        <Box>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip 
                              label={`${aiPriority.urgencyLevel?.toUpperCase()} Priority`}
                              color={
                                aiPriority.urgencyLevel === 'critical' ? 'error' :
                                aiPriority.urgencyLevel === 'high' ? 'warning' : 'info'
                              }
                            />
                            <Chip 
                              label={`Priority Score: ${aiPriority.priorityScore}/100`}
                              variant="outlined"
                            />
                            {aiPriority.clinicalRelevance && (
                              <Chip 
                                label={`Clinical Relevance: ${aiPriority.clinicalRelevance}`}
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Box>

                        {aiPriority.aiInsights?.summary && (
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">AI Summary</Typography>
                            <Typography variant="body1">
                              {aiPriority.aiInsights.summary}
                            </Typography>
                          </Box>
                        )}

                        {aiPriority.aiInsights?.flags && aiPriority.aiInsights.flags.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Clinical Flags
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {aiPriority.aiInsights.flags.map((flag, idx) => (
                                <Chip 
                                  key={idx}
                                  label={flag}
                                  color="warning"
                                  variant="outlined"
                                  size="small"
                                  sx={{ mb: 1 }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}

                        {aiPriority.aiInsights?.recommendations && aiPriority.aiInsights.recommendations.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              AI Recommendations
                            </Typography>
                            <List dense>
                              {aiPriority.aiInsights.recommendations.map((rec, idx) => (
                                <ListItem key={idx} sx={{ pl: 0 }}>
                                  <Typography variant="body2">
                                    • {rec}
                                  </Typography>
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  </Grid>
                );
              })()}

              {/* File Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  File Information
                </Typography>
                <Paper sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ width: 64, height: 64, bgcolor: 'grey.200' }}>
                      {getFileIcon(selectedRecord.fileType)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedRecord.fileName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Type: {selectedRecord.fileType}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Size: {formatFileSize(selectedRecord.fileSize)}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      onClick={() => handleDownload(selectedRecord)}
                    >
                      Download
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Upload Record Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload Medical Record</DialogTitle>
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
                value={uploadForm.patientName}
                onChange={(e) => setUploadForm({ ...uploadForm, patientName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Patient ID"
                value={uploadForm.patientId}
                onChange={(e) => setUploadForm({ ...uploadForm, patientId: e.target.value })}
              />
            </Grid>

            {/* Record Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
                Record Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.value}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Record Type"
                value={uploadForm.recordType}
                onChange={(e) => setUploadForm({ ...uploadForm, recordType: e.target.value })}
                placeholder="e.g., Lab Report, X-Ray, MRI"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                placeholder="e.g., Complete Blood Count"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Brief description of the medical record"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Record Date"
                type="date"
                value={uploadForm.recordDate}
                onChange={(e) => setUploadForm({ ...uploadForm, recordDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* File Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
                File Upload
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  p: 3, 
                  border: '2px dashed', 
                  borderColor: 'primary.main',
                  bgcolor: 'grey.50',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="file"
                  id="file-upload"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.dicom"
                />
                <label htmlFor="file-upload" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
                  <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Click to upload file
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supported formats: PDF, JPG, PNG, DICOM
                  </Typography>
                  {uploadForm.fileName && (
                    <Box mt={2}>
                      <Chip 
                        icon={<AttachFile />}
                        label={`${uploadForm.fileName} (${formatFileSize(uploadForm.fileSize)})`}
                        color="success"
                      />
                    </Box>
                  )}
                </label>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUploadSubmit}
            disabled={!uploadForm.fileName || !uploadForm.patientName || !uploadForm.title}
          >
            Upload Record
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      {snackbar.open && (
        <Alert 
          severity={snackbar.severity}
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  );
};

export default MedicalRecords;
