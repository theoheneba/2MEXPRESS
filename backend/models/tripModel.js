import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';
import Bus from './busModel.js';
import Driver from './driverModel.js';
import Route from './routeModel.js';
import TripSeat from './tripSeatModel.js';

const sequelize = await connectDB();

const Trip = sequelize.define(
  'Trip',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      unsigned: true,
      allowNull: false,
    },
    trip_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    bus_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    driver_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    route_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    embark_time: {  
      type: DataTypes.DATE, 
      allowNull: false,
    },
    arrival_time: {
      type: DataTypes.DATE, 
      allowNull: true, 
    },
    status: {
      type: DataTypes.ENUM(
        'available', 
        'scheduled', 
        'embarked', 
        'fully_booked', 
        'embarked_not_to_capacity',
        'completed' 
      ),
      defaultValue: 'scheduled',
    },
    isScheduled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, 
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
    tableName: 'trips',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

Trip.belongsTo(Bus, { foreignKey: 'bus_id' });
Trip.belongsTo(Driver, { foreignKey: 'driver_id' });
Trip.belongsTo(Route, { foreignKey: 'route_id' });
Trip.hasMany(TripSeat, { foreignKey: 'trip_id', as: 'seats' });

await Bus.sync();
await Driver.sync();
await Route.sync();
await Trip.sync();


export default Trip;
