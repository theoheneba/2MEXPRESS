import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';

import connectDB from '../config/db.js';
import Ticket from '../models/ticketModel.js';
import Trip from '../models/tripModel.js';
import TripSeat from '../models/tripSeatModel.js';
import Bus from '../models/busModel.js';
import Route from '../models/routeModel.js';
import Stop from '../models/stopModel.js';
import User from '../models/userModel.js';
import PointsHistory from '../models/pointsHistoryModel.js';
import Notification from '../models/notificationModel.js';
import { sendTicketPurchaseEmail } from '../utils/sendEmail.js';
import { sendSMSV1 } from '../utils/sendArkeselSms.js';

const sequelize = await connectDB();


/**
 * @desc    Get all tickets or search 
 * @route   GET /api/tickets
 * @access  public
 */
const getTickets = asyncHandler(async (req, res) => {
    const { search } = req.query;
    let whereCondition = {};

    if (search) {
        whereCondition = {
            [Op.or]: [
                { ticket_number: { [Op.like]: `%${search}%` } },
                { '$User.name$': { [Op.like]: `%${search}%` } },
                { '$User.email$': { [Op.like]: `%${search}%` } },
            ],
        };
    }

    const tickets = await Ticket.findAll({
        include: [
            { 
                model: User,
                attributes: ['name', 'email', 'phone'], 
            },
            {
                model: Trip,
                attributes: ['route_id', 'trip_code'], 
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
                        model: Bus, 
                        attributes: ['name', 'model', 'bus_number', 'capacity', 'status'], 
                    },
                ],
            },
        ],
        where: whereCondition,
        order: [['created_at', 'DESC']],
    });

    res.json(tickets);
});


/**
 * @desc    Get single ticket by ID
 * @route   GET /api/tickets/:id
 * @access  public
 */
const getTicketById = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findByPk(req.params.id, {
        include: [
            { 
                model: User,
                attributes: ['name', 'email', 'phone'], 
            },
            {
                model: Trip,
                attributes: ['route_id', 'trip_code'], 
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
                        model: Bus, 
                        attributes: ['name', 'model', 'bus_number', 'capacity', 'status'], 
                    },
                ],
            },
        ],
    });

    if (ticket) {
        res.json(ticket);
    } else {
        res.status(404);
        throw new Error('Ticket not found');
    }
});


/**
 * @desc    Create a new ticket
 * @route   POST /api/tickets
 * @access  private
 */
const createTicket = asyncHandler(async (req, res) => {
    const { user_id, recipient_name, recipient_relationship, trip_id, stop_id, isPaid, isConfirmed, served_by, seat_number } = req.body;

    let trip = await Trip.findByPk(trip_id, {
        include: [{ model: Route, attributes: ['origin', 'destination', 'distance'] }],
        include: [{ model: Bus, attributes: ['name', 'model', 'bus_number',] }],
    });

    if (!trip) {
        res.status(404);
        throw new Error('Trip not found');
    }

    const seat = await TripSeat.findOne({ where: { trip_id, seat_number } });
    if (!seat || seat.status !== 'available') {
        res.status(400);
        throw new Error('Seat is not available for this trip');
    }

    const ticket = await Ticket.create({
        user_id,
        recipient_name,
        recipient_relationship,
        trip_id: trip.id,
        stop_id,
        isPaid,
        served_by,
        seat_number,
        status: 'confirmed',
        isConfirmed,
        ticket_type: 'walkin',
    });

    seat.status = 'reserved';
    await seat.save();

    const confirmedTicketsOnTrip = await Ticket.count({ where: { trip_id, status: 'confirmed' } });
    const busCapacity = await Bus.findByPk(trip.bus_id, { attributes: ['capacity'] });

    if (confirmedTicketsOnTrip >= busCapacity.capacity) {
        trip.status = 'fully_booked';
        await trip.save();

        const nextTrip = await Trip.findOne({
            where: {
                route_id: trip.route_id,
                embark_time: { [Op.gt]: trip.embark_time },
                status: 'scheduled',
            },
        });

        if (nextTrip) {
            nextTrip.status = 'available';
            await nextTrip.save();
        } else {
            res.status(400);
            throw new Error('No available trips for this route');
        }
    }

    if (ticket.isPaid) {
        await awardPoints(user_id, trip.id);
    }

    const { origin, destination } = trip.Route;
    const { bus_number } = trip.Bus; 

    await Notification.create({
        user_id,
        subject: 'Ticket Created',
        message: `Your ticket for the trip from ${origin} to ${destination} on bus ${bus_number}  has been created. Ticket Number: ${ticket.ticket_number}.`,
    });

    const user = await User.findByPk(user_id, { attributes: ['email', 'phone'] });
    const userEmail = user.email;
    const userPhone = user.phone;

    const ticketDetails = {
        ticketNumber: ticket.ticket_number,
        origin,
        destination,
        status: ticket.status,
        seat: ticket.seat_number,
        bus: bus_number,
    };

    await sendTicketPurchaseEmail(userEmail, ticketDetails);

    const smsMessage = `Your trip from : ${origin} to : ${destination} on bus ${bus_number} has been booked.\nTicket number: ${ticket.ticket_number}.\n\nComfortably Safe !`;
    await sendSMSV1({
        to: userPhone, 
        from: '2M Express', 
        sms: smsMessage,
    });

    res.status(201).json(ticket);
});


