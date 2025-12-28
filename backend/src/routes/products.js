const express = require('express');
const ProductService = require('../services/ProductService');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with optional filters
 * @access  Public
 * @query   ?category=food&min_price=10&max_price=50&search=rice&limit=20&offset=0
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      merchant_id: req.query.merchant_id,
      min_price: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
      max_price: req.query.max_price ? parseFloat(req.query.max_price) : undefined,
      is_available: req.query.is_available === 'true' ? true : req.query.is_available === 'false' ? false : undefined,
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : 1000,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const products = await ProductService.getProducts(filters);

    res.json({
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/products/categories
 * @desc    Get all product categories
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await ProductService.getCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/products/search
 * @desc    Search products by name or description
 * @access  Public
 * @query   ?q=keyword&limit=20
 */
router.get('/search', async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q) {
      return res.status(400).json({
        error: 'Search term required',
        message: 'Please provide a search query parameter "q"'
      });
    }

    const products = await ProductService.searchProducts(
      q,
      limit ? parseInt(limit) : 20
    );

    res.json({
      search_term: q,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get a single product by ID
 * @access  Public
 */
router.get('/:id(\\d+)', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({
        error: 'Invalid product ID',
        message: 'Product ID must be a number'
      });
    }

    const product = await ProductService.getProductById(productId);
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);

    if (error.message === 'Product not found') {
      return res.status(404).json({
        error: 'Product not found',
        message: `Product with ID ${req.params.id} does not exist`
      });
    }

    res.status(500).json({
      error: 'Failed to fetch product',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/products
 * @desc    Create a new product
 * @access  Private (Merchants only)
 */
router.post('/', authenticate, authorize('merchant', 'admin'), async (req, res) => {
  try {
    const { name, description, price, category, image_url, stock_quantity } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Product name and price are required'
      });
    }

    if (price < 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Price cannot be negative'
      });
    }

    const productData = {
      name,
      description,
      price: parseFloat(price),
      category,
      image_url,
      stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0
    };

    const product = await ProductService.createProduct(productData, req.user.id);

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(400).json({
      error: 'Failed to create product',
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update a product
 * @access  Private (Merchants - own products only)
 */
router.put('/:id', authenticate, authorize('merchant', 'admin'), async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({
        error: 'Invalid product ID',
        message: 'Product ID must be a number'
      });
    }

    const updates = req.body;

    // Validate price if provided
    if (updates.price !== undefined && updates.price < 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Price cannot be negative'
      });
    }

    const product = await ProductService.updateProduct(productId, updates, req.user.id);

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);

    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message
      });
    }

    if (error.message === 'Product not found') {
      return res.status(404).json({
        error: 'Product not found',
        message: error.message
      });
    }

    res.status(400).json({
      error: 'Failed to update product',
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete a product (soft delete)
 * @access  Private (Merchants - own products only)
 */
router.delete('/:id', authenticate, authorize('merchant', 'admin'), async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({
        error: 'Invalid product ID',
        message: 'Product ID must be a number'
      });
    }

    const result = await ProductService.deleteProduct(productId, req.user.id);

    res.json(result);
  } catch (error) {
    console.error('Delete product error:', error);

    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message
      });
    }

    if (error.message === 'Product not found') {
      return res.status(404).json({
        error: 'Product not found',
        message: error.message
      });
    }

    res.status(400).json({
      error: 'Failed to delete product',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/products/merchant/:id/location
 * @desc    Get merchant GPS location
 * @access  Public
 */
router.get('/merchant/:id/location', async (req, res) => {
  try {
    const merchantId = parseInt(req.params.id);
    const db = require('../config/database');
    
    const result = await db.query(
      'SELECT latitude, longitude, name FROM users WHERE id = $1 AND role = $2',
      [merchantId, 'merchant']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/products/merchant/my-products
 * @desc    Get current merchant's products
 * @access  Private (Merchants only)
 */
router.get('/merchant/my-products', authenticate, authorize('merchant', 'admin'), async (req, res) => {
  try {
    const products = await ProductService.getMerchantProducts(req.user.id);

    res.json({
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get merchant products error:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

module.exports = router;
