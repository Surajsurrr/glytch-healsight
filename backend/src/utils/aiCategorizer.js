/**
 * AI-Powered Medical Record Categorization System
 * 
 * This module uses NLP pattern matching and keyword analysis to automatically
 * categorize medical records based on:
 * - Filename patterns
 * - File metadata
 * - Content analysis (when available)
 * - Medical terminology detection
 */

const categories = {
  'Blood Test': {
    keywords: ['blood', 'cbc', 'hemoglobin', 'wbc', 'rbc', 'platelet', 'glucose', 'cholesterol', 'lipid', 'hba1c', 'thyroid', 'tsh', 'hemogram'],
    patterns: [/blood[\s_-]?test/i, /cbc/i, /complete[\s_-]?blood[\s_-]?count/i, /hemoglobin/i, /lipid[\s_-]?profile/i],
    weight: 10
  },
  'Lab Report': {
    keywords: ['lab', 'laboratory', 'test', 'analysis', 'culture', 'urine', 'stool', 'biopsy', 'pathology', 'cytology', 'microbiology'],
    patterns: [/lab[\s_-]?report/i, /laboratory/i, /pathology/i, /test[\s_-]?result/i],
    weight: 8
  },
  'X-Ray': {
    keywords: ['xray', 'x-ray', 'radiograph', 'chest', 'skeletal', 'bone', 'fracture', 'dental'],
    patterns: [/x[\s_-]?ray/i, /radiograph/i, /chest[\s_-]?x/i],
    weight: 10
  },
  'CT Scan': {
    keywords: ['ct', 'computed', 'tomography', 'cat scan', 'contrast'],
    patterns: [/ct[\s_-]?scan/i, /computed[\s_-]?tomography/i, /cat[\s_-]?scan/i],
    weight: 10
  },
  'MRI Scan': {
    keywords: ['mri', 'magnetic', 'resonance', 'brain', 'spine', 'knee', 'shoulder'],
    patterns: [/mri/i, /magnetic[\s_-]?resonance/i],
    weight: 10
  },
  'Ultrasound': {
    keywords: ['ultrasound', 'sonography', 'usg', 'doppler', 'echo', 'prenatal', 'abdomen', 'pelvic'],
    patterns: [/ultra[\s_-]?sound/i, /sonography/i, /usg/i, /doppler/i],
    weight: 10
  },
  'ECG/EKG': {
    keywords: ['ecg', 'ekg', 'electrocardiogram', 'cardiac', 'heart', 'rhythm'],
    patterns: [/ecg/i, /ekg/i, /electro[\s_-]?cardio/i, /cardiac[\s_-]?rhythm/i],
    weight: 10
  },
  'Pathology Report': {
    keywords: ['pathology', 'histopathology', 'cytology', 'tissue', 'specimen', 'microscopic'],
    patterns: [/pathology[\s_-]?report/i, /histopathology/i, /cytology/i],
    weight: 9
  },
  'Biopsy Report': {
    keywords: ['biopsy', 'tissue', 'sample', 'excision', 'needle', 'fnac'],
    patterns: [/biopsy/i, /fnac/i, /fine[\s_-]?needle/i],
    weight: 10
  },
  'Diagnosis Report': {
    keywords: ['diagnosis', 'diagnostic', 'assessment', 'evaluation', 'clinical', 'findings', 'impression'],
    patterns: [/diagnosis/i, /diagnostic[\s_-]?report/i, /clinical[\s_-]?assessment/i],
    weight: 7
  },
  'Prescription': {
    keywords: ['prescription', 'medication', 'drugs', 'pharmacy', 'dosage', 'rx', 'medicine', 'tablet', 'capsule'],
    patterns: [/prescription/i, /rx/i, /medication[\s_-]?list/i, /drug[\s_-]?chart/i],
    weight: 10
  },
  'Surgical Report': {
    keywords: ['surgery', 'surgical', 'operation', 'operative', 'procedure', 'incision', 'suture', 'laparoscopy', 'appendectomy'],
    patterns: [/surgical[\s_-]?report/i, /operative[\s_-]?report/i, /surgery/i, /operation/i],
    weight: 10
  },
  'Discharge Summary': {
    keywords: ['discharge', 'summary', 'hospital', 'admission', 'inpatient', 'released'],
    patterns: [/discharge[\s_-]?summary/i, /discharge[\s_-]?report/i, /hospital[\s_-]?summary/i],
    weight: 10
  },
  'Vaccination Record': {
    keywords: ['vaccination', 'vaccine', 'immunization', 'shot', 'covid', 'flu', 'hepatitis', 'tetanus'],
    patterns: [/vaccination/i, /vaccine/i, /immunization/i, /covid/i],
    weight: 10
  },
  'Allergy Report': {
    keywords: ['allergy', 'allergic', 'reaction', 'sensitivity', 'intolerance', 'anaphylaxis'],
    patterns: [/allergy/i, /allergic/i, /sensitivity[\s_-]?test/i],
    weight: 10
  },
  'Test Report': {
    keywords: ['test', 'screening', 'panel', 'metabolic', 'renal', 'hepatic', 'function'],
    patterns: [/test[\s_-]?report/i, /screening/i, /panel/i],
    weight: 6
  },
  'Scan Report': {
    keywords: ['scan', 'imaging', 'radiology', 'pet', 'dexa'],
    patterns: [/scan[\s_-]?report/i, /imaging[\s_-]?report/i, /radiology/i],
    weight: 7
  },
  'Medical Certificate': {
    keywords: ['certificate', 'fitness', 'medical', 'clearance', 'fit', 'sick', 'leave'],
    patterns: [/medical[\s_-]?certificate/i, /fitness[\s_-]?certificate/i, /sick[\s_-]?leave/i],
    weight: 10
  }
};

