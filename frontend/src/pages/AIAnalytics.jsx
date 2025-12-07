import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  LocalHospital,
  People,
  Speed,
  AttachMoney,
  Lightbulb,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Refresh,
  Assessment,
  AutoAwesome,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../utils/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const AIAnalytics = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [insights, setInsights] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

  useEffect(() => {
    loadAIStatus();
    loadInsights();
  }, []);

  const loadAIStatus = async () => {
    try {
      const response = await api.get('/v1/ai/status');
      setAiStatus(response.data.data);
    } catch (error) {
      console.error('Load AI status error:', error);
    }
  };

  const loadInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/v1/ai/insights');
      setInsights(response.data.data);
    } catch (error) {
      console.error('Load insights error:', error);
      setError('Failed to load AI insights. Using demo data.');
      // Set demo data
      setInsights(getDemoInsights());
    } finally {
      setLoading(false);
    }
  };

  const getDemoInsights = () => ({
    products: {
      topProducts: [
        { name: 'Paracetamol 500mg', count: 156, revenue: 1560 },
        { name: 'Ibuprofen 400mg', count: 98, revenue: 1470 },
        { name: 'Vitamin D3', count: 87, revenue: 2610 },
        { name: 'Amoxicillin', count: 76, revenue: 2280 },
        { name: 'Omeprazole', count: 65, revenue: 1300 }
      ],
      totalOrders: 482,
      growthRate: 23.5,
      insights: [
        'Paracetamol 500mg is the most frequently ordered product with 156 orders.',
        'Product orders are growing at 23.5% monthly - strong growth indicator.'
      ]
    },
    doctors: {
      topSpecializations: [
        { specialization: 'Cardiology', demand: 245, doctorCount: 8, demandPerDoctor: 30.6 },
        { specialization: 'Dermatology', demand: 198, doctorCount: 6, demandPerDoctor: 33.0 },
        { specialization: 'Pediatrics', demand: 176, doctorCount: 7, demandPerDoctor: 25.1 },
        { specialization: 'Orthopedics', demand: 154, doctorCount: 5, demandPerDoctor: 30.8 },
        { specialization: 'General Medicine', demand: 142, doctorCount: 10, demandPerDoctor: 14.2 }
      ],
      insights: [
        'Cardiology is the most in-demand specialization with 245 appointments.',
        'High workload detected: 30.6 appointments per Cardiology doctor.'
      ]
    },
    patients: {
      demographics: {
        ageGroups: { '0-18': 45, '19-35': 156, '36-50': 98, '51-65': 67, '65+': 34 },
        genderDistribution: { male: 189, female: 211, other: 0 },
        totalPatients: 400
      },
      appointmentFrequency: { high: 45, medium: 120, low: 235 },
      topHealthConcerns: [
        { condition: 'Hypertension', count: 89 },
        { condition: 'Diabetes', count: 67 },
        { condition: 'Respiratory Infection', count: 56 },
        { condition: 'General Checkup', count: 54 },
        { condition: 'Skin Allergy', count: 43 }
      ],
      insights: [
        'Primary patient demographic: 19-35 age group (156 patients).',
        'Most common health concern: "Hypertension" (89 cases).'
      ]
    },
    business: {
      revenue: {
        total: 127850,
        fromProducts: 45320,
        fromAppointments: 82530,
        monthly: [
          { month: '2024-09', products: 12400, appointments: 24500, total: 36900 },
          { month: '2024-10', products: 15200, appointments: 27800, total: 43000 },
          { month: '2024-11', products: 17720, appointments: 30230, total: 47950 }
        ]
      },
      metrics: {
        avgOrderValue: '94.02',
        avgAppointmentFee: '165.06',
        totalTransactions: 982,
        healthScore: 78
      },
      insights: [
        'Total platform revenue: $127850.00',
        'Business health score: 78/100',
        'Month-over-month revenue growth: 11.5%'
      ]
    },
    scalability: {
      metrics: {
        userGrowth: [45, 67, 89, 102, 125, 156],
        appointmentLoad: 49.5,
        systemCapacity: 100,
        responseTime: 687,
        errorRate: 1.8
      },
      growthTrend: 24.8,
      bottlenecks: [],
      scalabilityScore: 92,
      insights: [
        'System is operating within normal parameters with no critical bottlenecks.',
        'User base growing at 24.8% - ensure infrastructure can scale.'
      ]
    },
    recommendations: [
      {
        category: 'Products',
        priority: 'high',
        title: 'Optimize Top Product Inventory',
        description: 'Paracetamol 500mg is your most ordered product. Ensure adequate stock levels and consider bundle offers.',
        action: 'Increase inventory and create promotional campaigns',
        impact: 'high'
      },
      {
        category: 'Doctors',
        priority: 'high',
        title: 'High Demand for Cardiology Specialists',
        description: 'Each Cardiology doctor handles 30.6 appointments. Consider recruiting more specialists.',
        action: 'Recruit 2-3 additional Cardiology specialists',
        impact: 'high'
      },
      {
        category: 'Patient Engagement',
        priority: 'medium',
        title: 'Improve Patient Retention',
        description: 'Over 58% of patients have low appointment frequency. Implement retention strategies.',
        action: 'Launch follow-up campaigns, wellness programs, and loyalty rewards',
        impact: 'medium'
      }
    ],
    generatedAt: new Date()
  });

  const getPriorityColor = (priority) => {
    const colors = { critical: 'error', high: 'error', medium: 'warning', low: 'info' };
    return colors[priority] || 'default';
  };

  const getPriorityIcon = (priority) => {
    const icons = { critical: <ErrorIcon />, high: <Warning />, medium: <Warning />, low: <CheckCircle /> };
    return icons[priority] || <CheckCircle />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            AI Analytics & Insights
          </Typography>
          <Typography variant="body1" color="text.secondary">
            AI-powered business intelligence and recommendations
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Chip icon={<AutoAwesome />} label="AI Active" color="success" variant="outlined" />
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadInsights}>
            Refresh
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Key Metrics */}
      {insights && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        ${insights.business?.revenue?.total?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Health: {insights.business?.metrics?.healthScore}/100
                      </Typography>
                    </Box>
                    <AttachMoney sx={{ fontSize: 50, color: 'success.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Product Orders</Typography>
                      <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {insights.products?.totalOrders || 0}
                      </Typography>
                      <Chip label={`+${insights.products?.growthRate || 0}%`} size="small" color="success" sx={{ mt: 0.5 }} />
                    </Box>
                    <ShoppingCart sx={{ fontSize: 50, color: 'primary.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Patients</Typography>
                      <Typography variant="h4" fontWeight="bold" color="info.main">
                        {insights.patients?.demographics?.totalPatients || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">All age groups</Typography>
                    </Box>
                    <People sx={{ fontSize: 50, color: 'info.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">System Health</Typography>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        {insights.scalability?.scalabilityScore || 0}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {insights.scalability?.bottlenecks?.length || 0} issues
                      </Typography>
                    </Box>
                    <Speed sx={{ fontSize: 50, color: 'success.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="scrollable">
              <Tab icon={<Lightbulb />} label="Recommendations" />
              <Tab icon={<ShoppingCart />} label="Products" />
              <Tab icon={<LocalHospital />} label="Doctors" />
              <Tab icon={<People />} label="Patients" />
              <Tab icon={<AttachMoney />} label="Business" />
              <Tab icon={<Speed />} label="Scalability" />
            </Tabs>
          </Paper>

          {/* Tab 0: Recommendations */}
          {tabValue === 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
                AI-Generated Recommendations
              </Typography>
              <List>
                {insights.recommendations?.map((rec, i) => (
                  <ListItem key={i} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 2, flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <ListItemIcon>{getPriorityIcon(rec.priority)}</ListItemIcon>
                      <Box sx={{ flexGrow: 1 }}>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                          <Typography variant="h6">{rec.title}</Typography>
                          <Chip label={rec.category} size="small" color="primary" variant="outlined" />
                          <Chip label={rec.priority.toUpperCase()} size="small" color={getPriorityColor(rec.priority)} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{rec.description}</Typography>
                        <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight="bold">Action: {rec.action}</Typography>
                          <Chip label={`${rec.impact.toUpperCase()} IMPACT`} size="small" color="success" sx={{ mt: 1 }} />
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Tab 1: Products */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Top Products</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={insights.products?.topProducts || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Revenue Distribution</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={insights.products?.topProducts || []} cx="50%" cy="50%" outerRadius={80} dataKey="revenue" label>
                        {insights.products?.topProducts?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Insights</Typography>
                  <List>
                    {insights.products?.insights?.map((ins, i) => (
                      <ListItem key={i}>
                        <ListItemIcon><TrendingUp color="primary" /></ListItemIcon>
                        <ListItemText primary={ins} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Tab 2: Doctors */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Specialization Demand</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={insights.doctors?.topSpecializations || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="specialization" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="demand" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Insights</Typography>
                  <List>
                    {insights.doctors?.insights?.map((ins, i) => (
                      <ListItem key={i}>
                        <ListItemIcon><LocalHospital color="primary" /></ListItemIcon>
                        <ListItemText primary={ins} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Tab 3: Patients */}
          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Age Distribution</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(insights.patients?.demographics?.ageGroups || {}).map(([age, count]) => ({ age, count }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill="#FFBB28" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Top Health Concerns</Typography>
                  <List>
                    {insights.patients?.topHealthConcerns?.map((c, i) => (
                      <ListItem key={i}>
                        <ListItemText primary={c.condition} secondary={`${c.count} cases`} />
                        <Chip label={c.count} color="primary" />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Tab 4: Business */}
          {tabValue === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Revenue Trend</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={insights.business?.revenue?.monthly || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="products" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="appointments" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Tab 5: Scalability */}
          {tabValue === 5 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>User Growth</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={insights.scalability?.metrics?.userGrowth?.map((u, i) => ({ month: `M${i + 1}`, users: u })) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>System Performance</Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Appointment Load" />
                      <Box sx={{ width: '40%', mr: 1 }}>
                        <LinearProgress variant="determinate" value={insights.scalability?.metrics?.appointmentLoad || 0} />
                      </Box>
                      <Typography variant="body2">{insights.scalability?.metrics?.appointmentLoad?.toFixed(1)}%</Typography>
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default AIAnalytics;
