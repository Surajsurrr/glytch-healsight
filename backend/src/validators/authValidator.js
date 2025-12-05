const Joi = require('joi');

// Register validation
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('admin', 'doctor', 'patient').default('patient'),
  firstName: Joi.string().required().messages({
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().required().messages({
    'any.required': 'Last name is required'
  }),
  phone: Joi.string().optional(),
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  
  // Doctor-specific
  specialization: Joi.string().when('role', {
    is: 'doctor',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  licenseNumber: Joi.string().when('role', {
    is: 'doctor',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  department: Joi.string().optional(),
  consultationFee: Joi.number().optional(),
  
  // Patient-specific
  bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional(),
  allergies: Joi.array().items(Joi.string()).optional()
});

// Login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Refresh token validation
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema
};
