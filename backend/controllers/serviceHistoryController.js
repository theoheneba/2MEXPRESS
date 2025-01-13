import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';

import ServiceHistory from '../models/serviceHistoryModel.js';
import Bus from '../models/busModel.js';
import ServicingInventory from '../models/servicingInventoryModel.js';
import Staff from '../models/staffModel.js';
import { ServiceInventory, ServiceMechanic } from '../models/serviceJunctionModels.js';


/**
 * @desc Get all service histories or search by bus details
 * @route GET /api/service-histories
 * @access public
 */
const getServiceHistories = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let whereCondition = {};

  if (search) {
    whereCondition = {
      [Op.or]: [
        { '$Bus.bus_number$': { [Op.like]: `%${search}%` } },
        { '$Bus.name$': { [Op.like]: `%${search}%` } },
        { '$Bus.model$': { [Op.like]: `%${search}%` } },
      ],
    };
  }

  const serviceHistories = await ServiceHistory.findAll({
    where: whereCondition,
    include: [
      {
        model: Bus,
        attributes: ['id', 'name', 'model', 'bus_number'],
      },
      {
        model: ServicingInventory,
        through: { attributes: [] },
      },
      {
        model: Staff,
        through: { attributes: [] },
      },
    ],
    order: [['created_at', 'DESC']],
  });

  res.json(serviceHistories);
});

/**
 * @desc    Get a bus service history by bus_id
 * @route   GET /api/service-histories/bus/:bus_id
 * @access  Public
 */
const getServiceHistoryByBusId = asyncHandler(async (req, res) => {
  const { bus_id } = req.params;

  const serviceHistories = await ServiceHistory.findAll({
      where: { bus_id },
      include: [
          {
              model: Bus,
              attributes: ['id', 'name', 'model', 'bus_number'],
          },
          {
              model: ServicingInventory,
              through: { attributes: [] },
          },
          {
              model: Staff,
              through: { attributes: [] },
          }
      ],
      order: [['created_at', 'DESC']],
  });

  if (serviceHistories.length > 0) {
      res.json(serviceHistories);
  } else {
      res.status(404);
      throw new Error('Service history not found for this bus');
  }
});


/**
 * @desc Get a single service history by ID
 * @route GET /api/service-histories/:id
 * @access public
 */
const getServiceHistoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const serviceHistory = await ServiceHistory.findByPk(id, {
    include: [
      {
        model: Bus,
        attributes: ['id', 'name', 'model', 'bus_number'],
      },
      {
        model: ServicingInventory,
        through: { attributes: [] },
      },
      {
        model: Staff,
        through: { attributes: [] },
      },
    ],
  });

  if (serviceHistory) {
    res.json(serviceHistory);
  } else {
    res.status(404);
    throw new Error('Service history not found');
  }
});


/**
 * @desc Create a new service history and manage junction tables
 * @route POST /api/service-histories
 * @access private
 */
const createServiceHistory = asyncHandler(async (req, res) => {
  let { bus_id, type, mileage, cost, service_shop, parts_bought, mechanic_ids, inventory_ids, notes, status } = req.body;

  // Validate required fields
  if (!bus_id || !type || !service_shop) {
    res.status(400);
    throw new Error('All required fields must be provided');
  }

  // Find the bus
  const bus = await Bus.findByPk(bus_id);
  if (!bus) {
    res.status(404);
    throw new Error('Bus not found');
  }

  // Clean up mechanic_ids and inventory_ids to remove duplicates and ensure consistency
  mechanic_ids = mechanic_ids ? cleanUpIds(mechanic_ids) : [];
  inventory_ids = inventory_ids ? cleanUpIds(inventory_ids) : [];

  // Create service history
  const serviceHistory = await ServiceHistory.create({
    bus_id,
    type,
    mileage,
    cost,
    service_shop,
    parts_bought,
    notes,
    status,
  });

  // Process inventory items
  if (inventory_ids.length) {
    for (const inventoryId of inventory_ids) {
      const servicingInventory = await ServicingInventory.findByPk(inventoryId);
      if (!servicingInventory || servicingInventory.current_status !== 'available') {
        res.status(400);
        throw new Error(`Item with ID ${inventoryId} is not available for use.`);
      }

      const newQuantity = servicingInventory.quantity - 1; // Assume quantity used is 1 (modify as needed)
      let newStatus = 'available';

      if (newQuantity <= 0) {
        newStatus = 'out_of_stock';
      }

      await servicingInventory.update({ quantity: newQuantity, current_status: newStatus });

      // Link the inventory item to the service history
      await ServiceInventory.create({ service_history_id: serviceHistory.id, inventory_id: inventoryId });
    }
  }

  // Process mechanic IDs
  if (mechanic_ids.length) {
    for (const staffId of mechanic_ids) {
      await ServiceMechanic.create({ service_history_id: serviceHistory.id, staff_id: staffId });
    }
  }

  res.status(201).json(serviceHistory);
});


