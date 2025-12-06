const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Visit = require('../models/Visit');
const Prescription = require('../models/Prescription');
const MedicalRecord = require('../models/MedicalRecord');

// @desc    Get admin dashboard stats
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingVerifications = await User.countDocuments({ 
      role: 'doctor', 
      verificationStatus: 'pending' 
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow }
    });
    
    const totalVisits = await Visit.countDocuments();
    const totalPrescriptions = await Prescription.countDocuments();
    const totalMedicalRecords = await MedicalRecord.countDocuments();

    // Get user registrations for the last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    const dailyRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            role: "$role"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    // Get appointments trend for the last 30 days
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 29);
    last30Days.setHours(0, 0, 0, 0);

    const appointmentsTrend = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    // Get appointment status distribution
    const appointmentStatusDistribution = await Appointment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get most active doctors (by appointments)
    const topDoctors = await Appointment.aggregate([
      {
        $group: {
          _id: "$doctor",
          appointmentCount: { $sum: 1 }
        }
      },
      {
        $sort: { appointmentCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "doctorInfo"
        }
      },
      {
        $unwind: "$doctorInfo"
      },
      {
        $project: {
          name: {
            $concat: ["$doctorInfo.firstName", " ", "$doctorInfo.lastName"]
          },
          appointmentCount: 1,
          specialization: "$doctorInfo.specialization"
        }
      }
    ]);

    // Get patient engagement (visits per patient)
    const patientEngagement = await Visit.aggregate([
      {
        $group: {
          _id: "$patient",
          visitCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          avgVisitsPerPatient: { $avg: "$visitCount" },
          totalActivePatients: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalAppointments,
        todayAppointments,
        totalVisits,
        totalPrescriptions,
        totalMedicalRecords,
        pendingVerifications,
        analytics: {
          dailyRegistrations,
          appointmentsTrend,
          appointmentStatusDistribution,
          topDoctors,
          patientEngagement: patientEngagement[0] || { avgVisitsPerPatient: 0, totalActivePatients: 0 }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors
// @route   GET /api/v1/admin/doctors
// @access  Private/Admin
const getAllDoctors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const doctors = await User.find({ role: 'doctor' })
      .select('-password -refreshTokens')
      .sort('-createdAt')
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments({ role: 'doctor' });

    res.status(200).json({
      success: true,
      data: doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all patients
// @route   GET /api/v1/admin/patients
// @access  Private/Admin
const getAllPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const patients = await User.find({ role: 'patient' })
      .select('-password -refreshTokens')
      .sort('-createdAt')
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments({ role: 'patient' });

    res.status(200).json({
      success: true,
      data: patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments
// @route   GET /api/v1/admin/appointments
// @access  Private/Admin
const getAllAppointments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const appointments = await Appointment.find()
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName specialization')
      .sort('-appointmentDate')
      .limit(limit)
      .skip(skip);

    const total = await Appointment.countDocuments();

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all visits
// @route   GET /api/v1/admin/visits
// @access  Private/Admin
const getAllVisits = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const visits = await Visit.find()
      .populate('patientId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName specialization')
      .sort('-visitDate')
      .limit(limit)
      .skip(skip);

    const total = await Visit.countDocuments();

    res.status(200).json({
      success: true,
      data: visits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all prescriptions
// @route   GET /api/v1/admin/prescriptions
// @access  Private/Admin
const getAllPrescriptions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const prescriptions = await Prescription.find()
      .populate('patientId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName')
      .sort('-createdAt')
      .limit(limit)
      .skip(skip);

    const total = await Prescription.countDocuments();

    res.status(200).json({
      success: true,
      data: prescriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all medical records
// @route   GET /api/v1/admin/medical-records
// @access  Private/Admin
const getAllMedicalRecords = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const records = await MedicalRecord.find()
      .populate('patientId', 'firstName lastName')
      .populate('uploadedBy', 'firstName lastName')
      .sort('-uploadDate')
      .limit(limit)
      .skip(skip);

    const total = await MedicalRecord.countDocuments();

    res.status(200).json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/v1/admin/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user details
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    let additionalData = {};
    
    if (user.role === 'patient') {
      const patient = await Patient.findOne({ userId: user._id });
      additionalData.patient = patient;
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        ...additionalData
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending doctor verifications
// @route   GET /api/v1/admin/verifications/pending
// @access  Private/Admin
const getPendingVerifications = async (req, res, next) => {
  try {
    const pendingDoctors = await User.find({ 
      role: 'doctor', 
      verificationStatus: 'pending' 
    })
    .select('-password -refreshTokens')
    .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: pendingDoctors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor verification details
// @route   GET /api/v1/admin/verifications/:id
// @access  Private/Admin
const getVerificationDetails = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.params.id)
      .select('-password -refreshTokens');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: { message: 'Doctor not found' }
      });
    }

    if (doctor.role !== 'doctor') {
      return res.status(400).json({
        success: false,
        error: { message: 'User is not a doctor' }
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve doctor verification
// @route   POST /api/v1/admin/verifications/:id/approve
// @access  Private/Admin
const approveDoctor = async (req, res, next) => {
  try {
    const { notes } = req.body;
    
    const doctor = await User.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: { message: 'Doctor not found' }
      });
    }

    if (doctor.role !== 'doctor') {
      return res.status(400).json({
        success: false,
        error: { message: 'User is not a doctor' }
      });
    }

    doctor.verificationStatus = 'approved';
    doctor.verificationNotes = notes;
    doctor.verifiedBy = req.user._id;
    doctor.verifiedAt = new Date();
    doctor.isActive = true;
    
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Doctor approved successfully',
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject doctor verification
// @route   POST /api/v1/admin/verifications/:id/reject
// @access  Private/Admin
const rejectDoctor = async (req, res, next) => {
  try {
    const { reason, notes } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        error: { message: 'Rejection reason is required' }
      });
    }
    
    const doctor = await User.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: { message: 'Doctor not found' }
      });
    }

    if (doctor.role !== 'doctor') {
      return res.status(400).json({
        success: false,
        error: { message: 'User is not a doctor' }
      });
    }

    doctor.verificationStatus = 'rejected';
    doctor.rejectionReason = reason;
    doctor.verificationNotes = notes;
    doctor.verifiedBy = req.user._id;
    doctor.verifiedAt = new Date();
    doctor.isActive = false;
    
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Doctor verification rejected',
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
