import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';
import User from './userModel.js';

const sequelize = await connectDB();

const ParkingTicket = sequelize.define(
    'ParkingTicket',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        parking_terminus_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        vehicle_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        vehicle_model: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
        },        
        spot_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        parked_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        collected_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        payment_method: {
            type: DataTypes.ENUM('cash', 'cashless', 'other'),
            allowNull: false,
        },
        isPaid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },        
        served_by: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        pickerContact: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {
              name: null,
              phone: null,
              email: null,
              identification: null,
            },
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
        tableName: 'parking_tickets',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

ParkingTicket.belongsTo(User, { foreignKey: 'user_id' });

await ParkingTicket.sync();

export default ParkingTicket;