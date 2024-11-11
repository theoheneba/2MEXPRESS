import { DataTypes } from 'sequelize';

import connectDB from '../config/db.js';
import ServiceHistory from './serviceHistoryModel.js';
import ServicingInventory from './servicingInventoryModel.js';
import Staff from './staffModel.js'; 

const sequelize = await connectDB();

const ServiceInventory = sequelize.define(
  'ServiceInventory',
  {
    service_history_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: ServiceHistory, key: 'id' },
    },
    inventory_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: ServicingInventory, key: 'id' },
    },
  },
  {
    tableName: 'service_inventories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

const ServiceMechanic = sequelize.define(
  'ServiceMechanic',
  {
    service_history_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: ServiceHistory, key: 'id' },
    },
    staff_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: Staff, key: 'id' },
    },
  },
  {
    tableName: 'service_mechanics',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

ServiceHistory.belongsToMany(ServicingInventory, { through: ServiceInventory, foreignKey: 'service_history_id' });
ServicingInventory.belongsToMany(ServiceHistory, { through: ServiceInventory, foreignKey: 'inventory_id' });

ServiceHistory.belongsToMany(Staff, { through: ServiceMechanic, foreignKey: 'service_history_id' });
Staff.belongsToMany(ServiceHistory, { through: ServiceMechanic, foreignKey: 'staff_id' });

await ServiceInventory.sync();
await ServiceMechanic.sync();

export { ServiceInventory, ServiceMechanic };
