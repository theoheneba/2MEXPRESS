import asyncHandler from 'express-async-handler';

import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';


/**  
* @desc    Get all notifications
* @route   GET /api/notifications
* @access  private
*/
const getAllNotifications = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let whereCondition = {};

  if (search) {
    whereCondition[Op.or] = [
      { '$User.name$': { [Op.like]: `%${search}%` } },
      { '$User.email$': { [Op.like]: `%${search}%` } },
    ];
  }

  const notifications = await Notification.findAll({
    include: [{
      model: User,
      attributes: ['name', 'email'],
      where: whereCondition,
    }],
    order: [['created_at', 'DESC']],
  });

  res.json(notifications);
});


/** 
* @desc    Get notification by ID
* @route   GET /api/notifications/:id
* @access  private
*/
const getNotificationById = asyncHandler(async (req, res) => {
    const notification = await Notification.findByPk(req.params.id).populate('user', 'name');

    if (notification) {
        res.json(notification);
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});


/** 
* @desc    Update a notification
* @route   PUT /api/notifications/:id
* @access  private
*/
const updateNotification = asyncHandler(async (req, res) => {
    const { subject, message, type, isRead } = req.body;

    const notification = await Notification.findByPk(req.params.id);

    if (notification) {
        notification.subject = subject || notification.subject;
        notification.message = message || notification.message;
        notification.type = type || notification.type;
        notification.isRead = isRead || notification.isRead;

        const updatedNotification = await notification.save();

        res.json(updatedNotification);
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

/** 
* @desc    Delete a notification
* @route   DELETE /api/notifications/:id
* @access  private
*/
const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findByPk(req.params.id);

    if (notification) {
        await Notification.deleteOne(notification);
        res.json({ message: 'Notification removed' });
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});


/** 
* @desc    Delete notifications by date range
* @route   DELETE /api/notifications/delete-bulk
* @access  private
*/
const deleteBulkNotificationsByDateRange = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.body;

    // Convert date strings to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Delete notifications within the date range
    const result = await Notification.deleteMany({
        createdAt: { $gte: start, $lte: end }
    });

    res.json({ message: `${result.deletedCount} notifications deleted` });
});


/**
 * @desc    Get notifications for a specific user
 * @route   GET /api/notifications/user/:user_id
 * @access  private
 */
const getUserNotifications = asyncHandler(async (req, res) => {
    const { user_id } = req.params;
  
    try {
      const notifications = await Notification.findAll({
        where: { user_id },
        order: [['created_at', 'DESC']],
      });
  
      res.json({ data: notifications });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  
  /**
   * @desc    Mark a notification as read
   * @route   PUT /api/notifications/:id/read
   * @access  public
   */
  const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
  
    try {
      const notification = await Notification.findByPk(id);
  
      if (!notification) {
        res.status(404).json({ message: 'Notification not found' });
        return;
      }
  
      notification.isRead = true;  
      await notification.save();
  
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  });  
  
  
  /**
   * @desc    Mark all notifications as read for a specific user
   * @route   PUT /api/notifications/mark-all-as-read/:user_id
   * @access  private
   */
  const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    const { user_id } = req.params;
  
    try {
      const notifications = await Notification.findAll({
        where: {
          user_id,
          isRead: false,  
        },
      });
  
      for (const notification of notifications) {
        notification.isRead = true;  
        await notification.save();
      }
  
      res.json({ message: `${notifications.length} notifications marked as read` });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: 'Failed to mark all notifications as read' });
    }
  });

export {
    getAllNotifications,
    getNotificationById,
    updateNotification,
    getUserNotifications,
    deleteNotification,
    deleteBulkNotificationsByDateRange,
    markNotificationAsRead,
    markAllNotificationsAsRead,
};
