const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/user/role
 * @desc    Get user role and appropriate frontend route
 * @access  Private
 */
router.get('/role', authenticate, (req, res) => {
  const role = req.user.role;
  
  const roleRoutes = {
    rider: '/rider-dashboard',
    merchant: '/merchant-dashboard',
    admin: '/admin-panel',
    customer: '/products',
    student: '/products'
  };
  
  res.json({
    role,
    route: roleRoutes[role] || '/products',
    user: {
      id: req.user.id,
      name: req.user.name,
      phone: req.user.phone
    }
  });
});

module.exports = router;