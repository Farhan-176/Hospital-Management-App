const AuditLog = require('../models/AuditLog');

/**
 * Determine action type from method and endpoint
 */
const getActionType = (method, endpoint) => {
  const resource = endpoint.split('/').filter(Boolean)[1] || 'unknown';
  
  const actionMap = {
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE',
    'GET': 'VIEW'
  };

  return `${actionMap[method] || 'ACTION'}_${resource.toUpperCase()}`;
};

/**
 * Determine resource type from endpoint
 */
const getResourceType = (endpoint) => {
  const parts = endpoint.split('/').filter(Boolean);
  if (parts.length >= 2) {
    return parts[1]; // e.g., /api/patients -> patients
  }
  return 'unknown';
};

/**
 * Determine severity based on action
 */
const getSeverity = (method, endpoint) => {
  // Critical actions
  if (method === 'DELETE' || endpoint.includes('/payment') || endpoint.includes('/prescription')) {
    return 'critical';
  }
  
  // High severity
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    if (endpoint.includes('/patient') || endpoint.includes('/invoice') || endpoint.includes('/lab')) {
      return 'high';
    }
  }
  
  // Medium severity
  if (method === 'POST' || method === 'PUT') {
    return 'medium';
  }
  
  // Low severity (GET requests, etc.)
  return 'low';
};

/**
 * Extract resource ID from endpoint or body
 */
const getResourceId = (req) => {
  // Try to get from URL params
  if (req.params.id) {
    return req.params.id;
  }
  
  // Try to get from other common param names
  if (req.params.patientId) return req.params.patientId;
  if (req.params.doctorId) return req.params.doctorId;
  if (req.params.appointmentId) return req.params.appointmentId;
  
  // Try to get from request body for create operations
  if (req.body.id) {
    return req.body.id;
  }
  
  return null;
};

/**
 * Sanitize request body to remove sensitive data
 */
const sanitizeRequestBody = (body) => {
  if (!body) return null;
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.accessToken;
  delete sanitized.refreshToken;
  
  return sanitized;
};

/**
 * Audit logging middleware
 * Logs all medical and administrative actions
 */
const auditLog = async (req, res, next) => {
  // Store original response methods
  const originalJson = res.json;
  const originalSend = res.send;

  // Variables to store response data
  let responseBody;
  let statusCode;

  // Override res.json
  res.json = function(data) {
    responseBody = data;
    statusCode = res.statusCode;
    return originalJson.call(this, data);
  };

  // Override res.send
  res.send = function(data) {
    responseBody = data;
    statusCode = res.statusCode;
    return originalSend.call(this, data);
  };

  // Listen for response finish
  res.on('finish', async () => {
    try {
      // Only log API endpoints (skip health checks, static files)
      if (!req.path.startsWith('/api') || req.path === '/api/health') {
        return;
      }

      // Only log authenticated requests (skip login, register)
      if (!req.user && !req.path.includes('/auth/login') && !req.path.includes('/auth/register')) {
        return;
      }

      const action = getActionType(req.method, req.path);
      const resource = getResourceType(req.path);
      const resourceId = getResourceId(req);
      const severity = getSeverity(req.method, req.path);

      await AuditLog.create({
        userId: req.user ? req.user.id : null,
        action,
        resource,
        resourceId,
        method: req.method,
        endpoint: req.path,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        requestBody: sanitizeRequestBody(req.body),
        responseStatus: statusCode,
        severity,
        success: statusCode >= 200 && statusCode < 400,
        metadata: {
          query: req.query,
          userRole: req.user ? req.user.role : null
        }
      });
    } catch (err) {
      // Don't fail the request if audit logging fails
      console.error('Audit logging error:', err);
    }
  });

  next();
};

/**
 * Manual audit log creation for specific events
 */
const createAuditLog = async (data) => {
  try {
    await AuditLog.create(data);
  } catch (err) {
    console.error('Manual audit log creation error:', err);
  }
};

module.exports = {
  auditLog,
  createAuditLog
};
