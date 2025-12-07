const AIAnalyticsEngine = require('../utils/aiAnalyticsEngine');
const Order = require('../models/Order');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Visit = require('../models/Visit');
const Product = require('../models/Product');

/**
 * @desc    Get comprehensive AI analytics and insights
 * @route   GET /api/v1/ai/insights
 * @access  Private/Admin
 */
exports.getComprehensiveInsights = async (req, res) => {
  try {
    // Fetch all necessary data
    const [orders, appointments, patients, doctors, visits, products] = await Promise.all([
      Order.find().populate('items.product').sort('-createdAt').limit(1000),
      Appointment.find().populate('doctor patient').sort('-createdAt').limit(2000),
      Patient.find().limit(5000),
      User.find({ role: 'doctor' }).limit(500),
      Visit.find().sort('-createdAt').limit(1000),
      Product.find()
    ]);
    
    // Run all analytics
    const productAnalytics = await AIAnalyticsEngine.analyzeProductTrends(orders);
    const doctorAnalytics = await AIAnalyticsEngine.analyzeDoctorSpecializations(appointments, doctors);
    const patientAnalytics = await AIAnalyticsEngine.analyzePatientBehavior(patients, appointments, visits);
    const businessAnalytics = await AIAnalyticsEngine.analyzeBusinessFeasibility(orders, appointments, products);
    
    // Calculate system metrics
    const systemMetrics = {
      userGrowth: await calculateUserGrowth(),
      appointmentLoad: (appointments.length / 1000) * 100,
      systemCapacity: 100,
      avgResponseTime: Math.random() * 1000 + 500, // Placeholder
      errorRate: Math.random() * 3 // Placeholder
    };
    
    const scalabilityAnalytics = await AIAnalyticsEngine.analyzeScalability(systemMetrics);
    
    // Combine all analytics
    const allAnalytics = {
      products: productAnalytics,
      doctors: doctorAnalytics,
      patients: patientAnalytics,
      business: businessAnalytics,
      scalability: scalabilityAnalytics
    };
    
    // Generate AI recommendations
    const recommendations = AIAnalyticsEngine.generateRecommendations(allAnalytics);
    
    res.status(200).json({
      success: true,
      data: {
        ...allAnalytics,
        recommendations,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI insights',
      error: error.message
    });
  }
};

/**
 * @desc    Get product analytics
 * @route   GET /api/v1/ai/products
 * @access  Private/Admin
 */
exports.getProductAnalytics = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product').sort('-createdAt').limit(1000);
    const analytics = await AIAnalyticsEngine.analyzeProductTrends(orders);
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze product data',
      error: error.message
    });
  }
};

/**
 * @desc    Get doctor analytics
 * @route   GET /api/v1/ai/doctors
 * @access  Private/Admin
 */
exports.getDoctorAnalytics = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('doctor patient').limit(2000);
    const doctors = await User.find({ role: 'doctor' });
    const analytics = await AIAnalyticsEngine.analyzeDoctorSpecializations(appointments, doctors);
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Doctor analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze doctor data',
      error: error.message
    });
  }
};

/**
 * @desc    Get patient behavior analytics
 * @route   GET /api/v1/ai/patients
 * @access  Private/Admin
 */
exports.getPatientAnalytics = async (req, res) => {
  try {
    const [patients, appointments, visits] = await Promise.all([
      Patient.find().limit(5000),
      Appointment.find().populate('patient').limit(2000),
      Visit.find().limit(1000)
    ]);
    
    const analytics = await AIAnalyticsEngine.analyzePatientBehavior(patients, appointments, visits);
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Patient analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze patient data',
      error: error.message
    });
  }
};

/**
 * @desc    Get scalability analysis
 * @route   GET /api/v1/ai/scalability
 * @access  Private/Admin
 */
