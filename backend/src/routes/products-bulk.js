const express = require('express');
const ProductService = require('../services/ProductService');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/bulk-import', authenticate, authorize('merchant', 'admin'), async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Products array is required and must not be empty'
      });
    }

    if (products.length > 500) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Maximum 500 products per import'
      });
    }

    const results = await ProductService.bulkImportProducts(products, req.user.id);

    res.status(201).json({
      message: 'Bulk import completed',
      ...results
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(400).json({
      error: 'Bulk import failed',
      message: error.message
    });
  }
});

module.exports = router;
