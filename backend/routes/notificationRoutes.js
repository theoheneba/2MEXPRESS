import express from 'express';

import {
    getAllNotifications,
    getNotificationById,
    updateNotification,
    getUserNotifications,
    deleteNotification,
    deleteBulkNotificationsByDateRange,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from '../controllers/notificationController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getAllNotifications);
router.route('/:id').get(protect, getNotificationById);
router.route('/:id').put(protect, updateNotification);
router.route('/:id').delete(protect, admin, deleteNotification);
router.route('/user/:user_id').get(protect, getUserNotifications);
router.route('/delete-bulk').delete(protect, admin, deleteBulkNotificationsByDateRange);
router.route('/:id/read').put(protect, markNotificationAsRead);
router.route('/mark-all-as-read/:user_id').put(protect, markAllNotificationsAsRead);


export default router;
