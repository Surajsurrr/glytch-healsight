# AI Integration Guide for Medical Records Prioritization

## Overview
The Medical Records dashboard is now ready to integrate with your external AI system for intelligent record prioritization based on urgency, clinical needs, and patient conditions.

## Integration Points

### 1. AI Service Endpoint Configuration

The system is ready to call your AI service through the `requestAIPrioritization()` function in `MedicalRecords.jsx`.

**Location:** `frontend/src/pages/MedicalRecords.jsx` (lines ~335-370)

**How to integrate:**
```javascript
const requestAIPrioritization = async () => {
  setAiProcessing(true);
  try {
    // REPLACE THIS with your AI service endpoint
    const aiResponse = await api.post('/ai/prioritize-records', {
      records: records.map(r => ({
        recordId: r.recordId,
        category: r.category,
        recordType: r.recordType,
        title: r.title,
        description: r.description,
        patientAge: r.patient?.age,
        patientGender: r.patient?.gender,
        recordDate: r.recordDate,
        uploadDate: r.uploadDate
      }))
    });
    
    // Store AI response
    const priorityMap = aiResponse.data.priorities;
    setAiPriorityData(priorityMap);
    
  } catch (error) {
    console.error('AI prioritization failed:', error);
  } finally {
    setAiProcessing(false);
  }
};
```

### 2. Expected AI Response Format

Your AI service should return data in this format:

```json
{
  "priorities": {
    "MR001": {
      "recordId": "MR001",
      "priorityScore": 85,
      "urgencyLevel": "high",
      "clinicalRelevance": "high",
      "aiInsights": {
        "summary": "Elevated glucose levels requiring immediate attention",
        "flags": [
          "Abnormal HbA1c",
          "Follow-up required"
        ],
        "recommendations": [
          "Review with patient within 48 hours",
          "Consider medication adjustment",
          "Schedule follow-up appointment"
        ]
      }
    },
    "MR002": {
      "recordId": "MR002",
      "priorityScore": 95,
      "urgencyLevel": "critical",
      "clinicalRelevance": "critical",
      "aiInsights": {
        "summary": "Critical findings requiring immediate intervention",
        "flags": [
          "Critical value",
          "Immediate action required"
        ],
        "recommendations": [
          "Schedule urgent consultation",
          "Adjust treatment plan immediately"
        ]
      }
    }
  }
}
```

### 3. Data Structure Details

#### Priority Score
- **Type:** Number (0-100)
- **Description:** Numerical score indicating urgency
- **100 = Most Urgent, 0 = Least Urgent**

#### Urgency Level
- **Type:** String (enum)
- **Values:** `'critical'` | `'high'` | `'medium'` | `'low'`
- **Usage:** Determines color coding and visual indicators

#### Clinical Relevance
- **Type:** String
- **Description:** Text description of clinical importance
- **Examples:** "high", "immediate attention needed", "routine"

#### AI Insights Object
- **summary:** Brief clinical interpretation (1-2 sentences)
- **flags:** Array of important alerts or warnings
- **recommendations:** Array of actionable next steps for doctors

### 4. Backend API Endpoint

Create a backend endpoint to receive AI requests:

**File:** `backend/src/routes/aiRoutes.js` (create new)

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// AI prioritization endpoint
router.post('/prioritize-records', protect, async (req, res) => {
  try {
    const { records } = req.body;
    
    // TODO: Call your external AI service here
    // const aiResponse = await yourAIService.prioritize(records);
    
    // For now, return empty response
    res.json({ priorities: {} });
    
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

module.exports = router;
```

**Register the route in `backend/src/server.js`:**

```javascript
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);
```

### 5. AI Features in UI

#### Sort Dropdown
Users can select "🤖 AI Smart Priority" from the sort dropdown to enable AI-based sorting.

#### Visual Indicators
- **Alert Banner:** Shows when AI prioritization is active
- **Priority Badges:** Color-coded badges on records (red=critical, orange=high, blue=medium, green=low)
- **Urgency Scores:** Displayed as chips on high-priority records
- **AI Insights Preview:** Shows summary and flags directly on record cards
- **Critical Badge:** Red "!" badge on avatar for critical records

#### Detail View
When viewing a record, AI insights are displayed in a dedicated section showing:
- Priority level and score
- Clinical relevance
- AI-generated summary
- Clinical flags as chips
- Actionable recommendations as a list

### 6. State Management

The following state variables manage AI functionality:

```javascript
const [aiEnabled, setAiEnabled] = useState(true);
const [aiProcessing, setAiProcessing] = useState(false);
const [sortBy, setSortBy] = useState('default');
const [aiPriorityData, setAiPriorityData] = useState(null);
```

- **aiEnabled:** Toggle AI functionality on/off
- **aiProcessing:** Shows loading state during AI processing
- **sortBy:** Current sort method ('ai-priority' activates AI sorting)
- **aiPriorityData:** Stores AI response with priority information

### 7. Integration Steps

1. **Create AI Service Backend**
   - Develop your AI model for analyzing medical records
   - Set up API endpoint to receive record data
   - Return prioritized results in specified format

2. **Update Frontend API Call**
   - Modify `requestAIPrioritization()` function
   - Add your AI service endpoint URL
   - Handle authentication if needed

3. **Test Integration**
   - Enable AI sorting from dropdown
   - Verify records are sorted correctly
   - Check that AI insights display properly
   - Test with various record types

4. **Optional Enhancements**
   - Add AI confidence scores
   - Include reasoning for prioritization
   - Add patient history context
   - Implement real-time updates

### 8. AI Model Considerations

Your AI should consider:

**Clinical Factors:**
- Abnormal test results
- Time-sensitive conditions
- Patient age and risk factors
- Disease severity indicators
- Follow-up requirements

**Administrative Factors:**
- Record age (older records may need review)
- Missing information
- Pending actions
- Related appointments or visits

**Prioritization Logic:**
- Critical/life-threatening conditions = highest priority
- Abnormal lab values requiring intervention = high priority
- Routine follow-ups = medium priority
- Historical/reference records = low priority

### 9. Example AI Request

When a user selects AI sorting, the system sends:

```json
{
  "records": [
    {
      "recordId": "MR001",
      "category": "Laboratory",
      "recordType": "Lab Report",
      "title": "Complete Blood Count (CBC)",
      "description": "Routine blood work for diabetes monitoring",
      "patientAge": 45,
      "patientGender": "Male",
      "recordDate": "2025-12-03T00:00:00.000Z",
      "uploadDate": "2025-12-04T00:00:00.000Z"
    },
    // ... more records
  ]
}
```

### 10. Fallback Behavior

If AI service is unavailable:
- System falls back to sorting by upload date (newest first)
- Warning message displayed to user
- No AI insights shown on records
- Normal functionality continues without interruption

---

## Quick Start Checklist

- [ ] Set up external AI service/model
- [ ] Create backend `/api/ai/prioritize-records` endpoint
- [ ] Update `requestAIPrioritization()` with AI service URL
- [ ] Test with sample medical records
- [ ] Verify AI insights display correctly
- [ ] Test fallback behavior
- [ ] Deploy AI service
- [ ] Configure production endpoints

## Support

The UI is fully prepared and will automatically display AI insights when your service returns data in the expected format. The system gracefully handles missing AI data and provides clear feedback to users.
