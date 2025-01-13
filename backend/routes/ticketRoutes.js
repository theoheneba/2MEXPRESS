import express from 'express';

import {
    getTickets,
    getTicketById,
    createTicket,
    bookTrip,
    updateTicket,
    deleteTicket,
    getUserTickets,
    updateTripSeatsAtStop,
} from '../controllers/ticketController.js';
import { protect} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getTickets);       
router.route('/').post(protect, createTicket);   
router.route('/book').post(protect, bookTrip);
router.route('/:id').get(protect,getTicketById);    
router.route('/:id').put(protect, updateTicket); 
router.route('/:id').delete(protect, deleteTicket); 
router.route('/user/:user_id').get(protect, getUserTickets);
router.route('/trips/:trip_id/stops/:stop_id/update-seats').put(protect, updateTripSeatsAtStop);

export default router;
