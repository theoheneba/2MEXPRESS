import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';

import Washroom from '../models/washroomModel.js';
import WashroomTicket from '../models/washroomTicketModel.js';
import Amenity from '../models/amenityModel.js';


/**
 * @desc    Get all washrooms or search by location and amenities
 * @route   GET /api/washrooms
 * @access  public
 */
const getWashrooms = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let whereCondition = {};

  if (search) {
    whereCondition = {
      [Op.or]: [
        { location: { [Op.like]: `%${search}%` } },
        { station_name: { [Op.contains]: [search] } },
      ],
    };
  }

  const washrooms = await Washroom.findAll({
    where: whereCondition,
    include: [{ model: WashroomTicket, as: 'washroom_tickets' }],
    include: [{ model: Amenity, as: 'washroom_amenities' }],
    order: [['created_at', 'DESC']],
  });

  res.json(washrooms);
});


/**
 * @desc    Get a washroom by ID
 * @route   GET /api/washrooms/:id
 * @access  public
 */
const getWashroomById = asyncHandler(async (req, res) => {
  const washroom = await Washroom.findByPk(req.params.id, {
    include: { model: WashroomTicket, as: 'washroom_tickets' },
    include: [{ model: Amenity, as: 'washroom_amenities' }],
  });

  if (washroom) {
    res.json(washroom);
  } else {
    res.status(404);
    throw new Error('Washroom not found');
  }
});


/**
 * @desc    Create a new washroom
 * @route   POST /api/washrooms
 * @access  private
 */
const createWashroom = asyncHandler(async (req, res) => {
  const { location, station_name, station_id, notes, status } = req.body;

  const washroom = await Washroom.create({
    location,
    station_name,
    station_id,
    notes,
    status,
  });

  res.status(201).json(washroom);
});


/**
 * @desc    Update a washroom
 * @route   PUT /api/washrooms/:id
 * @access  private
 */
const updateWashroom = asyncHandler(async (req, res) => {
  const { location, station_name, station_id, notes, status } = req.body;
  const washroom = await Washroom.findByPk(req.params.id);

  if (washroom) {
    washroom.location = location || washroom.location;
    washroom.station_name = station_name || washroom.station_name;
    washroom.station_id = station_id || washroom.station_id;
    washroom.notes = notes || washroom.notes;
    washroom.status = status || washroom.status;

    const updatedWashroom = await washroom.save();
    res.json(updatedWashroom);
  } else {
    res.status(404);
    throw new Error('Washroom not found');
  }
});


/**
 * @desc    Delete a washroom
 * @route   DELETE /api/washrooms/:id
 * @access  private
 */
const deleteWashroom = asyncHandler(async (req, res) => {
  const washroom = await Washroom.findByPk(req.params.id);

  if (washroom) {
    await washroom.destroy();
    res.status(204).end();
  } else {
    res.status(404);
    throw new Error('Washroom not found');
  }
});


/**
 * @desc    Get all washroom tickets 
 * @route   GET /api/washrooms/:id/tickets
 * @access  public
 */
const getWashroomTickets = asyncHandler(async (req, res) => {
  const { id: washroomId } = req.params;
  const { search, paymentMethod, startDate, endDate } = req.query;

  let whereCondition = {
      washroom_id: washroomId,  
  };

  if (search) {
      whereCondition = {
          ...whereCondition,
          [Op.or]: [
              { served_by: { [Op.like]: `%${search}%` } }
          ],
      };
  }

  if (paymentMethod) {
      whereCondition.payment_method = paymentMethod;
  }

  if (startDate || endDate) {
      whereCondition.time = {
          ...(startDate && { [Op.gte]: new Date(startDate) }),
          ...(endDate && { [Op.lte]: new Date(endDate) }),
      };
  }

  const tickets = await WashroomTicket.findAll({
      where: whereCondition,      
      order: [['created_at', 'DESC']],
  });

  res.json(tickets);
});


/**
 * @desc    Get a washroom ticket by ID
 * @route   GET /api/washrooms/tickets/:id
 * @access  public
 */
const getWashroomTicketById = asyncHandler(async (req, res) => {
    const ticket = await WashroomTicket.findByPk(req.params.id);

    if (ticket) {
        res.json(ticket);
    } else {
        res.status(404);
        throw new Error('Washroom ticket not found');
    }
});


/**
 * @desc    Create a new washroom ticket
 * @route   POST /api/washrooms/tickets
 * @access  private
 */
