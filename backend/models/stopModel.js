import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';

const sequelize = await connectDB();

const Stop = sequelize.define(
    'Stop',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        route_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            
            onDelete: 'CASCADE',
        },
        stop_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
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
        tableName: 'stops',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

await Stop.sync();

export default Stop;
