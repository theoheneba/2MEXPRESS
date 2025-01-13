import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';

import Staff from '../models/staffModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

/**
 * @desc    Create a new staff
 * @route   POST /api/staff
 * @access  private
 */
const createStaff = asyncHandler(async (req, res) => {
    const {
        user_id,
        name,
        email,
        phone,
        password,
        staff_no,
        status,       
        is_parcel_handler,
        is_ticket_handler,
        is_fleet_manager,
        is_mechanic,
        is_parking_attendant,
        is_manager,
        is_cleaner,
        is_washroom_attendant,
        is_security,
        is_general,
        description
    } = req.body;

    let userId = user_id;

    // Check if user exists or create a new one
    if (!userId) {
        if (!name || !email || !password) {
            res.status(400);
            throw new Error('Name, email, and password are required to create a new user');
        }

        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            res.status(400);
            throw new Error('User with this email already exists');
        }

        const newUser = await User.create({
            name,
            email,
            phone,
            password,
            role: 'staff',
        });

        userId = newUser.id;
    }

    const staff = await Staff.create({
        user_id: userId,
        staff_no,
        status,
        is_parcel_handler,
        is_ticket_handler,
        is_fleet_manager,
        is_mechanic,
        is_parking_attendant,
        is_manager,
        is_cleaner,
        is_washroom_attendant,
        is_security,
        is_general,
        description
    });

    await Notification.create({
        user_id: userId,
        subject: 'Welcome',
        message: `Your Staff profile has been created with name: ${name} and email: ${email}.`,
    });

    res.status(201).json(staff);
});

/**
 * @desc    Get all staff or search 
 * @route   GET /api/staff
 * @access  private
 */
const getStaff = asyncHandler(async (req, res) => {
    const { search } = req.query;
    let whereCondition = {};

    if (search) {
        whereCondition = {
            [Op.or]: [
                { '$User.name$': { [Op.like]: `%${search}%` } },
                { '$User.email$': { [Op.like]: `%${search}%` } },
                { staff_no: { [Op.like]: `%${search}%` } },
            ],
        };
    }

    const staffList = await Staff.findAll({
        include: [{ model: User, attributes: ['name', 'email', 'phone', 'role'] }],
        where: whereCondition,
        order: [['created_at', 'DESC']],
    });

    res.json(staffList);
});

/**
 * @desc    Get staff by ID
 * @route   GET /api/staff/:id
 * @access  private
 */
const getStaffByID = asyncHandler(async (req, res) => {
    const staff = await Staff.findByPk(req.params.id, {
        include: [{ model: User, attributes: ['name', 'email', 'phone', 'role'] }],
    });

    if (staff) {
        res.json(staff);
    } else {
        res.status(404);
        throw new Error('Staff not found');
    }
});

/**
 * @desc    Update staff
 * @route   PUT /api/staff/:id
 * @access  private
 */
const updateStaff = asyncHandler(async (req, res) => {
    const staff = await Staff.findByPk(req.params.id);

    if (staff) {
        const {
            staff_no,
            status,
            is_parcel_handler,
            is_ticket_handler,
            is_fleet_manager,
            is_mechanic,
            is_parking_attendant,
            is_manager,
            is_cleaner,
            is_washroom_attendant,
            is_security,
            is_general,
            description
        } = req.body;

        staff.staff_no = staff_no || staff.staff_no;
        staff.status = status || staff.status;
        staff.is_parcel_handler = is_parcel_handler ?? staff.is_parcel_handler;
        staff.is_ticket_handler = is_ticket_handler ?? staff.is_ticket_handler;
        staff.is_fleet_manager = is_fleet_manager ?? staff.is_fleet_manager;
        staff.is_mechanic = is_mechanic ?? staff.is_mechanic;
        staff.is_parking_attendant = is_parking_attendant ?? staff.is_parking_attendant;
        staff.is_manager = is_manager ?? staff.is_manager;
        staff.is_cleaner = is_cleaner ?? staff.is_cleaner;
        staff.is_washroom_attendant = is_washroom_attendant ?? staff.is_washroom_attendant;
        staff.is_security = is_security ?? staff.is_security;
        staff.is_general = is_general ?? staff.is_general;
        staff.description = description || staff.description;

        const updatedStaff = await staff.save();

        res.json(updatedStaff);
    } else {
        res.status(404);
        throw new Error('Staff not found');
    }
});

/**
 * @desc    Delete staff
 * @route   DELETE /api/staff/:id
 * @access  private
 */
const deleteStaff = asyncHandler(async (req, res) => {
    const staff = await Staff.findByPk(req.params.id);

    if (staff) {       
        await staff.destroy();
        res.status(204).end();
    } else {
        res.status(404);
        throw new Error('Staff not found');
    }
});

export {
    createStaff,
    getStaff,
    getStaffByID,
    updateStaff,
    deleteStaff,
};
