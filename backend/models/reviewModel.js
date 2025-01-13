import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';
import Trip from './tripModel.js';
import User from './userModel.js'; 

const sequelize = await connectDB();

const Review = sequelize.define(
  'Review',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      unsigned: true,
      allowNull: false,
    },
    trip_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false, 
      references: {
        model: Trip,
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: User, 
        key: 'id',
      },
    },
    experience_rating: {
      type: DataTypes.INTEGER,
      allowNull: true, 
      validate: {
        min: 1,
        max: 5,
      },
    },
    service_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    driver_rating: {
      type: DataTypes.INTEGER,
      allowNull: true, 
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
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
    tableName: 'reviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

Review.belongsTo(Trip, { foreignKey: 'trip_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

await Review.sync();

export default Review;
