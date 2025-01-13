import asyncHandler from 'express-async-handler';

import Newsletter from '../models/newsletterModel.js';
import NewsletterMessage from '../models/newsletterMessage.js';
import { sendWelcome, sendNewsletter, sendUnsubscribeNewsletter, sendResubscribeNewsletter } from '../utils/sendEmail.js';


/**
 * @desc    Subscribe to the newsletter
 * @route   POST /api/newsletter
 * @access  public
 */
const subscribeToNewsletter = asyncHandler(async (req, res) => {
    const { email } = req.body;
  
    try {
      const existingSubscriber = await Newsletter.findOne({ where: { email } });
  
      if (existingSubscriber) {
        res.json({ message: 'Already subscribed to Hodari Homes Newsletter.' });
        return;
      }
  
      await Newsletter.create({ email });
  
      const message = 'Thank you for subscribing to Hodari Homes Newsletter !';
      await sendWelcome(email, message);
  
      res.status(201).json({ message: 'Successfully subscribed to Hodari Homes Newsletter.' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to subscribe. Please try again later.' });
    }
  });
  

/**
 * @desc    Get all newsletter subscribers
 * @route   GET /api/newsletter
 * @access  private
 */
const getAllSubscribers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let whereCondition = {};

  if (search) {
    whereCondition.email = { [Op.like]: `%${search}%` };
  }

  const subscribers = await Newsletter.findAll({
    where: whereCondition,
    order: [['created_at', 'DESC']],
  });

  res.json(subscribers);
});


/**
 * @desc    Send newsletter to all subscribers
 * @route   POST /api/newsletter/send
 * @access  private
 */
const sendNewsletterToSubscribers = asyncHandler(async (req, res) => {
    const subscribers = await Newsletter.findAll();
  
    if (subscribers.length === 0) {
      res.json({ message: 'No subscribers found. Newsletter not sent.' });
      return;
    }
  
    const emailList = subscribers.map((subscriber) => subscriber.email);
    const { message } = req.body;
  
    try {
      const sentByUser = req.user.id;

      await sendNewsletter(emailList, message);
  
      const sentMessage = await NewsletterMessage.create({
        content: message,
        sentByUser,
      });
  
      res.json({ message: 'Newsletter sent successfully to all subscribers.', sentMessage });
    } catch (error) {
      console.error('Error sending newsletter:', error);
      res.status(500);
      throw new Error('Error sending newsletter');
    }
  });


/**
 * @desc    Get all newsletter messages
 * @route   GET /api/newsletter/messages
 * @access  private
 */
const getAllNewsletterMessages = asyncHandler(async (req, res) => {
    const messages = await NewsletterMessage.findAll();
    res.json(messages);
});


/**
 * @desc    Unsubscribe from the newsletter
 * @route   DELETE /api/newsletter/:email
 * @access  public
 */
const unsubscribeFromNewsletter = asyncHandler(async (req, res) => {
    const { email } = req.params;
  
    const subscriber = await Newsletter.findOne({ where: { email } });
  
    if (subscriber) {
      await subscriber.destroy();
  
      const message = 'You have successfully unsubscribed from our newsletter.';
         
      try {
        await sendUnsubscribeNewsletter(email, message);
  
        res.json({ message: 'Subscriber removed from the newsletter. Unsubscribe confirmation sent.' });
      } catch (error) {
        res.status(500);
        throw new Error('Error sending email notification');
      }
    } else {
      res.status(404);
      throw new Error('Subscriber not found');
    }
  });


/**
 * @desc    Resubscribe to the newsletter
 * @route   POST /api/newsletter/resubscribe
 * @access  public
 */
const resubscribeToNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const subscriber = await Newsletter.findOne({ where: { email } });

  if (subscriber) {
    await subscriber.update({ isActive: true });

    const message = 'You have successfully resubscribed to our newsletter.';

    try {
      await sendResubscribeNewsletter(email, message);

      res.json({ message: 'Subscriber resubscribed to the newsletter. Resubscribe confirmation sent.' });
    } catch (error) {
      res.status(500);
      throw new Error('Error sending email notification');
    }
  } else {
    res.status(404);
    throw new Error('Subscriber not found');
  }
});


export {
    subscribeToNewsletter, 
    getAllSubscribers, 
    sendNewsletterToSubscribers,
    getAllNewsletterMessages,
    unsubscribeFromNewsletter, 
    resubscribeToNewsletter,
}; 