/**
 * @desc    Book a trip (creates an unpaid ticket)
 * @route   POST /api/tickets/book
 * @access  private
 */
const bookTrip = asyncHandler(async (req, res) => {
    const { user_id, recipient_name, recipient_relationship, trip_id, stop_id, preferred_seat } = req.body;

    // Fetch the trip along with the trip details
    const trip = await Trip.findByPk(trip_id, {
        include: [{ model: Route, attributes: ['origin', 'destination'] }],
        include: [{ model: Bus, attributes: ['name', 'model', 'bus_number',] }],
    });

    if (!trip) {
        res.status(404);
        throw new Error('Trip not found');
    }

    const ticket = await Ticket.create({
        user_id,
        recipient_name,
        recipient_relationship,
        trip_id: trip.id,
        stop_id,
        preferred_seat, 
        status: 'pending',  
        ticket_type: 'online',
    });

    const { origin, destination } = trip.Route;
    const { bus_number } = trip.Bus;

    await Notification.create({
        user_id,
        subject: 'Trip Booked',
        message: `Your trip from ${origin} to ${destination} on bus ${bus_number} has been booked pending confirmation. Your ticket number is ${ticket.ticket_number}.\n\nComfortably Safe !`,
    });

    const user = await User.findByPk(user_id, { attributes: ['email', 'phone'] });
    const userEmail = user.email;
    const userPhone = user.phone;

    const ticketDetails = {
        ticketNumber: ticket.ticket_number,
        origin,
        destination,
        status: ticket.status,
        bus: bus_number,
    };

    await sendTicketPurchaseEmail(userEmail, ticketDetails);

    const smsMessage = `Your trip from : ${origin} to  : ${destination} on bus ${bus_number} has been booked pending confirmation. Ticket number: ${ticket.ticket_number}.`;
    await sendSMSV1({
        to: userPhone, 
        from: '2M Express', 
        sms: smsMessage,
    });

    res.status(201).json(ticket);
});


/**
 * @desc    Update an existing ticket
 * @route   PUT /api/tickets/:id
 * @access  private
 */

