import express from 'express';

import {
  subscribeToNewsletter,
  getAllSubscribers,
  sendNewsletterToSubscribers,
  getAllNewsletterMessages,
  unsubscribeFromNewsletter,
  resubscribeToNewsletter,
} from '../controllers/newsletterController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').post(subscribeToNewsletter);
router.route('/').get(protect, getAllSubscribers);
router.route('/send').post(protect, sendNewsletterToSubscribers);
router.route('/messages').get(protect, getAllNewsletterMessages);
router.route('/:email').delete(unsubscribeFromNewsletter);
router.route('/:email').post(resubscribeToNewsletter);

export default router;
