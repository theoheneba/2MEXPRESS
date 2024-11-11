import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';
import User from './userModel.js';

const sequelize = await connectDB();

const PointsHistory = sequelize.define(
    'PointsHistory',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            unsigned: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('award', 'redeem'),
            allowNull: false,
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'points_history',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    }
);

PointsHistory.belongsTo(User, { foreignKey: 'user_id' });

await PointsHistory.sync();

export default PointsHistory;
