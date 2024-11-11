import asyncHandler from 'express-async-handler';

import Review from '../models/reviewModel.js';

/**
 * @desc    Create a new review
 * @route   POST /api/reviews
 * @access  private
 */
const createReview = asyncHandler(async (req, res) => {
    const { trip_id, user_id, experience_rating, service_rating, driver_rating, comment } = req.body;

    if (!trip_id || !user_id) {
        res.status(400);
        throw new Error('trip_id and user_id are required');
    }

    try {
        const review = await Review.create({
            trip_id,
            user_id,
            experience_rating,
            service_rating,
            driver_rating,
            comment,
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(400);
        throw new Error('Invalid review data');
    }
});

/**
 * @desc    Get all reviews
 * @route   GET /api/reviews
 * @access  private
 */
const getAllReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.findAll();
    res.json(reviews);
});

/**
 * @desc    Get reviews for a specific trip
 * @route   GET /api/reviews/trip/:trip_id
 * @access  private
 */
const getReviewsForTrip = asyncHandler(async (req, res) => {
    const { trip_id } = req.params;

    if (!trip_id) {
        res.status(400);
        throw new Error('trip_id is required');
    }

    const reviews = await Review.findAll({
        where: { trip_id },
    });

    if (reviews.length === 0) {
        return res.status(404).json({ message: 'No reviews found for this trip' });
    }

    res.json(reviews);
});

/**
 * @desc    Get reviews for a specific user
 * @route   GET /api/reviews/user/:user_id
 * @access  private
 */
const getReviewsForUser = asyncHandler(async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        res.status(400);
        throw new Error('user_id is required');
    }

    const reviews = await Review.findAll({
        where: { user_id },
    });

    if (reviews.length === 0) {
        return res.status(404).json({ message: 'No reviews found for this user' });
    }

    res.json(reviews);
});

/**
 * @desc    Get a review by ID
 * @route   GET /api/reviews/:id
 * @access  private
 */
const getReviewById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
        return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
});

/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:id
 * @access  private
 */
const updateReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { experience_rating, service_rating, driver_rating, comment } = req.body;

    const review = await Review.findByPk(id);

    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    review.experience_rating = experience_rating !== undefined ? experience_rating : review.experience_rating;
    review.service_rating = service_rating !== undefined ? service_rating : review.service_rating;
    review.driver_rating = driver_rating !== undefined ? driver_rating : review.driver_rating;
    review.comment = comment !== undefined ? comment : review.comment;

    await review.save();
    res.json(review);
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  private
 */
const deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    await review.destroy();
    res.status(204).json({ message: 'Review deleted successfully' });
});

export {
    createReview,
    getAllReviews,
    getReviewsForTrip,
    getReviewsForUser,
    getReviewById,
    updateReview,
    deleteReview,
};
