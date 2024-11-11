import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';

const sequelize = await connectDB();

const TripSeat = sequelize.define(
  'TripSeat',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    trip_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    seat_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('available', 'reserved'),
      allowNull: false,
      defaultValue: 'available',
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
    tableName: 'trip_seats',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

await TripSeat.sync();

export default TripSeat;
