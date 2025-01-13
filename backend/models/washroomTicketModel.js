import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';

const sequelize = await connectDB();

const WashroomTicket = sequelize.define(
  'WashroomTicket',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    washroom_id: {            
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    amenity_id: {            
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    served_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'cashless', 'other'),
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM(
          'male',
          'female',
          'other',
      ),
      allowNull: false,
      defaultValue: 'other',
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'washroom_tickets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

await WashroomTicket.sync();

export default WashroomTicket;
