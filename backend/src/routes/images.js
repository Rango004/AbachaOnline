const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../config/cloudinary');
const { authenticate, authorize } = require('../middleware/auth');
const db = require('../config/database');

// Upload product images (merchant only)
router.post('/upload', 
  authenticate, 
  authorize('merchant', 'admin'),
  upload.array('images', 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded' });
      }

      const imageUrls = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));

      res.json({
        success: true,
        images: imageUrls,
        count: imageUrls.length
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ error: 'Image upload failed', message: error.message });
    }
  }
);

// Delete image (merchant only)
router.delete('/delete/:publicId', 
  authenticate, 
  authorize('merchant', 'admin'),
  async (req, res) => {
    try {
      const { publicId } = req.params;
      await cloudinary.uploader.destroy(publicId);
      
      res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
      console.error('Image deletion error:', error);
      res.status(500).json({ error: 'Image deletion failed' });
    }
  }
);

// Get optimized image URL
router.get('/optimize', (req, res) => {
  const { publicId, width = 400, height = 400 } = req.query;
  
  if (!publicId) {
    return res.status(400).json({ error: 'publicId is required' });
  }

  const optimizedUrl = cloudinary.url(publicId, {
    width: parseInt(width),
    height: parseInt(height),
    crop: 'fill',
    quality: 'auto:good',
    fetch_format: 'auto'
  });

  // Return the optimized Cloudinary URL as JSON to avoid cross-origin
  // redirect issues in browsers and allow the frontend to set `img.src`.
  const origin = req.headers.origin || '*';
  res.set('Access-Control-Allow-Origin', origin);
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return res.json({ url: optimizedUrl });
});

module.exports = router;
