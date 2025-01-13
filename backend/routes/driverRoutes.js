import express from 'express';

import {
    createDriver,
    getDrivers,
    getDriverByID,
    updateDriver,
    deleteDriver,
    getDriversByStatus,
    getDriverByUserID,
} from '../controllers/driverController.js';
import { protect } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.route('/').get(getDrivers);
router.route('/:id').get(getDriverByID);
router.route('/').post(protect, createDriver);
router.route('/:id').put(protect, updateDriver);
router.route('/:id').delete(protect, deleteDriver);
router.route('/status/:status').get(protect, getDriversByStatus);
router.route('/user/:user_id').get(protect, getDriverByUserID);

export default router;
