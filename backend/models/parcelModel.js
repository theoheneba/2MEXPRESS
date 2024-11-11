import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';
import User from './userModel.js';
import Trip from './tripModel.js';

const sequelize = await connectDB();

const Parcel = sequelize.define(
    'Parcel',
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
        trip_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        size: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        weight: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        delivery_timing: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('booked', 'in_transit', 'delivered', 'cancelled', 'undeliverable', 'lost', 'damaged'),
            allowNull: false,
            defaultValue: 'booked',
        },
        tracking_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            defaultValue: function() {
                const prefix = '2MPC';
                const randomNumber = Math.floor(100000 + Math.random() * 900000);
                return `${prefix}-${randomNumber}`;
            }
        },
        receiver_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        receiver_phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        receiver_email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        parcel_value: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },        
        served_by: {
            type: DataTypes.STRING,
            allowNull: true,
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
        tableName: 'parcels',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

Parcel.belongsTo(User, { foreignKey: 'user_id' });
Parcel.belongsTo(Trip, { foreignKey: 'trip_id' });

await Parcel.sync();

export default Parcel;
