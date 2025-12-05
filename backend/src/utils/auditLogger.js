const AuditLog = require('../models/AuditLog');

const createAuditLog = async (data) => {
  try {
    await AuditLog.create({
      userId: data.userId,
      userEmail: data.userEmail,
      userRole: data.userRole,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      description: data.description,
      changes: data.changes,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      status: data.status || 'success',
      errorMessage: data.errorMessage,
      isSecurityEvent: data.isSecurityEvent || false,
      severity: data.severity || 'info',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

module.exports = { createAuditLog };
