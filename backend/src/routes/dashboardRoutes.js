const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDoctorStats,
  getTodayAppointments,
  getRecentActivity,
  getUpcomingAppointments,
  getPatientStats
} = require('../controllers/dashboardController');

// Doctor dashboard routes
router.get('/doctor/stats', protect, authorize('doctor'), getDoctorStats);
router.get('/doctor/today', protect, authorize('doctor'), getTodayAppointments);
router.get('/doctor/activity', protect, authorize('doctor'), getRecentActivity);
router.get('/doctor/upcoming', protect, authorize('doctor'), getUpcomingAppointments);
router.get('/doctor/patient-stats', protect, authorize('doctor'), getPatientStats);

// Admin dashboard stats
router.get('/admin/stats', protect, authorize('admin'), (req, res) => {
  res.status(200).json({ 
    success: true,
    data: {
      totalUsers: 523,
      totalPatients: 450,
      totalDoctors: 68,
      todayAppointments: 87,
      activeAppointments: 234
    }
  });
});

// Admin users management
router.get('/admin/users', protect, authorize('admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Get admin users endpoint' });
});

// Admin audit logs
router.get('/admin/audit-logs', protect, authorize('admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Get audit logs endpoint' });
});

// Patient dashboard
router.get('/patient/stats', protect, authorize('patient'), (req, res) => {
  res.status(200).json({ 
    success: true,
    data: {
      upcomingAppointments: 2,
      totalVisits: 15,
      activePrescriptions: 3,
      lastVisit: '2025-11-28'
    }
  });
});

module.exports = router;
