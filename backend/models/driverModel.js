import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';
import User from './userModel.js';

const sequelize = await connectDB();

const Driver = sequelize.define(
    'Driver',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        driver_no: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        license_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        license_expiry: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('active', 'on_duty', 'driving', 'off_duty', 'leave', 'suspended', 'terminated'),
            allowNull: false,
            defaultValue: 'active',
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: 'drivers',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

Driver.belongsTo(User, { foreignKey: 'user_id' });

await Driver.sync();

export default Driver;
