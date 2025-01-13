import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';

const sequelize = await connectDB();

const ServicingInventory = sequelize.define(
  'ServicingInventory',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    item_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_of_measurement: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cost_per_unit: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    supplier: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    invoice_number: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    reorder_point: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    location_in_storage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shop_name: { 
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_restocked_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    part_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    compatible_bus_models: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    minimum_order_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    lead_time: {
      type: DataTypes.INTEGER, 
      allowNull: true,
    },
    expiration_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    usage_rate: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    alternative_part_numbers: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    warranty_information: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    safety_stock_level: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    last_used_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    criticality: {
      type: DataTypes.ENUM('high', 'medium', 'low'),
      allowNull: false,
      defaultValue: 'medium',
    },
    current_status: {
      type: DataTypes.ENUM('on_order', 'available', 'out_of_stock', 'backorder', 'discontinued'),
      allowNull: false,
      defaultValue: 'available',
    },
  },
  {
    tableName: 'servicing_inventories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

await ServicingInventory.sync();

export default ServicingInventory;
