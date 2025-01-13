import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';

import FleetManagement from '../models/fleetManagementModel.js';

/**
 * @desc    Get all fleet management records or search by status
 * @route   GET /api/fleet_management
 * @access  public
 */
const getFleetManagements = asyncHandler(async (req, res) => {
    const { search } = req.query;
    let whereCondition = {};

    if (search) {
        whereCondition = {
            [Op.or]: [
                { status: { [Op.like]: `%${search}%` } },
                { '$Bus.name$': { [Op.like]: `%${search}%` } },
                { '$Bus.model$': { [Op.like]: `%${search}%` } },
                { '$Route.origin$': { [Op.like]: `%${search}%` } },
                { '$Route.destination$': { [Op.like]: `%${search}%` } },
            ],
        };
    }

    const fleetManagements = await FleetManagement.findAll({
        include: [
            {
                model: Bus,
                attributes: ['name', 'model'],
            },
            {
                model: Driver,
                attributes: ['id'],
            },
            {
                model: Route,
                attributes: ['origin', 'destination'],
            },
        ],
        where: whereCondition,
        order: [['created_at', 'DESC']],
    });

    res.json(fleetManagements);
});

/**
 * @desc    Get single fleet management record by ID
 * @route   GET /api/fleet_management/:id
 * @access  public
 */
const getFleetManagementById = asyncHandler(async (req, res) => {
    const fleetManagement = await FleetManagement.findByPk(req.params.id);

    if (fleetManagement) {
        res.json(fleetManagement);
    } else {
        res.status(404);
        throw new Error('Fleet management record not found');
    }
});

/**
 * @desc    Create a new fleet management record
 * @route   POST /api/fleet_management
 * @access  private
 */
const createFleetManagement = asyncHandler(async (req, res) => {
    const { bus_id, route_id, driver_id, schedule_date, status } = req.body;

    const fleetManagement = await FleetManagement.create({
        bus_id,
        route_id,
        driver_id,
        schedule_date,
        status,
    });

    if (fleetManagement) {
        res.status(201).json(fleetManagement);
    } else {
        res.status(400);
        throw new Error('Invalid fleet management data');
    }
});

/**
 * @desc    Update an existing fleet management record
 * @route   PUT /api/fleet_management/:id
 * @access  private
 */
const updateFleetManagement = asyncHandler(async (req, res) => {
    const { bus_id, route_id, driver_id, schedule_date, status } = req.body;
    const fleetManagement = await FleetManagement.findByPk(req.params.id);

    if (fleetManagement) {
        fleetManagement.bus_id = bus_id || fleetManagement.bus_id;
        fleetManagement.route_id = route_id || fleetManagement.route_id;
        fleetManagement.driver_id = driver_id || fleetManagement.driver_id;
        fleetManagement.schedule_date = schedule_date || fleetManagement.schedule_date;
        fleetManagement.status = status || fleetManagement.status;

        const updatedFleetManagement = await fleetManagement.save();
        res.json(updatedFleetManagement);
    } else {
        res.status(404);
        throw new Error('Fleet management record not found');
    }
});

/**
 * @desc    Delete a fleet management record
 * @route   DELETE /api/fleet_management/:id
 * @access  private
 */
const deleteFleetManagement = asyncHandler(async (req, res) => {
    const fleetManagement = await FleetManagement.findByPk(req.params.id);

    if (fleetManagement) {
        await fleetManagement.destroy();
        res.status(204).end();
    } else {
        res.status(404);
        throw new Error('Fleet management record not found');
    }
});

export {
    getFleetManagements,
    getFleetManagementById,
    createFleetManagement,
    updateFleetManagement,
    deleteFleetManagement,
};
