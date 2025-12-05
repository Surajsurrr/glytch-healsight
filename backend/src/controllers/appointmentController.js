const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { auditLogger } = require('../utils/auditLogger');

// @desc    Get all appointments for the logged-in user
// @route   GET /api/v1/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    const query = { doctor: req.user.id };

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range if provided
    if (req.query.startDate || req.query.endDate) {
      query.appointmentDate = {};
      if (req.query.startDate) {
        query.appointmentDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.appointmentDate.$lte = new Date(req.query.endDate);
      }
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phone patientId dateOfBirth')
      .populate('doctor', 'firstName lastName email')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    // Transform data to match frontend structure
    const transformedAppointments = appointments.map(apt => ({
      _id: apt._id,
      appointmentId: apt.appointmentId,
      patient: {
        name: `${apt.patient.firstName} ${apt.patient.lastName}`,
        patientId: apt.patient.patientId,
        phone: apt.patient.phone,
        email: apt.patient.email
      },
      appointmentDate: apt.appointmentDate,
      appointmentTime: apt.appointmentTime,
      type: apt.type,
      status: apt.status,
      reason: apt.reason,
      notes: apt.notes,
      videoCallLink: apt.videoCallLink,
      createdAt: apt.createdAt
    }));

    res.status(200).json({
      success: true,
      count: transformedAppointments.length,
      data: transformedAppointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
};

// @desc    Get single appointment details
// @route   GET /api/v1/appointments/:id
// @access  Private
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone patientId dateOfBirth gender address emergencyContact medicalHistory')
      .populate('doctor', 'firstName lastName email specialization');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is authorized to view this appointment
    if (appointment.doctor._id.toString() !== req.user.id && 
        appointment.patient._id.toString() !== req.user.patientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    // Transform data
    const transformedAppointment = {
      _id: appointment._id,
      appointmentId: appointment.appointmentId,
      patient: {
        _id: appointment.patient._id,
        name: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        patientId: appointment.patient.patientId,
        phone: appointment.patient.phone,
        email: appointment.patient.email,
        dateOfBirth: appointment.patient.dateOfBirth,
        gender: appointment.patient.gender,
        address: appointment.patient.address,
        emergencyContact: appointment.patient.emergencyContact,
        medicalHistory: appointment.patient.medicalHistory
      },
      doctor: {
        _id: appointment.doctor._id,
        name: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
        email: appointment.doctor.email,
        specialization: appointment.doctor.specialization
      },
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      duration: appointment.duration,
      type: appointment.type,
      status: appointment.status,
      reason: appointment.reason,
      notes: appointment.notes,
      videoCallLink: appointment.videoCallLink,
      videoCallRoomId: appointment.videoCallRoomId,
      diagnosis: appointment.diagnosis,
      prescriptions: appointment.prescriptions,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    };

    res.status(200).json({
      success: true,
      data: transformedAppointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment details',
      error: error.message
    });
  }
};

// @desc    Create/Book new appointment
// @route   POST /api/v1/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  try {
    const { 
      patientId, 
      appointmentDate, 
      appointmentTime, 
      duration,
      type, 
      reason, 
      notes 
    } = req.body;

    // Find patient
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      doctor: req.user.id,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $ne: 'cancelled' }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Time slot already booked'
      });
    }

    // Generate video call room ID if type is Video
    let videoCallRoomId = null;
    let videoCallLink = null;
    
    if (type === 'Video') {
      videoCallRoomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      videoCallLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/video-call/${videoCallRoomId}`;
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: req.user.id,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      duration: duration || 30,
      type,
      status: 'scheduled',
      reason,
      notes,
      videoCallRoomId,
      videoCallLink
    });

    // Populate the created appointment
    await appointment.populate('patient', 'firstName lastName email phone patientId');
    await appointment.populate('doctor', 'firstName lastName email');

    // Log audit
    await auditLogger(req.user.id, 'CREATE', 'Appointment', appointment._id, {
      action: 'Appointment created',
      appointmentId: appointment.appointmentId,
      patient: patient.patientId
    });

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/v1/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    const updateData = { ...req.body };

    // If changing to video call and no room exists, create one
    if (updateData.type === 'Video' && !appointment.videoCallRoomId) {
      updateData.videoCallRoomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      updateData.videoCallLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/video-call/${updateData.videoCallRoomId}`;
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName email phone patientId')
     .populate('doctor', 'firstName lastName email');

    // Log audit
    await auditLogger(req.user.id, 'UPDATE', 'Appointment', appointment._id, {
      action: 'Appointment updated',
      changes: updateData
    });

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment',
      error: error.message
    });
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/v1/appointments/:id
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (appointment.doctor.toString() !== req.user.id && 
        appointment.patient.toString() !== req.user.patientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // Log audit
    await auditLogger(req.user.id, 'DELETE', 'Appointment', appointment._id, {
      action: 'Appointment cancelled',
      appointmentId: appointment.appointmentId
    });

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
};

// @desc    Generate/Get video call link
// @route   GET /api/v1/appointments/:id/video-call
// @access  Private
exports.getVideoCallLink = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (appointment.doctor.toString() !== req.user.id && 
        appointment.patient.toString() !== req.user.patientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment'
      });
    }

    // Generate video call link if doesn't exist
    if (!appointment.videoCallRoomId) {
      appointment.videoCallRoomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      appointment.videoCallLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/video-call/${appointment.videoCallRoomId}`;
      await appointment.save();
    }

    res.status(200).json({
      success: true,
      data: {
        roomId: appointment.videoCallRoomId,
        videoCallLink: appointment.videoCallLink,
        appointmentId: appointment.appointmentId
      }
    });
  } catch (error) {
    console.error('Error getting video call link:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating video call link',
      error: error.message
    });
  }
};

// @desc    Mark appointment as completed
// @route   PUT /api/v1/appointments/:id/complete
// @access  Private (Doctor only)
exports.completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization - only doctor can complete
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this appointment'
      });
    }

    appointment.status = 'completed';
    
    // Optional: Add diagnosis and notes from request body
    if (req.body.diagnosis) {
      appointment.diagnosis = req.body.diagnosis;
    }
    if (req.body.notes) {
      appointment.notes = req.body.notes;
    }
    
    await appointment.save();

    // Log audit
    await auditLogger(req.user.id, 'UPDATE', 'Appointment', appointment._id, {
      action: 'Appointment marked as completed',
      appointmentId: appointment.appointmentId
    });

    res.status(200).json({
      success: true,
      message: 'Appointment marked as completed',
      data: appointment
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing appointment',
      error: error.message
    });
  }
};
