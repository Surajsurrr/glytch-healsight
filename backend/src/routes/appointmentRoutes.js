const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getVideoCallLink,
  completeAppointment,
  addReport,
  getAppointmentReport
} = require('../controllers/appointmentController');

// Appointment routes
router.get('/', protect, getAppointments);
router.post('/', protect, createAppointment);
router.get('/:id', protect, getAppointment);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, cancelAppointment);

// Video call link
router.get('/:id/video-call', protect, getVideoCallLink);

// Complete appointment
router.put('/:id/complete', protect, authorize('doctor', 'admin'), completeAppointment);

// Reports and prescriptions
router.post('/:id/reports', protect, authorize('doctor', 'admin'), addReport);
router.get('/:id/report', protect, getAppointmentReport);

module.exports = router;
