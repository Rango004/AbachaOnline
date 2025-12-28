const express = require('express');
const https = require('https');

const router = express.Router();

/**
 * @route   GET /api/v1/tiles/:z/:x/:y
 * @desc    Proxy tile requests to CartoDB to avoid certificate validation issues on frontend
 * @access  Public
 * @params  z - zoom level, x - tile column, y - tile row
 * @returns {Buffer} PNG tile image
 */
router.get('/:z/:x/:y', async (req, res) => {
  try {
    const { z, x, y } = req.params;

    // Validate tile coordinates
    const zoom = parseInt(z, 10);
    const col = parseInt(x, 10);
    const row = parseInt(y, 10);

    if (isNaN(zoom) || isNaN(col) || isNaN(row)) {
      return res.status(400).json({ error: 'Invalid tile coordinates' });
    }

    // Constrain to reasonable zoom levels (OSM tiles are reliable up to zoom 18)
    // Zoom 19-20 may not exist for all areas, especially less-mapped regions
    if (zoom < 0 || zoom > 18) {
      return res.status(400).json({ error: 'Invalid zoom level. Maximum zoom is 18.' });
    }

    // OpenStreetMap tile URL (more reliable than CartoDB)
    const tileUrl = `https://tile.openstreetmap.org/${zoom}/${col}/${row}.png`;

    // Fetch tile with proper User-Agent and headers for OpenStreetMap compliance
    const options = {
      rejectUnauthorized: false,
      headers: {
        'User-Agent': 'WeGo-Delivery-App/1.0 (Campus Delivery Platform; node.js backend proxy)',
        'Referer': 'http://localhost:8080',
        'Accept': 'image/png,image/*;q=0.8,*/*;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      }
    };

    const request = https.get(tileUrl, options, (response) => {
      console.log(`[Tiles API] OSM response status: ${response.statusCode} for z${zoom}/${col}/${row}`);

      // Handle redirects (3xx status codes)
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Follow the redirect
        const redirectUrl = response.headers.location;
        console.log(`[Tiles API] Following redirect to: ${redirectUrl}`);
        const protocol = redirectUrl.startsWith('https') ? https : require('http');
        const redirectOptions = {
          rejectUnauthorized: false,
          headers: options.headers
        };
        return protocol.get(redirectUrl, redirectOptions, (redirectResponse) => {
          console.log(`[Tiles API] Redirected response status: ${redirectResponse.statusCode}`);
          if (redirectResponse.statusCode !== 200) {
            return res.status(404).json({ error: 'Tile not found' });
          }

          // Set appropriate headers
          res.set({
            'Content-Type': redirectResponse.headers['content-type'] || 'image/png',
            'Cache-Control': 'public, max-age=31536000', // Cache tiles for 1 year
            'Access-Control-Allow-Origin': '*'
          });

          redirectResponse.pipe(res);
        }).on('error', (error) => {
          console.error('[Tiles API] Error fetching redirected tile:', error.message);
          res.status(502).json({ error: 'Failed to fetch tile', message: error.message });
        });
      }

      // Handle non-redirect responses
      if (response.statusCode !== 200) {
        console.warn(`[Tiles API] Tile not found: z${zoom}/${col}/${row} (status: ${response.statusCode})`);
        // Return a 1x1 transparent PNG instead of 404 to prevent map errors
        const transparentPng = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'base64'
        );
        res.set({
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour (shorter than success)
          'Access-Control-Allow-Origin': '*'
        });
        return res.send(transparentPng);
      }

      // Set appropriate headers
      res.set({
        'Content-Type': response.headers['content-type'] || 'image/png',
        'Cache-Control': 'public, max-age=31536000', // Cache tiles for 1 year
        'Access-Control-Allow-Origin': '*'
      });

      // Pipe the response directly to the client
      response.pipe(res);
    });

    // Handle errors
    request.on('error', (error) => {
      console.error('[Tiles API] Error fetching tile:', error.message, error.code);
      res.status(502).json({ error: 'Failed to fetch tile', message: error.message });
    });

  } catch (error) {
    console.error('[Tiles API] Error handling tile request:', error);
    res.status(500).json({
      error: 'Failed to proxy tile',
      message: error.message
    });
  }
});

module.exports = router;
