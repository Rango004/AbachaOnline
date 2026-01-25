const express = require('express');
const router = express.Router();
const { upload, cloudinary, uploadToCloudinary } = require('../config/cloudinary');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Upload product images (merchant only)
router.post('/products',
  authenticateToken,
  requireRole(['merchant']),
  upload.array('images', 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded' });
      }

      // Upload each file buffer to Cloudinary
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
      const results = await Promise.all(uploadPromises);

      const imageUrls = results.map(result => ({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      }));

      res.json({
        success: true,
        images: imageUrls,
        count: imageUrls.length
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete product image (merchant only)
router.delete('/products/:publicId',
  authenticateToken,
  requireRole(['merchant']),
  async (req, res) => {
    try {
      const { publicId } = req.params;
      await cloudinary.uploader.destroy(publicId);
      
      res.json({ success: true, message: 'Image deleted' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
