import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';
import User from './userModel.js';
import Parcel from './parcelModel.js';
import Ticket from './ticketModel.js';

const sequelize = await connectDB();

const Payment = sequelize.define(
    'Payment',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        payment_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        payment_method: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(
                'pending', 
                'completed', 
                'failed', 
                'processing', 
                'refunded', 
                'cancelled', 
                'disputed'
            ),
            allowNull: false,
            defaultValue: 'pending',
        },
        parcel_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'parcels',
                key: 'id',
            },
        },
        ticket_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'tickets',
                key: 'id',
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        transaction_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        payment_type: {
            type: DataTypes.ENUM(
                'salary', 
                'service', 
                'refund', 
                'fee', 
                'ticket', 
                'parcel', 
                'other'
            ),
            allowNull: true,
        },        
        currency: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        payment_gateway: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        reference_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },        
        payment_type: {
            type: DataTypes.ENUM('incoming', 'outgoing'),
            allowNull: true,
            defaultValue: 'incoming',
        },        
        due_date: {
            type: DataTypes.DATE,
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
        tableName: 'payments',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

Payment.belongsTo(User, { foreignKey: 'user_id', allowNull: true });
Payment.belongsTo(Parcel, { foreignKey: 'parcel_id', allowNull: true });
Payment.belongsTo(Ticket, { foreignKey: 'ticket_id', allowNull: true });

await Payment.sync();

export default Payment;
