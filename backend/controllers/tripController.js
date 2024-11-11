import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';

import Trip from '../models/tripModel.js';
import Bus from '../models/busModel.js';
import Driver from '../models/driverModel.js';
import Route from '../models/routeModel.js';
import Parcel from '../models/parcelModel.js';
import Stop from '../models/stopModel.js';
import TripSeat from '../models/tripSeatModel.js';
import Ticket from '../models/ticketModel.js';
import User from '../models/userModel.js';
import { sendSMSV2 } from '../utils/sendArkeselSms.js';


/**
 * Generate a unique trip code
 */
const generateTripCode = async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const latestTrip = await Trip.findOne({
        order: [['created_at', 'DESC']],
        attributes: ['trip_code'],
    });

    const lastSeq = latestTrip ? parseInt(latestTrip.trip_code.split('-')[2]) : 0;
    const newSeq = lastSeq + 1;
    return `TRIP-${today}-${newSeq.toString().padStart(4, '0')}`;
};


/**
 * @desc Create seats for a trip based on bus capacity
 * @param {number} tripId - ID of the trip to associate seats with
 * @param {number} busCapacity - Number of seats to create for the trip
 */
const createTripSeats = async (tripId, busCapacity) => {
    const seats = Array.from({ length: busCapacity }, (_, index) => ({
        trip_id: tripId,
        seat_number: `ST${(index + 1).toString().padStart(2, '0')}`, 
        status: 'available',
    }));

    // Bulk create seats
    await TripSeat.bulkCreate(seats);
};


/**
 * @desc    Create a new trip
 * @route   POST /api/trips
 * @access  private
 */
const createTrip = asyncHandler(async (req, res) => {
    const { bus_id, driver_id, route_id, embark_time, status, isScheduled } = req.body;

    const bus = await Bus.findByPk(bus_id);
    const route = await Route.findByPk(route_id);
    const driver = await Driver.findByPk(driver_id);

    if (!bus || !route || !driver) {
        res.status(400);
        throw new Error('Invalid bus, route, or driver ID');
    }

    const conflictingTrips = await Trip.findAll({
        where: {
            [Op.and]: [
                { bus_id },
                { driver_id },
                { embark_time }, 
            ]
        }
    });

    if (conflictingTrips.length > 0) {
        res.status(400);
        throw new Error('The selected bus or driver is already assigned to another trip at this time.');
    }

    const tripCode = await generateTripCode();

    const trip = await Trip.create({
        bus_id,
        driver_id,
        route_id,
        trip_code: tripCode,
        embark_time,
        status,
        isScheduled: isScheduled || false, 
    });

    await createTripSeats(trip.id, bus.capacity);

    res.status(201).json({
        message: isScheduled ? 'Scheduled trip created successfully' : 'On-demand trip created successfully',
        trip
    });
});


/**
 * @desc    Get all trips or search
 * @route   GET /api/trips
 * @access  private
 */
const getTrips = asyncHandler(async (req, res) => {
    try {
        const { search } = req.query;
        let whereCondition = {};

        if (search) {
            whereCondition = {
                [Op.or]: [
                    { trip_code: { [Op.like]: `%${search}%` } },
                    { '$Bus.bus_number$': { [Op.like]: `%${search}%` } },
                    { '$Route.origin$': { [Op.like]: `%${search}%` } },
                    { '$Route.destination$': { [Op.like]: `%${search}%` } },
                    { '$Driver.User.name$': { [Op.like]: `%${search}%` } },
                    { '$Driver.User.email$': { [Op.like]: `%${search}%` } },
                ],
            };
        }

        const trips = await Trip.findAll({
            include: [
                { model: Bus, attributes: ['name', 'model', 'bus_number', 'capacity', 'status'] },
                { model: Driver, attributes: ['license_number', 'status'], include: [{ model: User, attributes: ['name', 'email', 'phone'] }] },
                {
                    model: Route,
                    attributes: ['origin', 'destination', 'distance', 'duration'],
                    include: [
                        {
                            model: Stop,
                            as: 'stops',
                            attributes: ['id','stop_name', 'price'],
                        },
                    ],
                },
                { model: TripSeat, attributes: ['seat_number', 'status'], as: 'seats' }, 
            ],
            where: whereCondition,
            order: [['embark_time', 'DESC']],
        });

        const tripsWithDetails = await Promise.all(trips.map(async (trip) => {
            const tickets = await Ticket.findAll({
                where: { trip_id: trip.id },
                include: [{ model: User, attributes: ['name', 'email', 'phone'] }],
            });

            return {
                ...trip.toJSON(),
                tickets,
                ticketCount: tickets.length
            };
        }));

        res.json(tripsWithDetails);
    } catch (error) {
        console.error('Error fetching trips:', error.message);

        res.status(500).json({
            message: 'An error occurred while fetching trips',
            error: error.message,
        });
    }
});


