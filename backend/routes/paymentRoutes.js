import express from 'express';

import {
    getPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    getUserPayments,
} from '../controllers/paymentController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getPayments);
router.route('/').post(protect, createPayment);
router.route('/:id').get(protect, getPaymentById);
router.route('/:id').put(protect, updatePayment);
router.route('/:id').delete(protect, deletePayment);
router.route('/user/userId').get(protect, getUserPayments);

export default router;