/**
 * @desc Update an existing service history and manage junction tables
 * @route PUT /api/service-histories/:id
 * @access private
 */
const updateServiceHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let { type, mileage, cost, service_shop, parts_bought, mechanic_ids, inventory_ids, notes, status } = req.body;

  const serviceHistory = await ServiceHistory.findByPk(id);
  if (!serviceHistory) {
    res.status(404);
    throw new Error('Service history not found');
  }

  // Update fields if provided
  serviceHistory.type = type || serviceHistory.type;
  serviceHistory.mileage = mileage || serviceHistory.mileage;
  serviceHistory.cost = cost || serviceHistory.cost;
  serviceHistory.service_shop = service_shop || serviceHistory.service_shop;
  serviceHistory.parts_bought = parts_bought || serviceHistory.parts_bought;
  serviceHistory.notes = notes || serviceHistory.notes;
  serviceHistory.status = status || serviceHistory.status;

  await serviceHistory.save();

  // Clean up mechanic_ids and inventory_ids
  mechanic_ids = mechanic_ids ? cleanUpIds(mechanic_ids) : [];
  inventory_ids = inventory_ids ? cleanUpIds(inventory_ids) : [];

  // Update inventory items: remove those that are not in the updated list, add new ones
  const existingInventories = await ServiceInventory.findAll({ where: { service_history_id: id } });
  const existingInventoryIds = existingInventories.map((inv) => inv.inventory_id.toString());

  const inventoriesToRemove = existingInventoryIds.filter((invId) => !inventory_ids.includes(invId));
  const inventoriesToAdd = inventory_ids.filter((invId) => !existingInventoryIds.includes(invId));

  // Remove outdated inventory records
  if (inventoriesToRemove.length) {
    await ServiceInventory.destroy({ where: { service_history_id: id, inventory_id: inventoriesToRemove } });
  }

  // Add new inventory records
  for (const inventoryId of inventoriesToAdd) {
    const servicingInventory = await ServicingInventory.findByPk(inventoryId);
    if (!servicingInventory || servicingInventory.current_status !== 'available') {
      res.status(400);
      throw new Error(`Item with ID ${inventoryId} is not available for use.`);
    }

    const newQuantity = servicingInventory.quantity - 1; // Assume quantity used is 1 (modify as needed)
    let newStatus = 'available';
    if (newQuantity <= 0) newStatus = 'out_of_stock';

    await servicingInventory.update({ quantity: newQuantity, current_status: newStatus });
    await ServiceInventory.create({ service_history_id: id, inventory_id: inventoryId });
  }

  // Update mechanic IDs: remove those that are not in the updated list, add new ones
  const existingMechanics = await ServiceMechanic.findAll({ where: { service_history_id: id } });
  const existingMechanicIds = existingMechanics.map((mech) => mech.staff_id.toString());

  const mechanicsToRemove = existingMechanicIds.filter((mechId) => !mechanic_ids.includes(mechId));
  const mechanicsToAdd = mechanic_ids.filter((mechId) => !existingMechanicIds.includes(mechId));

  // Remove outdated mechanic records
  if (mechanicsToRemove.length) {
    await ServiceMechanic.destroy({ where: { service_history_id: id, staff_id: mechanicsToRemove } });
  }

  // Add new mechanic records
  for (const staffId of mechanicsToAdd) {
    await ServiceMechanic.create({ service_history_id: id, staff_id: staffId });
  }

  res.json(serviceHistory);
});


/**
 * @desc Delete a service history
 * @route DELETE /api/service-histories/:id
 * @access private
 */
const deleteServiceHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const serviceHistory = await ServiceHistory.findByPk(id);

  if (serviceHistory) {
    await ServiceInventory.destroy({ where: { service_history_id: id } });
    await ServiceMechanic.destroy({ where: { service_history_id: id } });

    await serviceHistory.destroy();
    res.status(204).end();
  } else {
    res.status(404);
    throw new Error('Service history not found');
  }
});


/**
 * Helper function to filter and standardize IDs as strings
 * @param {Array} ids - Array of IDs that might contain duplicates or mixed types
 * @returns {Array} - Cleaned array of unique string IDs
 */
const cleanUpIds = (ids) => {
  return [...new Set(ids.map((id) => String(id)))];
};


export {
  getServiceHistories,
  getServiceHistoryByBusId,
  getServiceHistoryById,
  createServiceHistory,
  updateServiceHistory,
  deleteServiceHistory,
};
