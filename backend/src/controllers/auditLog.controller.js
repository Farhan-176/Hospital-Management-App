const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { success, error, paginated } = require('../utils/response');

/**
 * Get all audit logs (admin only)
 */
const getAllAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, userId, action, resource, severity, success: isSuccess } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (userId) where.userId = userId;
        if (action) where.action = action;
        if (resource) where.resource = resource;
        if (severity) where.severity = severity;
        if (isSuccess !== undefined) where.success = isSuccess === 'true';

        const { count, rows } = await AuditLog.findAndCountAll({
            where,
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        return paginated(res, rows, page, limit, count, 'Audit logs retrieved successfully');
    } catch (err) {
        console.error('Get audit logs error:', err);
        return error(res, 'Failed to retrieve audit logs', 500);
    }
};

/**
 * Get audit log by ID
 */
const getAuditLogById = async (req, res) => {
    try {
        const { id } = req.params;

        const log = await AuditLog.findByPk(id, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] }
            ]
        });

        if (!log) {
            return error(res, 'Audit log not found', 404);
        }

        return success(res, log, 'Audit log retrieved successfully');
    } catch (err) {
        console.error('Get audit log error:', err);
        return error(res, 'Failed to retrieve audit log', 500);
    }
};

module.exports = {
    getAllAuditLogs,
    getAuditLogById
};
