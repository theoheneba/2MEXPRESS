import express from 'express';

import {
  getAllContactSubmissions,
  getContactSubmissionById,
  submitContactForm,
  getSubmissionsByDate,
  deleteContactSubmission,
} from '../controllers/contactController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getAllContactSubmissions);
router.route('/:id').get(protect, getContactSubmissionById);
router.route('/').post(submitContactForm);
router.route('/date').get(protect, getSubmissionsByDate);
router.route('/:id').delete(protect, deleteContactSubmission);

export default router;
