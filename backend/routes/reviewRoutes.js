import express from 'express';

import {
  createReview,
  getAllReviews,
  getReviewsForTrip,
  getReviewsForUser,
  getReviewById,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createReview); 
router.route('/').get(protect, getAllReviews);
router.route('/trip/:trip_id').get(protect, getReviewsForTrip);
router.route('/user/:user_id').get(protect, getReviewsForUser);
router.route('/:id').get(protect, getReviewById); 
router.route('/:id').put(protect, updateReview);
router.route('/:id').delete(protect, deleteReview); 

export default router;