import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';

import Parcel from '../models/parcelModel.js';
import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';
import Trip from '../models/tripModel.js';
import Route from '../models/routeModel.js';
import { sendParcelEmail } from '../utils/sendEmail.js';
import { sendSMSV1 } from '../utils/sendArkeselSms.js';


/**
 * @desc    Get all parcels or search 
 * @route   GET /api/parcels
 * @access  public
 */
const getParcels = asyncHandler(async (req, res) => {
    const { search } = req.query;
    let whereCondition = {};

    if (search) {
        whereCondition = {
            [Op.or]: [
                { tracking_number: { [Op.like]: `%${search}%` } },
                { status: { [Op.like]: `%${search}%` } },
                { '$User.name$': { [Op.like]: `%${search}%` } },
                { '$User.email$': { [Op.like]: `%${search}%` } },
                { '$Trip.route.origin$': { [Op.like]: `%${search}%` } },
                { '$Trip.route.destination$': { [Op.like]: `%${search}%` } },
            ],
        };
    }

    const parcels = await Parcel.findAll({
        include: [
            { 
                model: User,
                attributes: ['name', 'email', 'phone'], 
            },
            {
                model: Trip,
                attributes: ['route_id'],
                include: [
                    {
                        model: Route,
                        attributes: ['origin', 'destination', 'distance'],
                    }
                ]
            },
        ],
        where: whereCondition,
        order: [['created_at', 'DESC']],
    });

    res.json(parcels);
});


/**
 * @desc    Get single parcel by ID
 * @route   GET /api/parcels/:id
 * @access  public
 */
const getParcelById = asyncHandler(async (req, res) => {
    const parcel = await Parcel.findByPk(req.params.id, {
        include: [
            { 
                model: User,
                attributes: ['name', 'email', 'phone'], 
            },
            {
                model: Trip,
                attributes: ['route_id'],
                include: [
                    {
                        model: Route,
                        attributes: ['origin', 'destination', 'distance'],
                    }
                ]
            },
        ],
    });

    if (parcel) {
        res.json(parcel);
    } else {
        res.status(404);
        throw new Error('Parcel not found');
    }
});


/**
 * @desc    Create a new parcel
 * @route   POST /api/parcels
 * @access  private
 */
const createParcel = asyncHandler(async (req, res) => {
    const {
        user_id,
        trip_id,
        description,
        size,
        weight,
        delivery_timing,
        price,
        status,
        receiver_name,
        receiver_phone,
        receiver_email,
        parcel_value,
        served_by,
    } = req.body;

    const parcel = await Parcel.create({
        user_id,
        trip_id,
        description,
        size,
        weight,
        delivery_timing,
        price,
        status,
        receiver_name,
        receiver_phone,
        receiver_email,
        parcel_value,
        served_by,
    });

    if (parcel) {        
        const trip = await Trip.findByPk(trip_id, {
            include: [
                {
                    model: Route,
                    attributes: ['origin', 'destination'],
                },
            ],
        });

        if (trip) {
            const { origin, destination } = trip.Route;

            await Notification.create({
                user_id,
                subject: 'Parcel Created',
                message: `Your parcel with tracking number ${parcel.tracking_number} has been created. Origin: ${origin}, Destination: ${destination}, Status: ${parcel.status}.`,
            });

            await sendParcelEmail(req.user.email, {
                tracking_number: parcel.tracking_number,
                description,
                size,
                weight,
                delivery_timing,
                status,
                origin,
                destination,
            });

            await sendParcelEmail(receiver_email, {
                tracking_number: parcel.tracking_number,
                description,
                size,
                weight,
                delivery_timing,
                status,
                origin,
                destination,
                receiver_name,
            });

            const senderSMSMessage = `Your parcel with tracking number ${parcel.tracking_number} has been created. Origin: ${origin}. Destination: ${destination}. Status: ${parcel.status}.`;
            await sendSMSV1({
                to: req.user.phone, 
                from: '2M Express', 
                sms: senderSMSMessage,
            });

            const receiverSMSMessage = `You will receive a parcel with tracking number ${parcel.tracking_number}. Origin: ${origin}. Destination: ${destination}. Status: ${parcel.status}.`;
            await sendSMSV1({
                to: receiver_phone, 
                from: '2M Express',
                sms: receiverSMSMessage,
            });

            res.status(201).json(parcel);
        } else {
            res.status(404);
            throw new Error('Trip not found');
        }
    } else {
        res.status(400);
        throw new Error('Invalid parcel data');
    }
});


/**
 * @desc    Update an existing parcel
 * @route   PUT /api/parcels/:id
 * @access  private
 */