/**
 * @desc    Get single trip by ID
 * @route   GET /api/trips/:id
 * @access  public
 */
const getTripById = asyncHandler(async (req, res) => {
    try {
        const trip = await Trip.findByPk(req.params.id, {
            include: [
                { model: Bus, attributes: ['name', 'model', 'bus_number', 'capacity', 'status'] },
                { model: Driver, attributes: ['license_number', 'status'], include: [{ model: User, attributes: ['name', 'email', 'phone'] }]},
                {
                    model: Route,
                    attributes: ['origin', 'destination', 'distance', 'duration'],
                    include: [
                        {
                            model: Stop,
                            as: 'stops',
                            attributes: ['id','stop_name', 'price'],
                        },
                    ],
                },
                { model: TripSeat, attributes: ['seat_number', 'status'], as: 'seats' },
            ],
        });

        if (!trip) {
            res.status(404);
            throw new Error('Trip not found');
        }

        const tickets = await Ticket.findAll({
            where: { trip_id: trip.id },
            include: [{ 
                model: User, 
                attributes: ['name', 'email', 'phone'] 
            }],
            attributes: [
                'ticket_number', 
                'isPaid', 
                'recipient_name',  
                'recipient_relationship',  
                'status'
            ],
        });

        const tripWithTickets = {
            ...trip.toJSON(),  
            tickets,
            ticketCount: tickets.length
        };

        res.json(tripWithTickets);
    } catch (error) {
        console.error('Error fetching trip:', error.message);

        res.status(500).json({
            message: 'An error occurred while fetching the trip',
            error: error.message,
        });
    }
});


/**
 * @desc    Update an existing trip
 * @route   PUT /api/trips/:id
 * @access  private
 */
const updateTrip = asyncHandler(async (req, res) => {
    const { bus_id, driver_id, route_id, embark_time, status } = req.body;
    const trip = await Trip.findByPk(req.params.id);

    if (trip) {
        const previousStatus = trip.status;

        trip.bus_id = bus_id || trip.bus_id;
        trip.driver_id = driver_id || trip.driver_id;
        trip.route_id = route_id || trip.route_id;
        trip.embark_time = embark_time || trip.embark_time;
        trip.status = status || trip.status;

        if (bus_id && bus_id !== trip.bus_id) {
            const bus = await Bus.findByPk(bus_id);

            if (!bus) {
                res.status(400);
                throw new Error('Invalid bus ID');
            }

            const currentTripCount = await Trip.count({ where: { bus_id } });

            if (currentTripCount >= bus.capacity) {
                trip.status = 'fully_booked';
                res.status(400);
                throw new Error('Bus capacity exceeded');
            }

            await TripSeat.destroy({ where: { trip_id: trip.id } });

            await createTripSeats(trip.id, bus.capacity);
        }

        const updatedTrip = await trip.save();

        if (previousStatus !== updatedTrip.status && (updatedTrip.status === 'embarked' || updatedTrip.status === 'completed')) {
            
            const tickets = await Ticket.findAll({
                where: { trip_id: updatedTrip.id },
                include: [{ model: User, attributes: ['phone'] }],
            });
           
            const phoneNumbers = [...new Set(tickets.map(ticket => ticket.User.phone))];
          
            const smsMessage = `Trip Status Update: The trip with code ${updatedTrip.trip_code} has now been ${updatedTrip.status}. Thank you for choosing us!`;
            
            await sendSMSV2({
                sender: "Arkesel",
                message: smsMessage,
                recipients: phoneNumbers,
            });
        }

        res.json({
            message: `Trip updated successfully to status: ${updatedTrip.status}`,
            trip: updatedTrip,
        });
    } else {
        res.status(404);
        throw new Error('Trip not found');
    }
});


/**
 * @desc    Delete a trip
 * @route   DELETE /api/trips/:id
 * @access  private
 */
const deleteTrip = asyncHandler(async (req, res) => {
    const trip = await Trip.findByPk(req.params.id);

    if (trip) {
        await TripSeat.destroy({ where: { trip_id: trip.id } });

        await trip.destroy();

        res.status(204).end();
    } else {
        res.status(404);
        throw new Error('Trip not found');
    }
});


/**
 * @desc    Get all trips for a user
 * @route   GET /api/trips/user/:user_id
 * @access  private
 */
