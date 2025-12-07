const MedicalRecord = require('../models/MedicalRecord');
const { 
  categorizeMedicalRecord, 
  batchCategorize, 
  suggestCategories,
  getAllCategories 
} = require('../utils/aiCategorizer');

/**
 * @desc    Get all medical records with AI categorization
 * @route   GET /api/admin/medical-records
 * @access  Private/Admin
 */
exports.getAllMedicalRecords = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      category, 
      aiCategory,
      search,
      sortBy = '-createdAt'
    } = req.query;
    
    const query = { status: 'active' };
    
    // Filter by AI category
    if (aiCategory && aiCategory !== 'all') {
      query.aiCategory = aiCategory;
    }
    
    // Filter by legacy type
    if (category && category !== 'all') {
      query.type = category;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { aiDetectedKeywords: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const records = await MedicalRecord.find(query)
      .populate('patientId', 'firstName lastName email')
      .populate('uploadedBy', 'firstName lastName')
      .populate('doctorId', 'firstName lastName specialization')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await MedicalRecord.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: records.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: records
    });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical records',
      error: error.message
    });
  }
};

/**
 * @desc    AI categorize a single medical record
 * @route   POST /api/admin/medical-records/:id/ai-categorize
 * @access  Private/Admin
 */
exports.aiCategorizeRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    // Run AI categorization
    const aiResult = categorizeMedicalRecord({
      fileName: record.fileName,
      title: record.title,
      description: record.description,
      fileType: record.mimeType
    });
    
    // Update record with AI results
    record.aiCategory = aiResult.category;
    record.aiCategoryConfidence = aiResult.confidence;
    record.aiDetectedKeywords = aiResult.detectedKeywords;
    record.isAICategorized = true;
    
    // Only override manual categorization if confidence is high
    if (!record.manualCategoryOverride && aiResult.isHighConfidence) {
      record.type = mapAICategoryToType(aiResult.category);
    }
    
    await record.save();
    
    res.status(200).json({
      success: true,
      message: 'Record categorized successfully',
      data: {
        record,
        aiResult
      }
    });
  } catch (error) {
    console.error('AI categorize error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to categorize record',
      error: error.message
    });
  }
};

/**
 * @desc    Batch AI categorize multiple records
 * @route   POST /api/admin/medical-records/batch-categorize
 * @access  Private/Admin
 */
exports.batchAICategorize = async (req, res) => {
  try {
    const { recordIds } = req.body;
    
    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of record IDs'
      });
    }
    
    const records = await MedicalRecord.find({
      _id: { $in: recordIds },
      status: 'active'
    });
    
    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No records found'
      });
    }
    
    // Batch categorize
    const results = batchCategorize(records.map(r => ({
      _id: r._id,
      fileName: r.fileName,
      title: r.title,
      description: r.description,
      fileType: r.mimeType
    })));
    
    // Update all records
    const updatePromises = records.map(async (record, index) => {
      const aiResult = results[index];
      
      record.aiCategory = aiResult.category;
      record.aiCategoryConfidence = aiResult.confidence;
      record.aiDetectedKeywords = aiResult.detectedKeywords;
      record.isAICategorized = true;
      
      if (!record.manualCategoryOverride && aiResult.isHighConfidence) {
        record.type = mapAICategoryToType(aiResult.category);
      }
      
      return record.save();
    });
    
    await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: `Successfully categorized ${records.length} records`,
      data: {
        categorized: records.length,
        results
      }
    });
  } catch (error) {
    console.error('Batch categorize error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to batch categorize records',
      error: error.message
    });
  }
};

/**
 * @desc    Auto-categorize all uncategorized records
 * @route   POST /api/admin/medical-records/auto-categorize-all
 * @access  Private/Admin
 */
