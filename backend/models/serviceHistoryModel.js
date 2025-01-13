import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';
import Bus from './busModel.js';

const sequelize = await connectDB();

const ServiceHistory = sequelize.define(
    'ServiceHistory',
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
        type: {
            type: DataTypes.JSON, 
            allowNull: false,
            defaultValue: [], 
        },
        mileage: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        service_shop: {
            type: DataTypes.STRING,
            allowNull: false,
        },       
        parts_bought: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(
                'requested',
                'in_progress',                
                'pending',
                'completed',
                'canceled',
                'postponed',
            ),
            allowNull: false,
            defaultValue: 'pending',
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
        tableName: 'service_histories',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

ServiceHistory.belongsTo(Bus, { foreignKey: 'bus_id' });

await ServiceHistory.sync();

export default ServiceHistory;