const createWashroomTicket = asyncHandler(async (req, res) => {
    const { washroom_id, amenity_id, time, served_by, payment_method, gender, isPaid } = req.body;

    const ticket = await WashroomTicket.create({
        washroom_id,
        amenity_id,
        time,
        served_by,
        payment_method,
        gender,
        isPaid,
    });

    res.status(201).json(ticket);
});


/**
 * @desc    Update a washroom ticket
 * @route   PUT /api/washrooms/tickets/:id
 * @access  private
 */
const updateWashroomTicket = asyncHandler(async (req, res) => {
    const ticket = await WashroomTicket.findByPk(req.params.id);
    if (ticket) {
        const { washroom_id, time, amenity_id, served_by, payment_method, gender, isPaid } = req.body;
        ticket.washroom_id = washroom_id || ticket.washroom_id;
        ticket.amenity_id = amenity_id || ticket.amenity_id;
        ticket.time = time || ticket.time;
        ticket.served_by = served_by || ticket.served_by;
        ticket.payment_method = payment_method || ticket.payment_method;
        ticket.gender = gender || ticket.gender;
        ticket.isPaid = isPaid || ticket.isPaid;

        const updatedTicket = await ticket.save();
        res.json(updatedTicket);
    } else {
        res.status(404);
        throw new Error('Washroom ticket not found');
    }
});


/**
 * @desc    Delete a washroom ticket
 * @route   DELETE /api/washrooms/tickets/:id
 * @access  private
 */
const deleteWashroomTicket = asyncHandler(async (req, res) => {
    const ticket = await WashroomTicket.findByPk(req.params.id);
    if (ticket) {
        await ticket.destroy();
        res.status(204).end();
    } else {
        res.status(404);
        throw new Error('Washroom ticket not found');
    }
});


/**
 * @desc    Create an amenity for a washroom
 * @route   POST /api/washrooms/:id/amenities
 * @access  private
 */
const createAmenity = asyncHandler(async (req, res) => {
  const { washroom_id, name, price, status } = req.body;
  const washroom = await Washroom.findByPk(washroom_id);

  if (washroom) {
      const amenity = await Amenity.create({
          washroom_id: washroom.id,
          name,
          price,
          status,
      });
      res.status(201).json(amenity);
  } else {
      res.status(404);
      throw new Error('Washroom not found');
  }
});


/**
* @desc    Get all amenities for a washroom
* @route   GET /api/washrooms/:id/amenities
* @access  public
*/
const getAmenities = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const { id } = req.params;

  let whereCondition = {
    washroom_id: id, 
  };

  if (search) {
    whereCondition = {
      ...whereCondition,
      name: {
        [Op.like]: `%${search}%`,
      },
    };
  }

  const amenities = await Amenity.findAll({
    where: whereCondition,
  });

  res.json(amenities);
});


/**
* @desc    Update an amenity
* @route   PUT /api/washrooms/amenities/:id
* @access  private
*/
const updateAmenity = asyncHandler(async (req, res) => {
  const amenity = await Amenity.findByPk(req.params.id);
  if (amenity) {
      const { name, status } = req.body;
      amenity.name = name || amenity.name;      
      amenity.price = price || amenity.price;
      amenity.status = status || amenity.status;

      const updatedAmenity = await amenity.save();
      res.json(updatedAmenity);
  } else {
      res.status(404);
      throw new Error('Amenity not found');
  }
});


/**
* @desc    Delete an amenity
* @route   DELETE /api/washrooms/amenities/:id
* @access  private
*/
const deleteAmenity = asyncHandler(async (req, res) => {
  const amenity = await Amenity.findByPk(req.params.id);
  if (amenity) {
      await amenity.destroy();
      res.status(204).end();
  } else {
      res.status(404);
      throw new Error('Amenity not found');
  }
});


/**
 * @desc    Calculate revenue from washroom tickets within a specified date range
 * @route   GET /api/washrooms/revenue
 * @access  private
 */
const getWashroomsRevenue = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const revenue = await WashroomTicket.sum('isPaid', {
      where: {
          time: { [Op.between]: [new Date(startDate), new Date(endDate)] },
      },
      include: [
          {
              model: Washroom,
              attributes: ['price'],
          },
      ],
  });

  res.json({ revenue });
});

export {
    getWashrooms,
    getWashroomById,
    createWashroom,
    updateWashroom,
    deleteWashroom,
    getWashroomTickets,
    getWashroomTicketById,
    createWashroomTicket,
    updateWashroomTicket,
    deleteWashroomTicket,
    createAmenity,
    getAmenities,
    updateAmenity,
    deleteAmenity,
    getWashroomsRevenue,
};
