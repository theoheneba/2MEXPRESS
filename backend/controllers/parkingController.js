import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';

import ParkingTerminus from '../models/parkingTerminusModel.js';
import ParkingTicket from '../models/parkingTicketModel.js';
import User from '../models/userModel.js';
import { sendSMSV1 } from '../utils/sendArkeselSms.js';


/**
 * @desc    Get all parking termini or search by location and name
 * @route   GET /api/parking/termini
 * @access  public
 */
const getParkingTermini = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let whereCondition = {};

  if (search) {
    whereCondition = {
      [Op.or]: [
        { location: { [Op.like]: `%${search}%` } },
        { terminus_name: { [Op.like]: `%${search}%` } },
      ],
    };
  }

  const termini = await ParkingTerminus.findAll({
    where: whereCondition,
    include: [{ model: ParkingTicket, as: 'parking_tickets' }],
    order: [['created_at', 'DESC']],
  });

  res.json(termini);
});


/**
 * @desc    Get a parking terminus by ID
 * @route   GET /api/parking/termini/:id
 * @access  public
 */
const getParkingTerminusById = asyncHandler(async (req, res) => {
  const terminus = await ParkingTerminus.findByPk(req.params.id, {
    include: { model: ParkingTicket, as: 'parking_tickets' },
  });

  if (terminus) {
    res.json(terminus);
  } else {
    res.status(404);
    throw new Error('Parking terminus not found');
  }
});


/**
 * @desc    Create a new parking terminus
 * @route   POST /api/parking/termini
 * @access  private
 */
const createParkingTerminus = asyncHandler(async (req, res) => {
  const { terminus_name, terminus_number, location, parking_capacity, price, status } = req.body;

  const terminus = await ParkingTerminus.create({
    terminus_name,
    terminus_number,
    location,
    parking_capacity,
    price,
    status,
  });

  res.status(201).json(terminus);
});


/**
 * @desc    Update a parking terminus
 * @route   PUT /api/parking/termini/:id
 * @access  private
 */
const updateParkingTerminus = asyncHandler(async (req, res) => {
  const terminus = await ParkingTerminus.findByPk(req.params.id);
  if (terminus) {
    const { terminus_name, terminus_number, location, parking_capacity, price, status } = req.body;

    terminus.terminus_name = terminus_name || terminus.terminus_name;
    terminus.terminus_number = terminus_number || terminus.terminus_number;
    terminus.location = location || terminus.location;
    terminus.parking_capacity = parking_capacity || terminus.parking_capacity;
    terminus.price = price || terminus.price;
    terminus.status = status || terminus.status;

    const updatedTerminus = await terminus.save();
    res.json(updatedTerminus);
  } else {
    res.status(404);
    throw new Error('Parking terminus not found');
  }
});


/**
 * @desc    Delete a parking terminus
 * @route   DELETE /api/parking/termini/:id
 * @access  private
 */
const deleteParkingTerminus = asyncHandler(async (req, res) => {
  const terminus = await ParkingTerminus.findByPk(req.params.id);
  if (terminus) {
    await terminus.destroy();
    res.status(204).end();
  } else {
    res.status(404);
    throw new Error('Parking terminus not found');
  }
});


/**
 * @desc    Get all parking tickets for a terminus
 * @route   GET /api/parking/tickets/termini/:id/tickets
 * @access  public
 */
const getParkingTickets = asyncHandler(async (req, res) => {
  const { id: terminusId } = req.params;
  const { search } = req.query;

  let whereCondition = {
    parking_terminus_id: terminusId,
  };

  if (search) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        { vehicle_number: { [Op.like]: `%${search}%` } },
        { spot_number: { [Op.like]: `%${search}%` } },
        { '$User.name$': { [Op.like]: `%${search}%` } },
      ],
    };
  }

  const tickets = await ParkingTicket.findAll({
    where: whereCondition,
    include: [
      {
        model: User,
        attributes: ['name', 'email', 'phone'],
      },
    ],
    order: [['created_at', 'DESC']],
  });

  res.json(tickets);
});


/**
 * @desc    Get a parking ticket by ID
 * @route   GET /api/parking/tickets/:id
 * @access  public
 */
const getParkingTicketById = asyncHandler(async (req, res) => {
  const ticket = await ParkingTicket.findByPk(req.params.id);
  if (ticket) {
    res.json(ticket);
  } else {
    res.status(404);
    throw new Error('Parking ticket not found');
  }
});


/**
 * @desc    Create a new parking ticket
 * @route   POST /api/parking/tickets
 * @access  private
 */
