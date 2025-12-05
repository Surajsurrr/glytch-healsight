# 🤖 AI Module Implementation Guide

## Overview

This guide is for the team member implementing AI/ML features in the Glytch Medical Platform.

---

## What's Already Set Up

### ✅ Backend API Endpoints (Ready to Use)

Located in: `backend/src/routes/aiRoutes.js`

```javascript
GET  /api/v1/ai/status      // Check AI service status
POST /api/v1/ai/predict     // Run predictions (Doctor only)
GET  /api/v1/ai/insights    // Get AI insights (Doctor only)
POST /api/v1/ai/train       // Train models (Admin only)
```

### ✅ Frontend UI (Placeholder)

Located in: `frontend/src/pages/AIAnalytics.jsx`

The page includes:
- Dataset upload section
- Model training interface
- Prediction runner
- Implementation guide for your reference

---

## Recommended Architecture

### Option 1: Integrate AI in Express Backend

Add AI logic directly in the existing backend:

```javascript
// backend/src/controllers/aiController.js

const tensorflow = require('@tensorflow/tfjs-node');
const { loadModel, runPrediction } = require('../services/aiService');

exports.predict = async (req, res) => {
  try {
    const { patientData } = req.body;
    
    // Load your trained model
    const model = await loadModel();
    
    // Preprocess data
    const input = preprocessData(patientData);
    
    // Run prediction
    const prediction = await model.predict(input);
    
    // Create audit log
    await createAuditLog({
      userId: req.user._id,
      action: 'AI_PREDICTION',
      resource: 'AI',
      description: 'Ran AI prediction',
      status: 'success'
    });
    
    res.json({
      success: true,
      data: {
        prediction: prediction.dataSync(),
        confidence: 0.95
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};
```

### Option 2: Separate AI Microservice (Recommended for Production)

Create a Python Flask/FastAPI service:

```python
# ai_service/app.py

from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np

app = Flask(__name__)

# Load model at startup
model = tf.keras.models.load_model('models/disease_prediction.h5')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    
    # Preprocess
    input_data = preprocess(data['patient_data'])
    
    # Predict
    prediction = model.predict(input_data)
    
    return jsonify({
        'success': True,
        'prediction': prediction.tolist(),
        'confidence': float(np.max(prediction))
    })

if __name__ == '__main__':
    app.run(port=8000)
```

Then call from Node.js backend:

```javascript
// backend/src/services/aiService.js

const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

exports.runPrediction = async (patientData) => {
  const response = await axios.post(`${AI_SERVICE_URL}/predict`, {
    patient_data: patientData
  });
  return response.data;
};
```

---

## Suggested AI Features to Implement

### 1. Disease Prediction

**Input:** Symptoms, vitals, medical history  
**Output:** Likely diseases with confidence scores

```javascript
POST /api/v1/ai/predict
{
  "type": "disease",
  "data": {
    "symptoms": ["fever", "cough", "fatigue"],
    "vitals": {
      "temperature": 101.5,
      "heartRate": 95,
      "bloodPressure": "130/85"
    },
    "age": 45,
    "medicalHistory": ["diabetes"]
  }
}

// Response
{
  "success": true,
  "data": {
    "predictions": [
      { "disease": "Influenza", "confidence": 0.82 },
      { "disease": "COVID-19", "confidence": 0.65 },
      { "disease": "Common Cold", "confidence": 0.45 }
    ],
    "recommendation": "Consult a doctor immediately"
  }
}
```

### 2. Drug Interaction Checker

**Input:** List of medications  
**Output:** Potential interactions and warnings

```javascript
POST /api/v1/ai/predict
{
  "type": "drug_interaction",
  "data": {
    "medications": [
      "Aspirin 100mg",
      "Warfarin 5mg"
    ]
  }
}

// Response
{
  "success": true,
  "data": {
    "interactions": [
      {
        "severity": "high",
        "drugs": ["Aspirin", "Warfarin"],
        "warning": "Increased bleeding risk",
        "recommendation": "Monitor INR closely"
      }
    ],
    "safeToUse": false
  }
}
```

### 3. Medical Image Analysis

**Input:** X-ray, CT scan image  
**Output:** Detected abnormalities

```javascript
POST /api/v1/ai/predict
{
  "type": "image_analysis",
  "data": {
    "imageUrl": "s3://bucket/patient-123/xray-001.jpg",
    "scanType": "chest_xray"
  }
}

// Response
{
  "success": true,
  "data": {
    "findings": [
      {
        "condition": "Pneumonia",
        "location": "Right Lower Lobe",
        "confidence": 0.87,
        "boundingBox": [120, 200, 350, 420]
      }
    ],
    "normalProbability": 0.13
  }
}
```

### 4. Patient Risk Stratification

**Input:** Patient demographics, vitals, history  
**Output:** Risk scores for various conditions