/**
 * Categorize a medical record based on filename and metadata
 * @param {Object} recordData - Record data containing fileName, title, description, etc.
 * @returns {Object} - Category result with confidence score and detected keywords
 */
function categorizeMedicalRecord(recordData) {
  const { fileName = '', title = '', description = '', fileType = '' } = recordData;
  
  // Combine all text data for analysis
  const textToAnalyze = `${fileName} ${title} ${description}`.toLowerCase();
  
  const scores = {};
  const detectedKeywords = new Set();
  
  // Score each category
  Object.entries(categories).forEach(([categoryName, categoryData]) => {
    let score = 0;
    
    // Check patterns (higher weight)
    categoryData.patterns.forEach(pattern => {
      if (pattern.test(textToAnalyze)) {
        score += categoryData.weight * 2;
        const match = textToAnalyze.match(pattern);
        if (match) detectedKeywords.add(match[0]);
      }
    });
    
    // Check keywords
    categoryData.keywords.forEach(keyword => {
      if (textToAnalyze.includes(keyword)) {
        score += categoryData.weight;
        detectedKeywords.add(keyword);
      }
    });
    
    scores[categoryName] = score;
  });
  
  // Find the category with highest score
  let bestCategory = 'Other';
  let maxScore = 0;
  
  Object.entries(scores).forEach(([category, score]) => {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  });
  
  // Calculate confidence (normalize to 0-1)
  const totalPossibleScore = Object.values(categories).reduce((sum, cat) => 
    sum + cat.weight * (cat.patterns.length * 2 + cat.keywords.length), 0
  );
  
  const confidence = maxScore > 0 ? Math.min(maxScore / 50, 1) : 0;
  
  // Additional file type based hints
  if (fileType) {
    if (fileType.includes('image') && !bestCategory.includes('Ray') && !bestCategory.includes('Scan')) {
      // Likely an imaging report
      if (confidence < 0.5) {
        bestCategory = 'Scan Report';
      }
    }
  }
  
  return {
    category: bestCategory,
    confidence: parseFloat(confidence.toFixed(2)),
    detectedKeywords: Array.from(detectedKeywords).slice(0, 10),
    allScores: scores,
    isHighConfidence: confidence > 0.6
  };
}

/**
 * Batch categorize multiple records
 * @param {Array} records - Array of record data objects
 * @returns {Array} - Array of categorization results
 */
function batchCategorize(records) {
  return records.map(record => ({
    recordId: record._id || record.recordId,
    ...categorizeMedicalRecord(record)
  }));
}

/**
 * Get category suggestions based on partial input
 * @param {String} input - Partial filename or title
 * @returns {Array} - Suggested categories with confidence
 */
function suggestCategories(input) {
  const result = categorizeMedicalRecord({ fileName: input, title: input });
  
  // Return top 3 suggestions
  const sortedScores = Object.entries(result.allScores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, score]) => ({
      category,
      confidence: parseFloat(Math.min(score / 50, 1).toFixed(2))
    }));
  
  return sortedScores;
}

/**
 * Get all available categories
 * @returns {Array} - List of all category names
 */
function getAllCategories() {
  return Object.keys(categories);
}

module.exports = {
  categorizeMedicalRecord,
  batchCategorize,
  suggestCategories,
  getAllCategories
};