const createParkingTicket = asyncHandler(async (req, res) => {
  const { 
    parking_terminus_id, 
    vehicle_number, 
    vehicle_model, 
    user_id, 
    spot_number, 
    parked_at, 
    payment_method, 
    isPaid, 
    served_by, 
    pickerContact,
  } = req.body;

  const ticket = await ParkingTicket.create({
    parking_terminus_id,
    vehicle_number,
    vehicle_model,
    user_id: user_id || null,
    spot_number,
    parked_at,
    payment_method,
    isPaid,
    served_by,
    pickerContact: pickerContact || {
      name: null,
      phone: null,
      email: null,
      identification: null,
    },
  });

  const user = await User.findByPk(user_id, { attributes: ['email', 'phone'] });
    const userPhone = user.phone;

    const smsMessage = `Your parking ticket has been created. Vehicle: ${vehicle_number}, Model: ${vehicle_model}, Spot: ${spot_number}, Parked At: ${parked_at}. Ticket Number: ${ticket.ticket_number}.`;

    await sendSMSV1({
      to: userPhone, 
      from: '2M Express Parking Service', 
      sms: smsMessage,
    });


  res.status(201).json(ticket);
});


/**
 * @desc    Update a parking ticket
 * @route   PUT /api/parking/tickets/:id
 * @access  private
 */
const updateParkingTicket = asyncHandler(async (req, res) => {
  const ticket = await ParkingTicket.findByPk(req.params.id);

  if (ticket) {
    const { 
      parking_terminus_id, 
      vehicle_number, 
      vehicle_model, 
      user_id, 
      spot_number, 
      parked_at, 
      collected_at, 
      payment_method, 
      isPaid, 
      served_by, 
      pickerContact,
    } = req.body;

    ticket.parking_terminus_id = parking_terminus_id || ticket.parking_terminus_id;
    ticket.vehicle_number = vehicle_number || ticket.vehicle_number;
    ticket.vehicle_model = vehicle_model || ticket.vehicle_model;
    ticket.user_id = user_id || ticket.user_id;
    ticket.spot_number = spot_number || ticket.spot_number;
    ticket.parked_at = parked_at || ticket.parked_at;
    ticket.collected_at = collected_at || ticket.collected_at;
    ticket.payment_method = payment_method || ticket.payment_method;
    ticket.isPaid = isPaid || ticket.isPaid;
    ticket.served_by = served_by || ticket.served_by;

    ticket.pickerContact = {
      name: null,
      phone: null,
      email: null,
      identification: null,
    };

    if (pickerContact) {
      const { name, phone, email, identification } = pickerContact;
      ticket.pickerContact = {
        name: name || null,
        phone: phone || null,
        email: email || null,
        identification: identification || null,
      };
    }

    const updatedTicket = await ticket.save();

    if (updatedTicket.isPaid || updatedTicket.collected_at) {
      const user = await User.findByPk(updatedTicket.user_id, { attributes: ['phone'] });
      const userPhone = user.phone;

      let smsMessage = `Your parking ticket has been updated. Vehicle: ${updatedTicket.vehicle_number}, Spot: ${updatedTicket.spot_number}, Payment Status: ${updatedTicket.isPaid ? 'Paid' : 'Not Paid'}.`;

      if (updatedTicket.collected_at) {
        smsMessage += ` Collected At: ${updatedTicket.collected_at}.`;
      }

      await sendSMSV1({
        to: userPhone, 
        from: 'Parking Service', 
        sms: smsMessage,
      });
    }

    res.json(updatedTicket);
    
  } else {
    res.status(404);
    throw new Error('Parking ticket not found');
  }
});


/**
 * @desc    Delete a parking ticket
 * @route   DELETE /api/parking/tickets/:id
 * @access  private
 */
const deleteParkingTicket = asyncHandler(async (req, res) => {
  const ticket = await ParkingTicket.findByPk(req.params.id);
  if (ticket) {
    await ticket.destroy();
    res.status(204).end();
  } else {
    res.status(404);
    throw new Error('Parking ticket not found');
  }
});


/**
 * @desc    Calculate revenue for a terminus within a date range
 * @route   GET /api/parking/termini/:id/revenue
 * @access  private
 */
const calculateRevenue = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const terminus = await ParkingTerminus.findByPk(req.params.id);

  if (terminus) {
    const tickets = await ParkingTicket.findAll({
      where: {
        parking_terminus_id: terminus.id,
        parked_at: { [Op.between]: [new Date(startDate), new Date(endDate)] },
        isPaid: true,
      },
    });

    const revenue = tickets.reduce((sum, ticket) => sum + terminus.price, 0);
    res.json({ terminus_id: terminus.id, revenue });
  } else {
    res.status(404);
    throw new Error('Parking terminus not found');
  }
});


export {
  getParkingTermini,
  getParkingTerminusById,
  createParkingTerminus,
  updateParkingTerminus,
  deleteParkingTerminus,
  getParkingTickets,
  getParkingTicketById,
  createParkingTicket,
  updateParkingTicket,
  deleteParkingTicket,
  calculateRevenue,
};