const updateParcel = asyncHandler(async (req, res) => {
    const { user_id, trip_id, description, size, weight, delivery_timing, price, status, receiver_name, receiver_phone, receiver_email, parcel_value, served_by } = req.body;
    const parcel = await Parcel.findByPk(req.params.id);

    if (parcel) {
        // Store the original status for comparison
        const previousStatus = parcel.status;

        // Update parcel details
        parcel.user_id = user_id || parcel.user_id;
        parcel.trip_id = trip_id || parcel.trip_id;
        parcel.description = description || parcel.description;
        parcel.size = size || parcel.size;
        parcel.weight = weight || parcel.weight;
        parcel.delivery_timing = delivery_timing || parcel.delivery_timing;
        parcel.price = price || parcel.price;
        parcel.status = status || parcel.status;
        parcel.receiver_name = receiver_name || parcel.receiver_name;
        parcel.receiver_phone = receiver_phone || parcel.receiver_phone;
        parcel.receiver_email = receiver_email || parcel.receiver_email;
        parcel.parcel_value = parcel_value || parcel.parcel_value;
        parcel.served_by = served_by || parcel.served_by;

        const updatedParcel = await parcel.save();

        // Fetch the Trip and Route information
        const trip = await Trip.findByPk(parcel.trip_id, {
            include: [
                {
                    model: Route,
                    attributes: ['origin', 'destination'],
                }
            ]
        });

        if (trip) {
            const { origin, destination } = trip.Route;

            await Notification.create({
                user_id: parcel.user_id,
                subject: 'Parcel Updated',
                message: `Your parcel with tracking number ${updatedParcel.tracking_number} has been updated. Origin: ${origin}, Destination: ${destination}, Status: ${updatedParcel.status}.`,
            });

            await sendParcelEmail(parcel.User.email, {
                tracking_number: updatedParcel.tracking_number,
                status: updatedParcel.status,
                description: updatedParcel.description,
                delivery_timing: updatedParcel.delivery_timing,
                receiver_name: updatedParcel.receiver_name,
                receiver_phone: updatedParcel.receiver_phone,
                receiver_email: updatedParcel.receiver_email,
            });

            await sendParcelEmail(updatedParcel.receiver_email, {
                tracking_number: updatedParcel.tracking_number,
                status: updatedParcel.status,
                description: updatedParcel.description,
                delivery_timing: updatedParcel.delivery_timing,
                sender_name: parcel.User.name,
                sender_email: parcel.User.email,
            });

            const senderSMSMessage = `Your parcel with tracking number ${updatedParcel.tracking_number} has been updated. Origin: ${origin}. Destination: ${destination}. Status: ${updatedParcel.status}.`;
            await sendSMSV1({
                to: parcel.User.phone, 
                from: '2M Express', 
                sms: senderSMSMessage,
            });

            const receiverSMSMessage = `Your parcel with tracking number ${updatedParcel.tracking_number} has been updated. Origin: ${origin}. Destination: ${destination}. Status: ${updatedParcel.status}.`;
            await sendSMSV1({
                to: updatedParcel.receiver_phone, 
                from: '2M Express', 
                sms: receiverSMSMessage,
            });

            res.json(updatedParcel);
        } else {
            res.status(404);
            throw new Error('Trip not found');
        }
    } else {
        res.status(404);
        throw new Error('Parcel not found');
    }
});


/**
 * @desc    Delete a parcel
 * @route   DELETE /api/parcels/:id
 * @access  private
 */
const deleteParcel = asyncHandler(async (req, res) => {
    const parcel = await Parcel.findByPk(req.params.id);

    if (parcel) {
        await parcel.destroy();
        res.status(204).end();
    } else {
        res.status(404);
        throw new Error('Parcel not found');
    }
});


/**
 * @desc    Get all parcels belonging to a user by user_id
 * @route   GET /api/parcels/user/:user_id
 * @access  private
 */
const getUserParcels = asyncHandler(async (req, res) => {
    const { user_id } = req.params;
    const { search } = req.query;

    let whereCondition = { user_id };  

    if (search) {
        whereCondition = {
            ...whereCondition,  
            [Op.or]: [
                { tracking_number: { [Op.like]: `%${search}%` } }, 
                { '$Trip.route.origin$': { [Op.like]: `%${search}%` } }, 
                { '$Trip.route.destination$': { [Op.like]: `%${search}%` } }
            ],
        };
    }

    const parcels = await Parcel.findAll({
        where: whereCondition,
        include: [
            { 
                model: User,
                attributes: ['name', 'email', 'phone'], 
            },
            {
                model: Trip,
                attributes: ['route_id'],
                include: [
                    {
                        model: Route,
                        attributes: ['origin', 'destination', 'distance'],
                    }
                ]
            },
        ],
        order: [['created_at', 'DESC']],
    });

    res.json(parcels);
});


export {
    getParcels,
    getParcelById,
    createParcel,
    updateParcel,
    deleteParcel,
    getUserParcels,
};
