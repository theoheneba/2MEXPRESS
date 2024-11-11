import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';
import Driver from './driverModel.js';

const sequelize = await connectDB();

const Bus = sequelize.define(
    'Bus',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },        
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        bus_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(
                'active',
                'maintenance',
                'hired',
                'reserved',
                'cleaning',
                'inspection',
                'accident',
                'out_of_service',
                'retired'
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
        tableName: 'buses',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

Bus.belongsToMany(Driver, { through: 'BusDrivers', foreignKey: 'bus_id' });
Driver.belongsToMany(Bus, { through: 'BusDrivers', foreignKey: 'driver_id' });

await Bus.sync();

export default Bus;
