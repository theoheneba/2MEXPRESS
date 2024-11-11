import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';

import Bus from '../models/busModel.js';


/**
 * @desc    Get all buses or search 
 * @route   GET /api/buses
 * @access  public
 */
const getBuses = asyncHandler(async (req, res) => {
    const { search } = req.query;
    let whereCondition = {};

    if (search) {
        whereCondition = {
            [Op.or]: [
                { bus_number: { [Op.like]: `%${search}%` } },
                { name: { [Op.like]: `%${search}%` } },
                { model: { [Op.like]: `%${search}%` } },
                { status: { [Op.like]: `%${search}%` } },
            ],
        };
    }

    const buses = await Bus.findAll({
        where: whereCondition,        
        order: [['created_at', 'DESC']],  
    });

    res.json(buses);
});


/**
 * @desc    Get single bus by ID
 * @route   GET /api/buses/:id
 * @access  public
 */
const getBusById = asyncHandler(async (req, res) => {
    const bus = await Bus.findByPk(req.params.id);

    if (bus) {
        res.json(bus);
    } else {
        res.status(404);
        throw new Error('Bus not found');
    }
});


/**
 * @desc    Create a new bus
 * @route   POST /api/buses
 * @access  private/admin
 */
const createBus = asyncHandler(async (req, res) => {
    const { bus_number, name, model, capacity, status } = req.body;

    if (!bus_number || !name || !model || !capacity || !status) {
        res.status(400);
        throw new Error('All fields are required');
    }

    try {
        const bus = await Bus.create({ bus_number, name, model, capacity, status });
        res.status(201).json(bus);
    } catch (error) {
        res.status(400);
        throw new Error('Invalid bus data');
    }
});


/**
 * @desc    Update an existing bus
 * @route   PUT /api/buses/:id
 * @access  private/admin
 */
const updateBus = asyncHandler(async (req, res) => {
    const { bus_number, name, model, capacity, status } = req.body;
    const bus = await Bus.findByPk(req.params.id);

    if (bus) {
        bus.bus_number = bus_number || bus.bus_number;
        bus.name = name || bus.name;
        bus.model = model || bus.model;
        bus.capacity = capacity || bus.capacity;
        bus.status = status || bus.status;

        const updatedBus = await bus.save();
        res.json(updatedBus);
    } else {
        res.status(404);
        throw new Error('Bus not found');
    }
});


/**
 * @desc    Delete a bus
 * @route   DELETE /api/buses/:id
 * @access  private/admin
 */
const deleteBus = asyncHandler(async (req, res) => {
    const bus = await Bus.findByPk(req.params.id);

    if (bus) {
        await bus.destroy();
        res.status(204).end();
    } else {
        res.status(404);
        throw new Error('Bus not found');
    }
});


export {
    getBuses,
    getBusById,
    createBus,
    updateBus,
    deleteBus,
};
