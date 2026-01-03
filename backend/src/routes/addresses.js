const express = require('express');
const DeliveryAddressService = require('../services/DeliveryAddressService');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/addresses/locations
 * @desc    Get all available locations (public route)
 * @access  Public
 */
router.get('/locations', async (req, res) => {
  try {
    const locations = await DeliveryAddressService.getAllLocations();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/addresses
 * @desc    Get user's addresses with pagination
 * @access  Private (Students)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const addresses = await DeliveryAddressService.getStudentAddresses(req.user.id, limit, offset);
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/addresses/default
 * @desc    Get user's default address
 * @access  Private (Students)
 */
router.get('/default', authenticate, async (req, res) => {
  try {
    const defaultAddress = await DeliveryAddressService.getDefaultAddress(req.user.id);
    res.json({ address: defaultAddress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/addresses/:id
 * @desc    Get specific address by ID
 * @access  Private (Students)
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const address = await DeliveryAddressService.getStudentAddressById(req.user.id, req.params.id);
    res.json(address);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/addresses
 * @desc    Create new address
 * @access  Private (Students)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { location_id, address_label, delivery_address, notes, is_default, latitude, longitude } = req.body;

    if (!address_label || !delivery_address) {
      return res.status(400).json({
        error: 'Address label and delivery address are required'
      });
    }

    const address = await DeliveryAddressService.createAddress(req.user.id, {
      location_id,
      address_label,
      delivery_address,
      notes,
      is_default,
      latitude,
      longitude
    });

    res.status(201).json({
      message: 'Address created successfully',
      address
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/v1/addresses/:id
 * @desc    Update address
 * @access  Private (Students)
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const address = await DeliveryAddressService.updateAddress(
      req.user.id,
      req.params.id,
      req.body
    );

    res.json({
      message: 'Address updated successfully',
      address
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/v1/addresses/:id
 * @desc    Delete address
 * @access  Private (Students)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const address = await DeliveryAddressService.deleteAddress(req.user.id, req.params.id);

    res.json({
      message: 'Address deleted successfully',
      address
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/addresses/:id/set-default
 * @desc    Set address as default
 * @access  Private (Students)
 */
router.post('/:id/set-default', authenticate, async (req, res) => {
  try {
    const address = await DeliveryAddressService.setDefaultAddress(req.user.id, req.params.id);

    res.json({
      message: 'Address set as default',
      address
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