exports.getScalabilityAnalysis = async (req, res) => {
  try {
    const systemMetrics = {
      userGrowth: await calculateUserGrowth(),
      appointmentLoad: await calculateAppointmentLoad(),
      systemCapacity: 100,
      avgResponseTime: await calculateAvgResponseTime(),
      errorRate: await calculateErrorRate()
    };
    
    const analytics = await AIAnalyticsEngine.analyzeScalability(systemMetrics);
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Scalability analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze scalability',
      error: error.message
    });
  }
};

/**
 * @desc    Get business feasibility analysis
 * @route   GET /api/v1/ai/business
 * @access  Private/Admin
 */
exports.getBusinessAnalysis = async (req, res) => {
  try {
    const [orders, appointments, products] = await Promise.all([
      Order.find().sort('-createdAt').limit(1000),
      Appointment.find().limit(2000),
      Product.find()
    ]);
    
    const analytics = await AIAnalyticsEngine.analyzeBusinessFeasibility(orders, appointments, products);
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Business analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze business data',
      error: error.message
    });
  }
};

/**
 * @desc    Get AI recommendations
 * @route   GET /api/v1/ai/recommendations
 * @access  Private/Admin
 */
exports.getRecommendations = async (req, res) => {
  try {
    // Fetch all analytics data
    const [orders, appointments, patients, doctors, visits] = await Promise.all([
      Order.find().populate('items.product').limit(1000),
      Appointment.find().populate('doctor patient').limit(2000),
      Patient.find().limit(5000),
      User.find({ role: 'doctor' }),
      Visit.find().limit(1000)
    ]);
    
    // Generate all analytics
    const allAnalytics = {
      products: await AIAnalyticsEngine.analyzeProductTrends(orders),
      doctors: await AIAnalyticsEngine.analyzeDoctorSpecializations(appointments, doctors),
      patients: await AIAnalyticsEngine.analyzePatientBehavior(patients, appointments, visits),
      business: await AIAnalyticsEngine.analyzeBusinessFeasibility(orders, appointments, []),
      scalability: await AIAnalyticsEngine.analyzeScalability({
        userGrowth: await calculateUserGrowth(),
        appointmentLoad: (appointments.length / 1000) * 100,
        systemCapacity: 100,
        avgResponseTime: 800,
        errorRate: 2
      })
    };
    
    const recommendations = AIAnalyticsEngine.generateRecommendations(allAnalytics);
    
    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message
    });
  }
};

/**
 * @desc    Get AI service status
 * @route   GET /api/v1/ai/status
 * @access  Private
 */
exports.getAIStatus = async (req, res) => {
  try {
    const status = {
      service: 'AI Analytics Engine',
      status: 'operational',
      version: '1.0.0',
      capabilities: [
        'Product Trend Analysis',
        'Doctor Performance Analytics',
        'Patient Behavior Analysis',
        'Business Feasibility Assessment',
        'Scalability Analysis',
        'Automated Recommendations'
      ],
      dataPoints: {
        orders: await Order.countDocuments(),
        appointments: await Appointment.countDocuments(),
        patients: await Patient.countDocuments(),
        doctors: await User.countDocuments({ role: 'doctor' })
      },
      lastUpdated: new Date()
    };
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI service unavailable',
      error: error.message
    });
  }
};

// Helper functions

async function calculateUserGrowth() {
  const users = await User.find().select('createdAt').sort('createdAt');
  const monthly = {};
  
  users.forEach(user => {
    const month = new Date(user.createdAt).toISOString().slice(0, 7);
    monthly[month] = (monthly[month] || 0) + 1;
  });
  
  return Object.values(monthly);
}

async function calculateAppointmentLoad() {
  const total = await Appointment.countDocuments();
  return (total / 1000) * 100; // Assuming capacity of 1000
}

async function calculateAvgResponseTime() {
  // Placeholder - would integrate with actual monitoring
  return Math.random() * 1000 + 500;
}

async function calculateErrorRate() {
  // Placeholder - would integrate with error logging
  return Math.random() * 3;
}

module.exports = exports;
