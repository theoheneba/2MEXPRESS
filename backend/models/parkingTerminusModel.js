import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';
import ParkingTicket from './parkingTicketModel.js';

const sequelize = await connectDB();

const ParkingTerminus = sequelize.define(
    'ParkingTerminus',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },       
        terminus_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        terminus_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        parking_capacity : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(
                'active',
                'maintenance',
                'fully_booked',
                'cleaning',
                'inspection',
                'closed',
                'out_of_service',
            ),
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
        tableName: 'parking_termini',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

ParkingTerminus.hasMany(ParkingTicket, { foreignKey: 'parking_terminus_id', as: 'parking_tickets' });

await ParkingTerminus.sync();

export default ParkingTerminus;
