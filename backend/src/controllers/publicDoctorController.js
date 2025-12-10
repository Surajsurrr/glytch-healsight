const User = require('../models/User');

// @desc Public - Get doctors list (with optional search / specialization)
// @route GET /api/v1/doctors
// @access Public
const getPublicDoctors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const specialization = req.query.specialization || '';

    const query = { role: 'doctor', isActive: true, verificationStatus: 'approved' };
    if (search) {
      const re = new RegExp(search, 'i');
      query.$or = [ { firstName: re }, { lastName: re }, { specialization: re }, { department: re } ];
    }
    if (specialization) query.specialization = specialization;

    const doctors = await User.find(query)
      .select('firstName lastName specialization profilePicture consultationFee address yearOfExperience availability')
      .limit(limit)
      .skip(skip)
      .sort('-yearOfExperience');

    const total = await User.countDocuments(query);

    res.status(200).json({ success: true, data: doctors, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPublicDoctors };
