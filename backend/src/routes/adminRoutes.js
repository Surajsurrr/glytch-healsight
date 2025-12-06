const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllDoctors,
  getAllPatients,
  getAllAppointments,
  getAllVisits,
  getAllPrescriptions,
  getAllMedicalRecords,
  toggleUserStatus,
  deleteUser,
  getUserDetails,
  getPendingVerifications,
  getVerificationDetails,
  approveDoctor,
  rejectDoctor
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// Stats
router.get('/stats', getAdminStats);

// Doctor verification
router.get('/verifications/pending', getPendingVerifications);
router.get('/verifications/:id', getVerificationDetails);
router.post('/verifications/:id/approve', approveDoctor);
router.post('/verifications/:id/reject', rejectDoctor);

// Users management
router.get('/doctors', getAllDoctors);
router.get('/patients', getAllPatients);
router.get('/users/:id', getUserDetails);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Data management
router.get('/appointments', getAllAppointments);
router.get('/visits', getAllVisits);
router.get('/prescriptions', getAllPrescriptions);
router.get('/medical-records', getAllMedicalRecords);

module.exports = router;
