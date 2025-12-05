const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Get Doctor Dashboard Statistics
 * @route GET /api/dashboard/doctor/stats
 */
exports.getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get week start (Monday)
    const weekStart = new Date(today);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    // Today's appointments count
    const todayAppointments = await Appointment.countDocuments({
      doctorId,
      dateTime: { $gte: today, $lt: tomorrow },
      status: { $ne: 'cancelled' }
    });

    // Pending appointments (scheduled + confirmed)
    const pendingAppointments = await Appointment.countDocuments({
      doctorId,
      status: { $in: ['scheduled', 'confirmed'] },
      dateTime: { $gte: today }
    });

    // Total patients (unique patients the doctor has seen)
    const appointments = await Appointment.find({ doctorId }).distinct('patientId');
    const totalPatients = appointments.length;

    // This week's visits (completed appointments)
    const thisWeekVisits = await Appointment.countDocuments({
      doctorId,
      dateTime: { $gte: weekStart, $lt: tomorrow },
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      data: {
        todayAppointments,
        pendingAppointments,
        totalPatients,
        thisWeekVisits
      }
    });
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

/**
 * Get Today's Appointments for Doctor
 * @route GET /api/dashboard/doctor/today
 */
exports.getTodayAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      doctorId,
      dateTime: { $gte: today, $lt: tomorrow },
      status: { $ne: 'cancelled' }
    })
      .populate('patientId', 'userId')
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone'
        }
      })
      .sort({ dateTime: 1 })
      .lean();

    // Format appointments for frontend
    const formattedAppointments = appointments.map(apt => ({
      id: apt._id,
      appointmentId: apt.appointmentId,
      patient: apt.patientId?.userId 
        ? `${apt.patientId.userId.firstName} ${apt.patientId.userId.lastName}`
        : 'Unknown Patient',
      patientId: apt.patientId?._id,
      time: new Date(apt.dateTime).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      type: apt.type,
      status: apt.status,
      reason: apt.reason,
      duration: apt.duration,
      dateTime: apt.dateTime
    }));

    res.status(200).json({
      success: true,
      data: formattedAppointments
    });
  } catch (error) {
    console.error('Error fetching today appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s appointments',
      error: error.message
    });
  }
};

/**
 * Get Recent Activity for Doctor
 * @route GET /api/dashboard/doctor/activity
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;

    // Get recent completed appointments
    const recentAppointments = await Appointment.find({
      doctorId,
      status: 'completed',
      completedAt: { $exists: true }
    })
      .populate('patientId', 'userId')
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .sort({ completedAt: -1 })
      .limit(limit)
      .lean();

    const activities = recentAppointments.map(apt => {
      const timeDiff = Date.now() - new Date(apt.completedAt).getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      let timeAgo;
      if (days > 0) {
        timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (hours > 0) {
        timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        timeAgo = 'Less than an hour ago';
      }

      const patientName = apt.patientId?.userId 
        ? `${apt.patientId.userId.firstName} ${apt.patientId.userId.lastName}`
        : 'Unknown Patient';

      return {
        id: apt._id,
        type: 'visit_completed',
        title: 'Visit completed',
        description: `${patientName} - ${timeAgo}`,
        timestamp: apt.completedAt
      };
    });

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity',
      error: error.message
    });
  }
};

/**
 * Get Upcoming Appointments Summary
 * @route GET /api/dashboard/doctor/upcoming
 */
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const now = new Date();
    const days = parseInt(req.query.days) || 7;
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + days);

    const upcoming = await Appointment.find({
      doctorId,
      dateTime: { $gte: now, $lte: endDate },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .populate('patientId', 'userId')
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .sort({ dateTime: 1 })
      .limit(10)
      .lean();

    const formattedUpcoming = upcoming.map(apt => ({
      id: apt._id,
      patient: apt.patientId?.userId 
        ? `${apt.patientId.userId.firstName} ${apt.patientId.userId.lastName}`
        : 'Unknown Patient',
      dateTime: apt.dateTime,
      type: apt.type,
      status: apt.status
    }));

    res.status(200).json({
      success: true,
      data: formattedUpcoming
    });
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming appointments',
      error: error.message
    });
  }
};

/**
 * Get Patient Statistics for Doctor
 * @route GET /api/dashboard/doctor/patient-stats
 */
exports.getPatientStats = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // New patients (first appointment) in last 30 days
    const allPatients = await Appointment.aggregate([
      { $match: { doctorId: mongoose.Types.ObjectId(doctorId) } },
      { $group: {
        _id: '$patientId',
        firstVisit: { $min: '$dateTime' }
      }},
      { $match: { firstVisit: { $gte: thirtyDaysAgo } } },
      { $count: 'newPatients' }
    ]);

    const newPatients = allPatients.length > 0 ? allPatients[0].newPatients : 0;

    // Return patients (multiple visits)
    const returnPatients = await Appointment.aggregate([
      { $match: { 
        doctorId: mongoose.Types.ObjectId(doctorId),
        status: 'completed'
      }},
      { $group: {
        _id: '$patientId',
        visitCount: { $sum: 1 }
      }},
      { $match: { visitCount: { $gt: 1 } } },
      { $count: 'returnPatients' }
    ]);

    const returningPatients = returnPatients.length > 0 ? returnPatients[0].returnPatients : 0;

    res.status(200).json({
      success: true,
      data: {
        newPatients,
        returningPatients
      }
    });
  } catch (error) {
    console.error('Error fetching patient stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient statistics',
      error: error.message
    });
  }
};
