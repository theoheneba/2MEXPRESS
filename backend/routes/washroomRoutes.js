import express from 'express';

import {
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
} from '../controllers/washroomController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getWashrooms);                
router.route('/').post(protect, createWashroom);  

router.route('/:id').get(protect, getWashroomById)              
router.route('/:id').put(protect, updateWashroom)       
router.route('/:id').delete(protect, deleteWashroom);   

router.route('/:id/tickets').get(getWashroomTickets)           
router.route('/tickets').post(protect, createWashroomTicket);
router.route('/tickets/:id').get(getWashroomTicketById)        
router.route('/tickets/:id').put(protect, updateWashroomTicket)
router.route('/tickets/:id').delete(protect, deleteWashroomTicket);

router.route('/amenities').post(protect, createAmenity); 
router.route('/:id/amenities').get(protect, getAmenities); 
router.route('/amenities/:id').put(protect, updateAmenity); 
router.route('/amenities/:id').delete(protect, deleteAmenity);
    
router.route('/revenue').get(protect, getWashroomsRevenue); 

export default router;