const getUserTrips = asyncHandler(async (req, res) => {
    const { user_id } = req.params;

    const tickets = await Ticket.findAll({ where: { user_id } });
    const tripIds = tickets.map(ticket => ticket.trip_id);

    const trips = await Trip.findAll({
        where: { id: tripIds },
        include: [
            { model: Bus, attributes: ['name', 'model', 'bus_number', 'capacity', 'status'] },
            { model: Driver, attributes: ['license_number', 'status'], include: [{ model: User, attributes: ['name', 'email', 'phone'] }]},
            {
                model: Route,
                attributes: ['origin', 'destination', 'distance', 'duration'],
                include: [
                    {
                        model: Stop,
                        as: 'stops',
                        attributes: ['id','stop_name', 'price'],
                    },
                ],
            },
            { model: Ticket, attributes: ['ticket_number', 'isPaid'], include: [{ model: User, attributes: ['name', 'email', 'phone'] }] },
        ],
    });

    res.json(trips);
});


/**
 * @desc    Get trips by route with date range
 * @route   GET /api/trips/route/:route_id
 * @access  public
 */
const getTripsByRoute = asyncHandler(async (req, res) => {
    const { route_id } = req.params;
    const { start_date, end_date } = req.query;
    
    let whereCondition = { route_id };
  
    if (start_date && end_date) {
        whereCondition.embark_time = { [Op.between]: [start_date, end_date] };
    }
  
    const trips = await Trip.findAll({
        where: whereCondition,
        order: [['embark_time', 'DESC']],
        include: [
            { model: Bus, attributes: ['name', 'model', 'bus_number', 'capacity', 'status'] },
            { model: Driver, attributes: ['license_number', 'status'], include: [{ model: User, attributes: ['name', 'email', 'phone'] }]},
            {
                model: Route,
                attributes: ['origin', 'destination', 'distance', 'duration'],
                include: [
                    {
                        model: Stop,
                        as: 'stops',
                        attributes: ['id','stop_name', 'price'],
                    },
                ],
            },
            { model: Ticket, attributes: ['ticket_number', 'isPaid'], include: [{ model: User, attributes: ['name', 'email', 'phone'] }] },
        ],
    });
  
    res.json(trips);
});


/**
 * @desc    Get all parcels for a particular trip 
 * @route   GET /api/trips/:trip_id/parcels
 * @access  public
 */
const getParcelsForTrip = asyncHandler(async (req, res) => {
    const { trip_id } = req.params;

    const parcels = await Parcel.findAll({
        where: { trip_id },
        include: [
            {
                model: Trip,
                include: [
                    { model: Bus, attributes: ['name', 'model', 'bus_number', 'capacity', 'status'] },
                    {
                        model: Driver,
                        attributes: ['license_number', 'status'],
                        include: [{ model: User, attributes: ['name', 'email', 'phone'] }]
                    },
                    {
                        model: Route,
                        attributes: ['origin', 'destination', 'distance', 'duration'],
                        include: [
                            {
                                model: Stop,
                                as: 'stops',
                                attributes: ['id','stop_name', 'price'],
                            },
                        ],
                    },
                ],
                attributes: ['trip_code', 'embark_time']
            },
            {
                model: User, 
                attributes: ['name', 'email', 'phone'] 
            }
        ],
        order: [['created_at', 'DESC']],
    });

    if (parcels) {
        res.json(parcels);
    } else {
        res.status(404);
        throw new Error('Parcels not found for this trip');
    }
});


/**
 * @desc    Get all trips for a specific bus
 * @route   GET /api/trips/bus/:bus_id
 * @access  public
 */
const getTripsForBus = asyncHandler(async (req, res) => {
    const { bus_id } = req.params;

    try {
        const trips = await Trip.findAll({
            where: { bus_id },
            include: [
                {
                    model: Route,
                    attributes: ['origin', 'destination', 'distance', 'duration'],
                    include: [
                        {
                            model: Stop,
                            as: 'stops',
                            attributes: ['id','stop_name', 'price'],
                        },
                    ],
                },
                {
                    model: Driver,
                    attributes: ['license_number', 'status'],
                    include: [{ model: User, attributes: ['name', 'email', 'phone'] }]
                },
                { model: TripSeat, attributes: ['seat_number', 'status'], as: 'seats' },
            ],
            order: [['embark_time', 'DESC']],
        });

        if (trips.length === 0) {
            return res.status(404).json({ message: 'No trips found for this bus' });
        }

        const tripsWithDetails = await Promise.all(trips.map(async (trip) => {
            const tickets = await Ticket.findAll({
                where: { trip_id: trip.id },
                include: [{ model: User, attributes: ['name', 'email', 'phone'] }],
            });

            return {
                ...trip.toJSON(),
                tickets,
                ticketCount: tickets.length,
            };
        }));

        res.json(tripsWithDetails);

    } catch (error) {
        console.error("Error fetching trips for bus:", error);
        res.status(500).json({ message: error.message });
    }
});


export {
    createTrip,
    getTrips,
    getTripById,    
    updateTrip,
    deleteTrip,
    getUserTrips,
    getTripsByRoute,
    getParcelsForTrip,
    getTripsForBus,
};
