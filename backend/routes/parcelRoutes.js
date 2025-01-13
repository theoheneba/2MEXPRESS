import express from 'express';

import {
    getParcels,
    getParcelById,
    createParcel,
    updateParcel,
    deleteParcel,
    getUserParcels,
} from '../controllers/parcelController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getParcels);
router.route('/').post(protect, createParcel);
router.route('/:id').get(protect, getParcelById);
router.route('/:id').put(protect, updateParcel);
router.route('/:id').delete(protect, deleteParcel);
router.route('/user/:user_id').get(protect, getUserParcels)

export default router;
