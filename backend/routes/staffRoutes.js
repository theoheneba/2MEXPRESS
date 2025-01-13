import express from 'express';

import {
    createStaff,
    getStaff,
    getStaffByID,
    updateStaff,
    deleteStaff,
} from '../controllers/staffController.js';
import { protect } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.route('/').get(protect, getStaff);
router.route('/:id').get(protect, getStaffByID);
router.route('/').post(protect, createStaff);
router.route('/:id').put(protect, updateStaff);
router.route('/:id').delete(protect, deleteStaff);

export default router;