const updateTicket = asyncHandler(async (req, res) => {
    const { user_id, recipient_name, recipient_relationship, trip_id, stop_id, status, isPaid,  isConfirmed, served_by, seat_number } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    let trip = await Trip.findByPk(trip_id, {
        include: [{ model: Route, attributes: ['origin', 'destination', 'distance'] }],
        include: [{ model: Bus, attributes: ['name', 'model', 'bus_number',] }],
    });

    if (!trip) {
        res.status(404);
        throw new Error('Trip not found');
    }

    const ticketsOnTrip = await Ticket.count({ where: { trip_id } });
    const busCapacity = await Bus.findByPk(trip.bus_id, { attributes: ['capacity'] });

    if (ticketsOnTrip >= busCapacity.capacity) {
        trip.status = 'fully_booked';
        await trip.save();

        const nextTrip = await Trip.findOne({
            where: {
                route_id: trip.route_id,
                embark_time: { [Op.gt]: trip.embark_time },
                status: 'scheduled',
            },
        });

        if (nextTrip) {
            nextTrip.status = 'available';
            await nextTrip.save();
        } else {
            res.status(400);
            throw new Error('No available trips for this route');
        }
    }

    if (ticket.seat_number !== seat_number) {
        const oldSeat = await TripSeat.findOne({ where: { trip_id, seat_number: ticket.seat_number } });
        if (oldSeat) {
            oldSeat.status = 'available';
            await oldSeat.save();
        }

        const newSeat = await TripSeat.findOne({ where: { trip_id, seat_number } });
        if (!newSeat || newSeat.status !== 'available') {
            res.status(400);
            throw new Error('New seat is not available for this trip');
        }

        ticket.seat_number = seat_number; 
        newSeat.status = 'reserved';
        await newSeat.save();
    }

    ticket.user_id = user_id || ticket.user_id;
    ticket.recipient_name = recipient_name || ticket.recipient_name;
    ticket.recipient_relationship = recipient_relationship || ticket.recipient_relationship;
    ticket.trip_id = trip.id || ticket.trip_id;
    ticket.stop_id = stop_id || ticket.stop_id;
    ticket.status = status || ticket.status;
    ticket.served_by = served_by || ticket.served_by;
    ticket.isPaid = isPaid !== undefined ? isPaid : ticket.isPaid;
    ticket.isConfirmed = isConfirmed !== undefined ? isConfirmed : ticket.isConfirmed;

    const wasPaidBefore = ticket.isPaid;
    const updatedTicket = await ticket.save();

    if (updatedTicket.isPaid && !wasPaidBefore) {
        await awardPoints(user_id, trip.id);
    }

    const { origin, destination } = trip.Route;
    const { bus_number } = trip.Bus;

    await Notification.create({
        user_id,
        subject: 'Ticket Updated',
        message: `Your ticket for the trip from ${origin} to ${destination} on bus ${bus_number} has been updated. Ticket Number: ${updatedTicket.ticket_number}, Seat Number: ${updatedTicket.seat_number}, Status: ${updatedTicket.status}.`,
    });

    const user = await User.findByPk(user_id, { attributes: ['email', 'phone'] });
    const userEmail = user.email;
    const userPhone = user.phone;

    const ticketDetails = {
        ticketNumber: ticket.ticket_number,
        origin,
        destination,
        status: ticket.status,
        seat: ticket.seat_number,
        bus: bus_number,
    };

    await sendTicketPurchaseEmail(userEmail, ticketDetails);

     const smsMessage = `Your trip from : ${origin} to : ${destination} on bus ${bus_number} has been updated.\nTicket number: ${ticket.ticket_number}.\n\nComfortably Safe !`;
     await sendSMSV1({
         to: userPhone, 
         from: '2M Express', 
         sms: smsMessage,
     });
 

    res.json(updatedTicket);
});


/**
 * @desc    Delete a ticket
 * @route   DELETE /api/tickets/:id
 * @access  private
 */
const deleteTicket = asyncHandler(async (req, res) => {
    try {
        const ticket = await Ticket.findByPk(req.params.id);
        if (!ticket) {
            res.status(404).json({ message: 'Ticket not found' });
            return;
        }

        const trip = await Trip.findByPk(ticket.trip_id);
        if (!trip) {
            res.status(404).json({ message: 'Trip not found' });
            return;
        }

        if (['embarked', 'completed'].includes(trip.status)) {
            res.status(400).json({ 
                message: `Cannot delete ticket; trip is already ${trip.status}.` 
            });
            return;
        }

        await TripSeat.update(
            { status: 'available' },
            { where: { trip_id: trip.id, seat_number: ticket.seat_number } }
        );

        await Ticket.destroy({ where: { id: ticket.id } });

        res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting ticket', error: error.message });
    }
});


/**
 * @desc    Get all tickets belonging to a user by user_id
 * @route   GET /api/tickets/user/:user_id
 * @access  private
 */
