import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';
import Stop from './stopModel.js';


const sequelize = await connectDB();

const Route = sequelize.define(
    'Route',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        origin: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        destination: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        distance: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        duration: {
            type: DataTypes.FLOAT,
            allowNull: false,
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
        tableName: 'routes',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

Route.hasMany(Stop, { foreignKey: 'route_id', as: 'stops' });

await Route.sync();

export default Route;
