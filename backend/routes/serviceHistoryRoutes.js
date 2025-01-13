import express from 'express';

import {
    getServiceHistories,
    getServiceHistoryByBusId,
    getServiceHistoryById,
    createServiceHistory,
    updateServiceHistory,
    deleteServiceHistory,
} from '../controllers/serviceHistoryController.js';
import { protect } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.route('/').get(protect, getServiceHistories);
router.route('/').post(protect, createServiceHistory);
router.route('/:id').get(protect, getServiceHistoryById);
router.route('/:id').put(protect, updateServiceHistory);
router.route('/:id').delete(protect, deleteServiceHistory);
router.route('/bus/:bus_id').get(protect, getServiceHistoryByBusId);

export default router;