```javascript
GET /api/v1/ai/insights?patientId=64a1b2c3d4e5f6g7h8i9j0k1

// Response
{
  "success": true,
  "data": {
    "riskScores": {
      "heartDisease": { "score": 0.65, "level": "moderate" },
      "diabetes": { "score": 0.82, "level": "high" },
      "stroke": { "score": 0.35, "level": "low" }
    },
    "recommendations": [
      "Schedule cardiovascular screening",
      "Monitor blood glucose levels",
      "Increase physical activity"
    ]
  }
}
```

---

## Tech Stack Recommendations

### Python (Recommended for ML)

```bash
# Install dependencies
pip install tensorflow
pip install scikit-learn
pip install pandas numpy
pip install flask  # or fastapi
pip install opencv-python  # for image processing
```

### JavaScript/Node.js

```bash
# Install dependencies
npm install @tensorflow/tfjs-node
npm install brain.js  # for simple neural networks
npm install ml-regression  # for regression models
```

---

## Dataset Sources

### Medical Datasets
1. **Kaggle Medical Datasets**
   - Disease symptom prediction
   - Drug reviews and side effects
   - Medical imaging datasets

2. **UCI Machine Learning Repository**
   - Heart disease
   - Diabetes
   - Chronic kidney disease

3. **NIH Chest X-ray Dataset**
   - 100,000+ chest X-ray images

4. **MIMIC-III**
   - ICU patient data (requires approval)

---

## Model Training Example

```python
# train_model.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load dataset
df = pd.read_csv('disease_symptoms.csv')

# Prepare data
X = df.drop('disease', axis=1)
y = df['disease']

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Evaluate
accuracy = model.score(X_test, y_test)
print(f'Accuracy: {accuracy * 100:.2f}%')

# Save
joblib.dump(model, 'models/disease_prediction.pkl')
```

---

## Integration Steps

### 1. Update Backend Controller

```javascript
// backend/src/controllers/aiController.js

const aiService = require('../services/aiService');

exports.predict = async (req, res, next) => {
  try {
    const { type, data } = req.body;
    
    const result = await aiService.runPrediction(type, data);
    
    // Log prediction
    await createAuditLog({
      userId: req.user._id,
      action: 'AI_PREDICTION',
      resource: 'AI',
      description: `Ran ${type} prediction`,
      status: 'success'
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

### 2. Create AI Service

```javascript
// backend/src/services/aiService.js

const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

exports.runPrediction = async (type, data) => {
  const response = await axios.post(
    `${AI_SERVICE_URL}/predict`,
    { type, data },
    { timeout: 30000 }
  );
  return response.data;
};

exports.trainModel = async (datasetPath) => {
  const response = await axios.post(
    `${AI_SERVICE_URL}/train`,
    { dataset: datasetPath }
  );
  return response.data;
};
```

### 3. Update Frontend

```jsx
// frontend/src/services/aiService.js

import api from '../utils/api';

export const runPrediction = async (type, data) => {
  const response = await api.post('/ai/predict', { type, data });
  return response.data;
};

export const getAIInsights = async (patientId) => {
  const response = await api.get(`/ai/insights?patientId=${patientId}`);
  return response.data;
};
```

### 4. Add UI Components

```jsx
// Example: Disease Prediction Form

const [symptoms, setSymptoms] = useState([]);
const [prediction, setPrediction] = useState(null);

const handlePredict = async () => {
  try {
    const result = await runPrediction('disease', {
      symptoms,
      vitals: { ... },
      age: patientAge
    });
    setPrediction(result.data.predictions);
  } catch (error) {
    console.error(error);
  }
};
```

---

## Testing

```javascript
// Test AI prediction endpoint
const testPrediction = async () => {
  const response = await fetch('http://localhost:5000/api/v1/ai/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({
      type: 'disease',
      data: {
        symptoms: ['fever', 'cough'],
        vitals: { temperature: 101 }
      }
    })
  });
  
  const data = await response.json();
  console.log(data);
};
```

---

## Security Considerations

1. **Validate all inputs** before sending to ML model
2. **Rate limit AI endpoints** (computationally expensive)
3. **Log all predictions** for audit trail
4. **Implement model versioning** to track which model made predictions
5. **Add confidence thresholds** - don't show low-confidence predictions
6. **HIPAA compliance** - ensure patient data is de-identified

---

## Environment Variables

Add to `backend/.env`:

```env
# AI Service
AI_SERVICE_URL=http://localhost:8000
AI_MODEL_PATH=./models
AI_CONFIDENCE_THRESHOLD=0.7
AI_ENABLE=true
```

---

## Deployment

### Docker Setup for AI Service

```dockerfile
# Dockerfile.ai

FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "app.py"]
```

---

## Resources

- **TensorFlow.js Docs:** https://www.tensorflow.org/js
- **scikit-learn Docs:** https://scikit-learn.org/
- **Medical AI Papers:** https://paperswithcode.com/task/medical-diagnosis
- **Kaggle Medical Datasets:** https://www.kaggle.com/datasets?search=medical

---

## Questions?

Contact the main development team or open an issue in the repository.

**Good luck with the AI implementation! 🚀**
