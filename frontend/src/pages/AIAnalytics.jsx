import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import {
  Psychology,
  CloudUpload,
  ModelTraining,
  QueryStats,
  WarningAmber,
} from '@mui/icons-material';

const AIAnalytics = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        AI Analytics & Insights
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        AI-powered medical analytics and predictive insights
      </Typography>

      <Alert severity="info" icon={<Psychology />} sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          🚧 AI Module Under Development
        </Typography>
        <Typography variant="body2">
          This section is reserved for your team member to integrate AI/ML models and datasets.
          The backend API endpoints are ready at <code>/api/v1/ai/*</code>
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6" fontWeight="bold">
                  Dataset Upload
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Upload and manage training datasets for AI models. Supports CSV, JSON, and medical imaging formats.
              </Typography>
              <Button variant="outlined" fullWidth disabled>
                Upload Dataset
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ModelTraining sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Typography variant="h6" fontWeight="bold">
                  Model Training
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Train and fine-tune AI models for disease prediction, diagnosis assistance, and risk assessment.
              </Typography>
              <Button variant="outlined" fullWidth disabled>
                Train Model
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <QueryStats sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Typography variant="h6" fontWeight="bold">
                  Predictions
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Get AI-powered predictions and insights based on patient data and medical history.
              </Typography>
              <Button variant="outlined" fullWidth disabled>
                Run Prediction
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          📋 Implementation Guide for Your Team
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
          Backend API Endpoints (Already Created):
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li><code>GET /api/v1/ai/status</code> - Check AI service status</li>
          <li><code>POST /api/v1/ai/predict</code> - Run AI predictions</li>
          <li><code>GET /api/v1/ai/insights</code> - Get AI-generated insights</li>
          <li><code>POST /api/v1/ai/train</code> - Train AI models (Admin only)</li>
        </Box>

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
          Suggested AI Features:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>Disease prediction based on symptoms</li>
          <li>Drug interaction checking</li>
          <li>Medical image analysis (X-rays, CT scans)</li>
          <li>Patient risk stratification</li>
          <li>Treatment recommendation systems</li>
          <li>Appointment demand forecasting</li>
        </Box>

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
          Tech Stack Suggestions:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>TensorFlow / PyTorch for model training</li>
          <li>scikit-learn for traditional ML algorithms</li>
          <li>OpenCV for medical image processing</li>
          <li>Pandas/NumPy for data preprocessing</li>
          <li>FastAPI or Flask for AI microservice (optional)</li>
        </Box>

        <Alert severity="warning" icon={<WarningAmber />} sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Note:</strong> Ensure compliance with medical AI regulations (FDA, CE marking) and implement proper validation before production use.
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
};

export default AIAnalytics;
