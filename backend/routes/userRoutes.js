import express from 'express';

import {
	authUser,
	deleteUser,
	getUserByID,
	getUserProfile,
	getUsers,
	getAdminUsers,
	registerUser,
	quickCreateUser,
	updateUser,
	updateUserProfile,
	forgotPassword,
} from '../controllers/userController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// public routes
router.route('/login').post(authUser);
router.route('/').post(registerUser);
router.route('/forgot-password').post(forgotPassword);

router.route('/profile').get(protect, getUserProfile);
router.route('/profile').put(protect, updateUserProfile);
router.route('/quick-create').post(protect, quickCreateUser);
router.route('/').get(protect, getUsers);
router.route('/admin').get(protect, getAdminUsers);
router.route('/:id').delete(protect,  admin, deleteUser);
router.route('/:id').get(protect, getUserByID);
router.route('/:id').put(protect, updateUser);

export default router;
