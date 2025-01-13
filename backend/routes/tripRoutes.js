import express from 'express';

import {
    getTrips,
    getTripById,
    createTrip,
    updateTrip,
    deleteTrip,
    getUserTrips,
    getTripsByRoute,
    getParcelsForTrip,
    getTripsForBus,
} from '../controllers/tripController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getTrips);   
router.route('/').post(protect, createTrip);  
router.route('/:id').get(protect, getTripById); 
router.route('/:id').put(protect, admin, updateTrip); 
router.route('/:id').delete(protect, admin, deleteTrip); 
router.route('/user/:user_id').get(protect, getUserTrips);
router.route('/route/:route_id').get(protect, getTripsByRoute);
router.route('/:trip_id/parcels').get(protect, getParcelsForTrip);
router.route('/bus/:bus_id').get(protect, getTripsForBus);

export default router;
