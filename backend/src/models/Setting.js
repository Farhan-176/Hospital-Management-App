const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Setting = sequelize.define('Setting', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    value: {
        type: DataTypes.JSON,
        allowNull: false
    },
    group: {
        type: DataTypes.STRING,
        defaultValue: 'general'
    },
    description: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true,
    tableName: 'settings'
});

module.exports = Setting;
