import express from 'express';

import {    
    getRoutes,
    getRouteById,
    createRoute,
    updateRoute,
    deleteRoute,
    getStopsByRoute,
    createStop,
    updateStop,
    deleteStop,
} from '../controllers/routeController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(getRoutes);
router.route('/:id').get(getRouteById);
router.route('/').post(protect, createRoute);
router.route('/:id').put(protect, updateRoute);
router.route('/:id').delete(protect, admin, deleteRoute);
router.route('/:route_id/stops').get( protect, getStopsByRoute);
router.route('/:route_id/stops').post(protect, createStop);
router.route('/stops/:id').put(protect, updateStop);
router.route('/stops/:id').delete(protect, deleteStop);

export default router;
