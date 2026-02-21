const { success, error } = require('../utils/response');
const Setting = require('../models/Setting');

/**
 * Get all settings
 */
const getAllSettings = async (req, res) => {
    try {
        const settings = await Setting.findAll();
        const settingsMap = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});
        return success(res, settingsMap, 'Settings retrieved successfully');
    } catch (err) {
        console.error('Get settings error:', err);
        return error(res, 'Failed to retrieve settings', 500);
    }
};

/**
 * Update settings
 */
const updateSettings = async (req, res) => {
    try {
        const settingsData = req.body; // Expecting { key: value, ... }

        for (const [key, value] of Object.entries(settingsData)) {
            await Setting.upsert({
                key,
                value,
                group: 'general' // Default group
            });
        }

        const updatedSettings = await Setting.findAll();
        const settingsMap = updatedSettings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});

        return success(res, settingsMap, 'Settings updated successfully');
    } catch (err) {
        console.error('Update settings error:', err);
        return error(res, 'Failed to update settings', 500);
    }
};

module.exports = {
    getAllSettings,
    updateSettings
};