const getUserTickets = asyncHandler(async (req, res) => {
    const { user_id } = req.params;
    const { search } = req.query; 

    let whereCondition = {
        user_id,
    };

    if (search) {
        whereCondition = {
            ...whereCondition, 
            [Op.or]: [
                { ticket_number: { [Op.like]: `%${search}%` } },
                {
                    '$Trip.Route.origin$': {
                        [Op.like]: `%${search}%`,
                    },
                },
                {
                    '$Trip.Route.destination$': {
                        [Op.like]: `%${search}%`,
                    },
                },
            ],
        };
    }

    const tickets = await Ticket.findAll({
        where: whereCondition,
        include: [
            { 
                model: User,
                attributes: ['name', 'email', 'phone'], 
            },
            {
                model: Trip,
                attributes: ['route_id', 'bus_id', 'trip_code'], 
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
                        model: Bus, 
                        attributes: ['name', 'model', 'bus_number', 'capacity', 'status'], 
                    },
                ],
            },
        ],
        order: [['created_at', 'DESC']], 
    });

    res.json(tickets);
});


/**
 * @desc Update trip seats based on alighting stop and update trip status
 * @route PUT /api/tickets/trips/:trip_id/stops/:stop_id/update-seats
 * @access private
 */
const updateTripSeatsAtStop = asyncHandler(async (req, res) => {
    const { trip_id, stop_id } = req.params;

    const transaction = await sequelize.transaction(); 

    try {
        const ticketsAtStop = await Ticket.findAll({
            where: {
                trip_id,
                stop_id,
                status: 'confirmed', 
            },
            transaction,
        });

        if (ticketsAtStop.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'No passengers alighting at this stop.' });
        }

        const seatNumbers = ticketsAtStop.map(ticket => ticket.seat_number);
        await TripSeat.update(
            { status: 'available' },
            {
                where: {
                    trip_id,
                    seat_number: { [Op.in]: seatNumbers },
                },
                transaction,
            }
        );

        await Trip.update(
            { status: 'embarked_not_to_capacity' },
            { where: { id: trip_id }, transaction }
        );

        await transaction.commit(); 

        res.json({
            message: `Trip seats updated at stop ${stop_id}. Trip status set to embarked_not_to_capacity.`,
        });
    } catch (error) {
        await transaction.rollback(); 
        res.status(500).json({ message: 'An error occurred while updating trip seats.', error });
    }
});


/*
const updateTripSeatsAtStop = asyncHandler(async (req, res) => {
    const { trip_id, stop_id } = req.params;

    const ticketsAtStop = await Ticket.findAll({
        where: {
            trip_id,
            stop_id,
            status: 'confirmed' 
        },
    });

    if (ticketsAtStop.length === 0) {
        return res.status(404).json({ message: 'No passengers alighting at this stop.' });
    }

    const seatNumbers = ticketsAtStop.map(ticket => ticket.seat_number);
    await TripSeat.update(
        { status: 'available' },
        {
            where: {
                trip_id,
                seat_number: { [Op.in]: seatNumbers }
            }
        }
    );

    await Trip.update(
        { status: 'embarked_not_to_capacity' },
        { where: { id: trip_id } }
    );

    res.json({
        message: `Trip seats updated at stop ${stop_id}. Trip status set to embarked_not_to_capacity.`,
    });
}); 
*/


/**
 * @desc   Helper function to award points
*/
const awardPoints = async (user_id, trip_id) => {
    try {
        
        const trip = await Trip.findByPk(trip_id, {
            include: [{ model: Route, attributes: ['distance'] }],
        });

        if (!trip) {
            console.error(`Trip with ID ${trip_id} not found.`);
            return;
        }

        const distance = trip.Route?.distance;

        if (distance && typeof distance === 'number') {
            const points = Math.floor(distance / 25);

            console.log(`Calculated points for user ID ${user_id}: ${points}`);

            const user = await User.findByPk(user_id);

            if (user) {
                const newTotalPoints = (user.total_points || 0) + points;

                user.total_points = newTotalPoints;
                await user.save();

                await PointsHistory.create({
                    user_id,
                    type: 'award',
                    points,
                    description: `Points awarded for trip of ${distance} km`,
                });
                
                console.log(`Awarded ${points} points to user ID ${user_id}`);
            } else {
                console.error(`User with ID ${user_id} not found.`);
            }
        } else {
            console.error(`Invalid distance for trip ID ${trip_id}. Distance value: ${distance}`);
        }
    } catch (error) {
        console.error('Error awarding points:', error);
    }
};


export {
    getTickets,
    getTicketById,
    createTicket,
    bookTrip,
    updateTicket,
    deleteTicket,
    getUserTickets,
    updateTripSeatsAtStop,
};
