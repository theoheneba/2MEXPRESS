import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';

import ContactUs from '../models/contactUsModel.js';


/**
 * @desc    Get all contact form submissions
 * @route   GET /api/contactus
 * @access private
 */
const getAllContactSubmissions = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let whereCondition = {};

  if (search) {
    whereCondition = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ],
    };
  }

  const submissions = await ContactUs.findAll({
    where: whereCondition,
    order: [['created_at', 'DESC']],
  });

  res.json(submissions);
});


/**
 * @desc    Get a single contact form submission by ID
 * @route   GET /api/contactus/:id
 * @access private
 */
const getContactSubmissionById = asyncHandler(async (req, res) => {
  const submission = await ContactUs.findByPk(req.params.id);
  if (submission) {
    res.json(submission);
  } else {
    res.status(404);
    throw new Error('Submission not found');
  }
});


/**
 * @desc    Submit contact form
 * @route   POST /api/contactus
 * @access public
 */
const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, phone,  message } = req.body;

  const submission = await ContactUs.create({
    name,
    email,
    phone,
    message,
  });

  res.status(201).json(submission);
});


/**
 * @desc    Get contact form submissions by date range
 * @route   GET /api/contactus/date
 * @access  private
 */
const getSubmissionsByDate = asyncHandler(async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    endDate.setDate(endDate.getDate() + 1);
    const submissions = await ContactUs.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      },
    });

    res.json(submissions);
  } catch (error) {
    console.error('Error in getSubmissionsByDate:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


/**
 * @desc    Delete a contact form submission by ID
 * @route   DELETE /api/contactus/:id
 * @access  private
 */
const deleteContactSubmission = asyncHandler(async (req, res) => {
  const submission = await ContactUs.findByPk(req.params.id);
  if (submission) {
    await submission.destroy();
    res.json({ message: 'Submission deleted' });
  } else {
    res.status(404);
    throw new Error('Submission not found');
  }
});


export {
  getAllContactSubmissions,
  getContactSubmissionById,
  submitContactForm,
  getSubmissionsByDate,
  deleteContactSubmission,
};
