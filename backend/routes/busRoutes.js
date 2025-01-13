import express from 'express';

import {
    getBuses,
    getBusById,
    createBus,
    updateBus,
    deleteBus,
} from '../controllers/busController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(getBuses);
router.route('/:id').get(getBusById);
router.route('/').post(protect, createBus);
router.route('/:id').put(protect, updateBus);
router.route('/:id').delete(protect, admin, deleteBus);

export default router;
