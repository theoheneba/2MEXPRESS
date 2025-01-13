import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';

import ServicingInventory from '../models/servicingInventoryModel.js';


/**
 * @desc    Get all inventory items or search 
 * @route   GET /api/servicing-inventory
 * @access  public
 */
const getInventoryItems = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let whereCondition = {};

  if (search) {
    whereCondition = {
      [Op.or]: [
        { item_name: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
        { supplier: { [Op.like]: `%${search}%` } },
        { part_number: { [Op.like]: `%${search}%` } },
        { current_status: { [Op.like]: `%${search}%` } },
      ],
    };
  }

  const inventoryItems = await ServicingInventory.findAll({
    where: whereCondition,
    order: [['created_at', 'DESC']],
  });

  res.json(inventoryItems);
});


/**
 * @desc    Get single inventory item by ID
 * @route   GET /api/servicing-inventory/:id
 * @access  public
 */
const getInventoryItemById = asyncHandler(async (req, res) => {
  const inventoryItem = await ServicingInventory.findByPk(req.params.id);

  if (inventoryItem) {
    res.json(inventoryItem);
  } else {
    res.status(404);
    throw new Error('Inventory item not found');
  }
});


/**
 * @desc    Create a new inventory item
 * @route   POST /api/servicing-inventory
 * @access  private
 */
const createInventoryItem = asyncHandler(async (req, res) => {
  const {
    item_name,
    category,
    quantity,
    unit_of_measurement,
    cost_per_unit,
    supplier,
    invoice_number,
    reorder_point,
    location_in_storage,
    shop_name,
    manufacturer,
    part_number,
    compatible_bus_models,
    minimum_order_quantity,
    lead_time,
    expiration_date,
    usage_rate,
    alternative_part_numbers,
    warranty_information,
    safety_stock_level,
    notes,
    criticality,
  } = req.body;

  // Calculate current status based on quantity
  let current_status = 'available';
  if (quantity <= 0) {
    current_status = 'out_of_stock';
  } 
  
  try {
    const newItem = await ServicingInventory.create({
      item_name,
      category,
      quantity,
      unit_of_measurement,
      cost_per_unit,
      supplier,
      invoice_number,
      reorder_point,
      location_in_storage,
      shop_name,
      manufacturer,
      part_number,
      compatible_bus_models,
      minimum_order_quantity,
      lead_time,
      expiration_date,
      usage_rate,
      alternative_part_numbers,
      warranty_information,
      safety_stock_level,
      notes,
      criticality,
      current_status, // Automatically set status based on quantity
    });
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error:', error);
    res.status(400);
    throw new Error('Invalid inventory item data');
  }
});


/**
 * @desc    Update an existing inventory item
 * @route   PUT /api/servicing-inventory/:id
 * @access  private
 */
const updateInventoryItem = asyncHandler(async (req, res) => {
  const {
    item_name,
    category,
    quantity,
    unit_of_measurement,
    cost_per_unit,
    supplier,
    invoice_number,
    reorder_point,
    location_in_storage,
    shop_name,
    manufacturer,
    part_number,
    compatible_bus_models,
    minimum_order_quantity,
    lead_time,
    expiration_date,
    usage_rate,
    alternative_part_numbers,
    warranty_information,
    safety_stock_level,
    notes,
    criticality,
  } = req.body;

  const inventoryItem = await ServicingInventory.findByPk(req.params.id);

  if (!inventoryItem) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  inventoryItem.item_name = item_name || inventoryItem.item_name;
  inventoryItem.category = category || inventoryItem.category;
  inventoryItem.quantity = quantity || inventoryItem.quantity;
  inventoryItem.unit_of_measurement = unit_of_measurement || inventoryItem.unit_of_measurement;
  inventoryItem.cost_per_unit = cost_per_unit || inventoryItem.cost_per_unit;
  inventoryItem.supplier = supplier || inventoryItem.supplier;
  inventoryItem.invoice_number = invoice_number || inventoryItem.invoice_number;
  inventoryItem.reorder_point = reorder_point || inventoryItem.reorder_point;
  inventoryItem.location_in_storage = location_in_storage || inventoryItem.location_in_storage;
  inventoryItem.shop_name = shop_name || inventoryItem.shop_name;
  inventoryItem.manufacturer = manufacturer || inventoryItem.manufacturer;
  inventoryItem.part_number = part_number || inventoryItem.part_number;
  inventoryItem.compatible_bus_models = compatible_bus_models || inventoryItem.compatible_bus_models;
  inventoryItem.minimum_order_quantity = minimum_order_quantity || inventoryItem.minimum_order_quantity;
  inventoryItem.lead_time = lead_time || inventoryItem.lead_time;
  inventoryItem.expiration_date = expiration_date || inventoryItem.expiration_date;
  inventoryItem.usage_rate = usage_rate || inventoryItem.usage_rate;
  inventoryItem.alternative_part_numbers = alternative_part_numbers || inventoryItem.alternative_part_numbers;
  inventoryItem.warranty_information = warranty_information || inventoryItem.warranty_information;
  inventoryItem.safety_stock_level = safety_stock_level || inventoryItem.safety_stock_level;
  inventoryItem.notes = notes || inventoryItem.notes;
  inventoryItem.criticality = criticality || inventoryItem.criticality;

  // Recalculate status based on updated quantity
  if (quantity !== undefined) {
    if (quantity <= 0) {
      inventoryItem.current_status = 'out_of_stock';
    } else {
      inventoryItem.current_status = 'available';
    }
  }

  try {
    const updatedItem = await inventoryItem.save();
    res.json(updatedItem);
  } catch (error) {
    console.error('Error:', error);
    res.status(400);
    throw new Error('Invalid inventory item data');
  }
});


/**
 * @desc    Delete an inventory item
 * @route   DELETE /api/servicing-inventory/:id
 * @access  private
 */
const deleteInventoryItem = asyncHandler(async (req, res) => {
  const inventoryItem = await ServicingInventory.findByPk(req.params.id);

  if (!inventoryItem) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  await inventoryItem.destroy();
  res.status(204).end();
});


export {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};
