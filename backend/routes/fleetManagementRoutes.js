import express from 'express';

import {
    getFleetManagements,
    getFleetManagementById,
    createFleetManagement,
    updateFleetManagement,
    deleteFleetManagement,
} from '../controllers/fleetManagementController.js';
import { protect } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.route('/').get(protect, getFleetManagements);
router.route('/').post(protect, createFleetManagement);
router.route('/:id').get(protect, getFleetManagementById);
router.route('/:id') .put(protect, updateFleetManagement);
router.route('/:id') .delete(protect, deleteFleetManagement);

export default router;