exports.autoCategorizeAll = async (req, res) => {
  try {
    const { force = false } = req.body;
    
    // Find records that need categorization
    const query = force 
      ? { status: 'active' }
      : { status: 'active', $or: [{ isAICategorized: false }, { isAICategorized: { $exists: false } }] };
    
    const records = await MedicalRecord.find(query).limit(1000);
    
    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All records are already categorized',
        data: { categorized: 0 }
      });
    }
    
    // Batch categorize
    const results = batchCategorize(records.map(r => ({
      _id: r._id,
      fileName: r.fileName,
      title: r.title,
      description: r.description,
      fileType: r.mimeType
    })));
    
    // Update all records
    let successCount = 0;
    const updatePromises = records.map(async (record, index) => {
      try {
        const aiResult = results[index];
        
        record.aiCategory = aiResult.category;
        record.aiCategoryConfidence = aiResult.confidence;
        record.aiDetectedKeywords = aiResult.detectedKeywords;
        record.isAICategorized = true;
        
        if (!record.manualCategoryOverride && aiResult.isHighConfidence) {
          record.type = mapAICategoryToType(aiResult.category);
        }
        
        await record.save();
        successCount++;
      } catch (err) {
        console.error(`Failed to update record ${record._id}:`, err);
      }
    });
    
    await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: `Auto-categorized ${successCount} records`,
      data: {
        processed: records.length,
        categorized: successCount,
        results: results.slice(0, 10) // Return first 10 for preview
      }
    });
  } catch (error) {
    console.error('Auto categorize all error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to auto-categorize records',
      error: error.message
    });
  }
};

/**
 * @desc    Get category suggestions for a text input
 * @route   POST /api/admin/medical-records/suggest-category
 * @access  Private/Admin
 */
exports.suggestCategory = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide text for categorization'
      });
    }
    
    const suggestions = suggestCategories(text);
    
    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Suggest category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suggest category',
      error: error.message
    });
  }
};

/**
 * @desc    Get all available AI categories
 * @route   GET /api/admin/medical-records/categories
 * @access  Private/Admin
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = getAllCategories();
    
    // Get count for each category
    const categoryCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await MedicalRecord.countDocuments({ 
          aiCategory: category,
          status: 'active'
        });
        return { category, count };
      })
    );
    
    res.status(200).json({
      success: true,
      data: {
        categories,
        categoryCounts
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

/**
 * @desc    Get AI categorization statistics
 * @route   GET /api/admin/medical-records/stats
 * @access  Private/Admin
 */
exports.getAIStats = async (req, res) => {
  try {
    const totalRecords = await MedicalRecord.countDocuments({ status: 'active' });
    const categorizedRecords = await MedicalRecord.countDocuments({ 
      status: 'active',
      isAICategorized: true 
    });
    const highConfidenceRecords = await MedicalRecord.countDocuments({ 
      status: 'active',
      aiCategoryConfidence: { $gte: 0.7 }
    });
    const manualOverrides = await MedicalRecord.countDocuments({
      status: 'active',
      manualCategoryOverride: true
    });
    
    // Category distribution
    const categoryDistribution = await MedicalRecord.aggregate([
      { $match: { status: 'active', isAICategorized: true } },
      { $group: { _id: '$aiCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Average confidence
    const avgConfidenceResult = await MedicalRecord.aggregate([
      { $match: { status: 'active', isAICategorized: true } },
      { $group: { _id: null, avgConfidence: { $avg: '$aiCategoryConfidence' } } }
    ]);
    
    const avgConfidence = avgConfidenceResult.length > 0 
      ? avgConfidenceResult[0].avgConfidence.toFixed(2) 
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalRecords,
        categorizedRecords,
        uncategorizedRecords: totalRecords - categorizedRecords,
        highConfidenceRecords,
        manualOverrides,
        categorizationRate: totalRecords > 0 
          ? ((categorizedRecords / totalRecords) * 100).toFixed(1) 
          : 0,
        avgConfidence,
        categoryDistribution
      }
    });
  } catch (error) {
    console.error('Get AI stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI statistics',
      error: error.message
    });
  }
};

/**
 * Helper function to map AI category to legacy type enum
 */
function mapAICategoryToType(aiCategory) {
  const mapping = {
    'Blood Test': 'lab_result',
    'Lab Report': 'lab_result',
    'Test Report': 'lab_result',
    'X-Ray': 'xray',
    'CT Scan': 'ct_scan',
    'MRI Scan': 'mri',
    'Ultrasound': 'ultrasound',
    'Scan Report': 'ct_scan',
    'Prescription': 'prescription',
    'Surgical Report': 'report',
    'Diagnosis Report': 'report',
    'Discharge Summary': 'report',
    'Pathology Report': 'lab_result',
    'Biopsy Report': 'lab_result'
  };
  
  return mapping[aiCategory] || 'other';
}

module.exports = exports;
