import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';

import Route from '../models/routeModel.js';
import Stop from '../models/stopModel.js';


/**
 * @desc    Get all routes or search routes by origin, destination, and stops
 * @route   GET /api/routes
 * @access  public
 */
const getRoutes = asyncHandler(async (req, res) => {
    const { search } = req.query;
    let whereCondition = {};

    if (search) {
        whereCondition = {
            [Op.or]: [
                { origin: { [Op.like]: `%${search}%` } },
                { destination: { [Op.like]: `%${search}%` } },
                { '$stops.stop_name$': { [Op.like]: `%${search}%` } },
            ],
        };
    }

    const routes = await Route.findAll({
        where: whereCondition,
        include: {
            model: Stop,
            as: 'stops',
            required: false,
        },
        order: [['created_at', 'DESC']],
    });

    res.json(routes);
});


/**
 * @desc    Get single route by ID
 * @route   GET /api/routes/:id
 * @access  public
 */
const getRouteById = asyncHandler(async (req, res) => {
    const route = await Route.findByPk(req.params.id, {
        include: { model: Stop, as: 'stops' }
    });

    if (route) {
        res.json(route);
    } else {
        res.status(404);
        throw new Error('Route not found');
    }
});


/**
 * @desc    Create a new route
 * @route   POST /api/routes
 * @access  private
 */
const createRoute = asyncHandler(async (req, res) => {
    const { origin, destination, distance, duration, stops } = req.body;

    const route = await Route.create({
        origin,
        destination,
        distance,
        duration,
    });

    if (route && stops && stops.length > 0) {
        const stopData = stops.map(stop => ({ ...stop, route_id: route.id }));
        await Stop.bulkCreate(stopData);
    }

    const newRoute = await Route.findByPk(route.id, { include: { model: Stop, as: 'stops' } });

    if (newRoute) {
        res.status(201).json(newRoute);
    } else {
        res.status(400);
        throw new Error('Invalid route data');
    }
});


/**
 * @desc    Update an existing route
 * @route   PUT /api/routes/:id
 * @access  private
 */
const updateRoute = asyncHandler(async (req, res) => {
    const { origin, destination, distance, duration, stops } = req.body;
    const route = await Route.findByPk(req.params.id);

    if (route) {
        route.origin = origin || route.origin;
        route.destination = destination || route.destination;
        route.distance = distance || route.distance;
        route.duration = duration || route.duration;

        await route.save();

        if (stops && stops.length > 0) {
            await Stop.destroy({ where: { route_id: route.id } });
            const stopData = stops.map(stop => ({ ...stop, route_id: route.id }));
            await Stop.bulkCreate(stopData);
        }

        const updatedRoute = await Route.findByPk(route.id, { include: { model: Stop, as: 'stops' } });

        res.json(updatedRoute);
    } else {
        res.status(404);
        throw new Error('Route not found');
    }
});


/**
 * @desc    Delete a route
 * @route   DELETE /api/routes/:id
 * @access  private
 */
const deleteRoute = asyncHandler(async (req, res) => {
    const route = await Route.findByPk(req.params.id);

    if (route) {
        await Stop.destroy({ where: { route_id: route.id } });
        await route.destroy();
        res.status(204).end();
    } else {
        res.status(404);
        throw new Error('Route not found');
    }
});


/**
 * @desc    Get all stops for a specific route
 * @route   GET /api/routes/:route_id/stops
 * @access  public
 */
const getStopsByRoute = asyncHandler(async (req, res) => {
    const { route_id } = req.params;
    const { search } = req.query;

    let whereCondition = { route_id };

    if (search) {
        whereCondition.stop_name = { [Op.like]: `%${search}%` };
    }

    const stops = await Stop.findAll({
        where: whereCondition,
        order: [['created_at', 'DESC']],
    });

    res.json(stops);
});


/**
 * @desc    Create a new stop for a specific route
 * @route   POST /api/routes/:route_id/stops
 * @access  private
 */
const createStop = asyncHandler(async (req, res) => {
    const { route_id } = req.params;
    const { stop_name, price } = req.body;

    const stop = await Stop.create({
        route_id,
        stop_name,
        price,
    });

    if (stop) {
        res.status(201).json(stop);
    } else {
        res.status(400);
        throw new Error('Invalid stop data');
    }
});

/**
 * @desc    Update an existing stop
 * @route   PUT /api/routes/stops/:id
 * @access  private
 */
const updateStop = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { stop_name, price } = req.body;

    const stop = await Stop.findByPk(id);

    if (stop) {
        stop.stop_name = stop_name || stop.stop_name;
        stop.price = price || stop.price;
        const updatedStop = await stop.save();
        res.json(updatedStop);
    } else {
        res.status(404);
        throw new Error('Stop not found');
    }
});


/**
 * @desc    Delete a stop
 * @route   DELETE /api/routes/stops/:id
 * @access  private
 */
const deleteStop = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const stop = await Stop.findByPk(id);

    if (stop) {
        await stop.destroy();
        res.status(204).end();
    } else {
        res.status(404);
        throw new Error('Stop not found');
    }
});


export {
    getRoutes,
    getRouteById,
    createRoute,
    updateRoute,
    deleteRoute,
    getStopsByRoute,
    createStop,
    updateStop,
    deleteStop,
};
