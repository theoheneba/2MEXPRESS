import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';

const sequelize = await connectDB();

const FleetManagement = sequelize.define(
    'FleetManagement',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        bus_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        route_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        driver_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        schedule_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('scheduled', 'in_progress', 'completed'),
            allowNull: false,
            defaultValue: 'scheduled',
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
        tableName: 'fleet_management',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

await FleetManagement.sync();

export default FleetManagement;
