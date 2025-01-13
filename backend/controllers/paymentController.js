import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';

import Payment from '../models/paymentModel.js';

/**
 * @desc    Get all payments or search payments by status
 * @route   GET /api/payments
 * @access  public
 */
const getPayments = asyncHandler(async (req, res) => {
    const { search } = req.query;
    let whereCondition = {};

    if (search) {
        whereCondition = {
            [Op.or]: [
                { '$User.name$': { [Op.like]: `%${search}%` } },
                { '$User.email$': { [Op.like]: `%${search}%` } },
                { '$User.phone$': { [Op.like]: `%${search}%` } },
                { '$Parcel.tracking_number$': { [Op.like]: `%${search}%` } },
                { '$Ticket.ticket_number$': { [Op.like]: `%${search}%` } },
                { '$Payment.status$': { [Op.like]: `%${search}%` } }
            ],
        };
    }

    const payments = await Payment.findAll({
        where: whereCondition,
        include: [
            { model: User, attributes: ['name', 'email', 'phone'] },
            { model: Parcel, attributes: ['tracking_number'] },
            { model: Ticket, attributes: ['ticket_number'] },
        ],
        order: [['payment_date', 'DESC']],
    });

    res.json(payments);
});

/**
 * @desc    Get single payment by ID
 * @route   GET /api/payments/:id
 * @access  public
 */
const getPaymentById = asyncHandler(async (req, res) => {
    const payment = await Payment.findByPk(req.params.id);

    if (payment) {
        res.json(payment);
    } else {
        res.status(404);
        throw new Error('Payment not found');
    }
});

/**
 * @desc    Create a new payment
 * @route   POST /api/payments
 * @access  private
 */
const createPayment = asyncHandler(async (req, res) => {
    const { user_id, amount, payment_date, payment_method, status, parcel_id, ticket_id } = req.body;

    const payment = await Payment.create({
        user_id,
        amount,
        payment_date,
        payment_method,
        status,
        parcel_id,
        ticket_id,
    });

    if (payment) {
        res.status(201).json(payment);
    } else {
        res.status(400);
        throw new Error('Invalid payment data');
    }
});

/**
 * @desc    Update an existing payment
 * @route   PUT /api/payments/:id
 * @access  private
 */
const updatePayment = asyncHandler(async (req, res) => {
    const { user_id, amount, payment_date, payment_method, status, parcel_id, ticket_id } = req.body;
    const payment = await Payment.findByPk(req.params.id);

    if (payment) {
        payment.user_id = user_id || payment.user_id;
        payment.amount = amount || payment.amount;
        payment.payment_date = payment_date || payment.payment_date;
        payment.payment_method = payment_method || payment.payment_method;
        payment.status = status || payment.status;
        payment.parcel_id = parcel_id !== undefined ? parcel_id : payment.parcel_id;
        payment.ticket_id = ticket_id !== undefined ? ticket_id : payment.ticket_id;

        const updatedPayment = await payment.save();
        res.json(updatedPayment);
    } else {
        res.status(404);
        throw new Error('Payment not found');
    }
});


/**
 * @desc    Delete a payment
 * @route   DELETE /api/payments/:id
 * @access  private
 */
const deletePayment = asyncHandler(async (req, res) => {
    const payment = await Payment.findByPk(req.params.id);

    if (payment) {
        await payment.destroy();
        res.status(204).end();
    } else {
        res.status(404);
        throw new Error('Payment not found');
    }
});

/**
 * @desc    Get payments for a specific user
 * @route   GET /api/payments/user/:userId
 * @access  private
 */
const getUserPayments = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { status } = req.query;
    let whereCondition = { user_id: userId };

    if (status) {
        whereCondition.status = status;
    }

    const payments = await Payment.findAll({
        where: whereCondition,
        include: [
            { model: User, attributes: ['name', 'email', 'phone'] }, 
        ],
        order: [['payment_date', 'DESC']],
    });

    res.json(payments);
});


export {
    getPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    getUserPayments,
};
