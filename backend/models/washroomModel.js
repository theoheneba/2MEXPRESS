import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';
import WashroomTicket from './washroomTicketModel.js';
import Amenity from './amenityModel.js';

const sequelize = await connectDB();

const Washroom = sequelize.define(
  'Washroom',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    station_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    station_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
          'active',
          'maintenance',
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
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'washrooms',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

Washroom.hasMany(WashroomTicket, { foreignKey: 'washroom_id', as: 'washroom_tickets' });
Washroom.hasMany(Amenity, { foreignKey: 'washroom_id', as:'washroom_amenities' });

await Washroom.sync();

export default Washroom;
