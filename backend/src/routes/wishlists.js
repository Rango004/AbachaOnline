const express = require('express');
const WishlistService = require('../services/WishlistService');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/wishlists
 * @desc    Get user's wishlist with pagination
 * @access  Private (Students)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const wishlist = await WishlistService.getWishlist(req.user.id, limit, offset);
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/wishlists/count
 * @desc    Get wishlist count for current user
 * @access  Private (Students)
 */
router.get('/count', authenticate, async (req, res) => {
  try {
    const count = await WishlistService.getWishlistCount(req.user.id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/wishlists/check/:productId
 * @desc    Check if product is in user's wishlist
 * @access  Private (Students)
 */
router.get('/check/:productId', authenticate, async (req, res) => {
  try {
    const inWishlist = await WishlistService.isInWishlist(req.user.id, req.params.productId);
    res.json({ inWishlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/wishlists
 * @desc    Add product to wishlist
 * @access  Private (Students)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const result = await WishlistService.addToWishlist(req.user.id, productId);
    res.status(201).json({
      message: 'Added to wishlist',
      wishlistItem: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/v1/wishlists/:productId
 * @desc    Remove product from wishlist
 * @access  Private (Students)
 */
router.delete('/:productId', authenticate, async (req, res) => {
  try {
    const result = await WishlistService.removeFromWishlist(req.user.id, req.params.productId);
    res.json({
      message: 'Removed from wishlist',
      wishlistItem: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/v1/wishlists
 * @desc    Clear entire wishlist
 * @access  Private (Students)
 */
router.delete('/', authenticate, async (req, res) => {
  try {
    const result = await WishlistService.clearWishlist(req.user.id);
    res.json({
      message: 'Wishlist cleared',
      removedCount: result.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/wishlists/check-multiple
 * @desc    Check multiple product IDs in wishlist
 * @access  Private (Students)
 */
router.post('/check-multiple', authenticate, async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds)) {
      return res.status(400).json({ error: 'Product IDs must be an array' });
    }

    const wishedProductIds = await WishlistService.getWishlistByProductIds(req.user.id, productIds);
    res.json({ wishlistedProductIds: wishedProductIds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
