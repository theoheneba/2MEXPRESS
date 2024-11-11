import asyncHandler from 'express-async-handler';
import cron from 'cron';
import { Op } from 'sequelize';

import Driver from '../models/driverModel.js';
import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';


/**
 * @desc    Create a new driver
 * @route   POST /api/drivers
 * @access  private
 */
const createDriver = asyncHandler(async (req, res) => {
    const { user_id, driver_no, license_number, license_expiry, status, name, email, phone, password } = req.body;

    const driverExists = await Driver.findOne({ where: { license_number } });

    if (driverExists) {
        res.status(400);
        throw new Error('Driver already exists');
    }

    let userId = user_id;

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
            role: 'driver',
        });

        userId = newUser.id;
    }

    const driver = await Driver.create({
        user_id: userId,
        driver_no,
        license_number,
        license_expiry,
        status,
    });

    await Notification.create({
        user_id: userId,
        subject: 'Driver Created',
        message: `A new driver has been created with license number ${license_number}. Status: ${status}.`,
    });

    res.status(201).json(driver);
});


/**
 * @desc    Get all drivers or search 
 * @route   GET /api/drivers
 * @access  private
 */
const getDrivers = asyncHandler(async (req, res) => {
    const { search } = req.query;
    let whereCondition = {};

    if (search) {
        whereCondition = {
            [Op.or]: [
                { '$User.name$': { [Op.like]: `%${search}%` } },
                { '$User.email$': { [Op.like]: `%${search}%` } },
                { driver_no: { [Op.like]: `%${search}%` } },
            ],
        };
    }

    const drivers = await Driver.findAll({
        include: [{ model: User, attributes: ['name', 'email', 'phone'] }],
        where: whereCondition,
        order: [['created_at', 'DESC']],
    });

    res.json(drivers);
});

/**
 * @desc    Get driver by ID
 * @route   GET /api/drivers/:id
 * @access  private
 */
const getDriverByID = asyncHandler(async (req, res) => {
    const driver = await Driver.findByPk(req.params.id, {
        include: [{ model: User, attributes: ['name', 'email'] }],
    });

    if (driver) {
        res.json(driver);
    } else {
        res.status(404);
        throw new Error('Driver not found');
    }
});

/**
 * @desc    Update driver
 * @route   PUT /api/drivers/:id
 * @access  private
 */
const updateDriver = asyncHandler(async (req, res) => {
    const { driver_no, license_number, license_expiry, status } = req.body;

    const driver = await Driver.findByPk(req.params.id);

    if (driver) {
        driver.driver_no = driver_no ?? driver.driver_no;
        driver.license_number = license_number ?? driver.license_number;
        driver.license_expiry = license_expiry ?? driver.license_expiry;
        driver.status = status ?? driver.status;

        await driver.save();
        res.json(driver);
    } else {
        res.status(404);
        throw new Error('Driver not found');
    }
});

/**
 * @desc    Delete driver
 * @route   DELETE /api/drivers/:id
 * @access  private
 */
const deleteDriver = asyncHandler(async (req, res) => {
    const driver = await Driver.findByPk(req.params.id);

    if (driver) {
        await driver.destroy();
        res.status(204).end();
    } else {
        res.status(404);
        throw new Error('Driver not found');
    }
});

/**
 * @desc    Get drivers by status
 * @route   GET /api/drivers/status/:status
 * @access  private
 */
const getDriversByStatus = asyncHandler(async (req, res) => {
    const status = req.params.status;

    const drivers = await Driver.findAll({
        where: { status },
        include: [{ model: User, attributes: ['name', 'email'] }],
    });

    res.json(drivers);
});

/**
 * @desc    Get driver details by user ID
 * @route   GET /api/drivers/user/:userId
 * @access  private
 */
const getDriverByUserID = asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({
        where: { user_id: req.params.userId },
        include: [{ model: User, attributes: ['name', 'email'] }],
    });

    if (driver) {
        res.json(driver);
    } else {
        res.status(404);
        throw new Error('Driver not found');
    }
});


/**
 * @desc    Check and notify about license expiry 
 * @access  internal
 */
const checkLicenseExpiry = asyncHandler(async () => {
    const today = new Date();

    const expiredDrivers = await Driver.findAll({
        where: {
            license_expiry: {
                [Op.lt]: today,
            },
            status: {
                [Op.ne]: 'suspended',
            },
        },
        include: [{ model: User, attributes: ['id', 'name', 'email'] }],
    });

    const adminAndStaffUsers = await User.findAll({
        where: {
            role: { [Op.in]: ['admin', 'staff'] },
        },
        attributes: ['id', 'email'],
    });


    for (const driver of expiredDrivers) {
        driver.status = 'suspended';
        await driver.save();

        await Notification.create({
            user_id: driver.User.id,
            subject: 'License Expired - Suspension',
            message: `Your license has expired. As a result, you have been suspended. Please update your license details.`,
        });

        for (const adminUser of adminAndStaffUsers) {
            await Notification.create({
                user_id: adminUser.id,
                subject: 'Driver License Expiry Alert',
                message: `Driver ${driver.User.name} (Driver No: ${driver.driver_no}) has been suspended due to an expired license.`,
            });
        }
    }
});

const job = new cron.CronJob('0 0 * * *', () => {
    console.log('Running daily license expiry check...');
    checkLicenseExpiry().catch(error => {
        console.error('Error checking license expiry:', error);
    });
});

job.start();


export {
    createDriver,
    getDrivers,
    getDriverByID,
    updateDriver,
    deleteDriver,
    getDriversByStatus,
    getDriverByUserID,
    checkLicenseExpiry,
};
