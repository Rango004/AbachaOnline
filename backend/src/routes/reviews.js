const express = require('express');
const ReviewService = require('../services/ReviewService');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/:orderId', authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const review = await ReviewService.createReview(
      parseInt(req.params.orderId),
      req.user.id,
      rating,
      comment
    );

    res.status(201).json({ message: 'Review created', review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(400).json({ error: 'Failed to create review', message: error.message });
  }
});

router.get('/order/:orderId', async (req, res) => {
  try {
    const review = await ReviewService.getOrderReview(parseInt(req.params.orderId));
    res.json(review || {});
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ error: 'Failed to fetch review', message: error.message });
  }
});

router.get('/merchant/:merchantId/rating', async (req, res) => {
  try {
    const rating = await ReviewService.getMerchantRating(req.params.merchantId);
    res.json(rating);
  } catch (error) {
    console.error('Get rating error:', error);
    res.status(500).json({ error: 'Failed to fetch rating', message: error.message });
  }
});

module.exports = router;
