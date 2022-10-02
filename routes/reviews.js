const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

// We want to remove both instances of the review. The reference to the review on the campground object and also the actual review itself
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;