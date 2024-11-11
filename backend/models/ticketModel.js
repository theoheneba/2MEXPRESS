import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';
import User from './userModel.js';
import Trip from './tripModel.js'; 
import Stop from './stopModel.js';

const sequelize = await connectDB();

const Ticket = sequelize.define(
    'Ticket',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        ticket_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            defaultValue: function() {
                const prefix = '2MPk';
                const randomNumber = Math.floor(100000 + Math.random() * 900000);
                return `${prefix}-${randomNumber}`;
            }
        },
        user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        recipient_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        recipient_relationship: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        trip_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        stop_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true, 
        },
        preferred_seat: {
            type: DataTypes.STRING, 
            allowNull: true,
          },
        seat_number: {
            type: DataTypes.STRING, 
            allowNull: true,
        },
        isPaid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending',
        },
        ticket_type: { 
            type: DataTypes.ENUM('online', 'walkin'), 
            allowNull: false,
            defaultValue: 'walkin', 
        },
        isConfirmed: { 
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        isPicked: { 
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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
        tableName: 'tickets',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

Ticket.belongsTo(User, { foreignKey: 'user_id' });
Ticket.belongsTo(Trip, { foreignKey: 'trip_id' });
Ticket.belongsTo(Stop, { foreignKey: 'stop_id', as: 'stop' });


await Ticket.sync();

export default Ticket;
