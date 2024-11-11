import express from 'express';

import {
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
} from '../controllers/parkingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/termini').get(protect, getParkingTermini);                  
router.route('/termini').post(protect, createParkingTerminus);   
router.route('/termini/:id').get(protect, getParkingTerminusById);    
router.route('/termini/:id').put(protect, updateParkingTerminus); 
router.route('/termini/:id').delete(protect, deleteParkingTerminus);

router.route('/termini/:id/tickets').get(protect, getParkingTickets);                     
router.route('/tickets').post(protect, createParkingTicket);         
router.route('/tickets/:id').get(protect, getParkingTicketById);           
router.route('/tickets/:id').put(protect, updateParkingTicket);   
router.route('/tickets/:id').delete(protect, deleteParkingTicket); 

router.route('/termini/:id/revenue').get(protect, calculateRevenue); 

export default router;
