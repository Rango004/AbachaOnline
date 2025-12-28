const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

const router = express.Router();

/**
 * @route   GET /api/v1/locations
 * @desc    Get all locations with filtering and color coding
 * @access  Public
 * @query   type - Filter by location type (hostel, merchant, pickup_point, etc.)
 * @query   category - Filter by category
 */
router.get('/', async (req, res) => {
  try {
    const { type, category } = req.query;
    
    let query = 'SELECT * FROM locations';
    const params = [];
    const conditions = [];
    
    if (type) {
      conditions.push('type = $' + (params.length + 1));
      params.push(type);
    }
    
    if (category) {
      conditions.push('type = $' + (params.length + 1));
      params.push(category);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY name ASC';
    
    const result = await db.query(query, params);
    
    // Add color scheme information
    const colorScheme = {
      hostel: '#FF6B6B',
      merchant: '#4ECDC4',
      pickup_point: '#2ECC71',
      staff_quarter: '#F39C12',
      office: '#9B59B6',
      road: '#95A5A6',
      building: '#95E1D3',
      landmark: '#FFE66D'
    };
    
    res.json({ 
      locations: result.rows,
      color_scheme: colorScheme,
      total: result.rows.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/locations/geojson
 * @desc    Get all campus locations as GeoJSON FeatureCollection with enhanced filtering
 * @access  Public
 * @query   type - Filter by location type
 * @query   include_db - Include database locations (default: true)
 * @returns {GeoJSON.FeatureCollection} Features with locations, bounds, and campus center
 */
router.get('/geojson', async (req, res) => {
  try {
    const { type, include_db = 'true', source = 'auto' } = req.query;
    let allLocations = [];

    // Determine which source to use
    // 'auto' = prefer database, fallback to JSON
    // 'database' = only database
    // 'json' = only JSON file
    // 'both' = combine both (may have duplicates)

    let useDatabase = false;
    let useJsonFile = false;

    if (source === 'database') {
      useDatabase = true;
    } else if (source === 'json') {
      useJsonFile = true;
    } else if (source === 'both') {
      useDatabase = true;
      useJsonFile = true;
    } else {
      // 'auto' - prefer database if it has data
      useDatabase = true;
      useJsonFile = true; // fallback
    }

    // Try database first
    if (useDatabase && include_db === 'true') {
      try {
        let dbQuery = 'SELECT * FROM locations';
        const params = [];

        if (type) {
          dbQuery += ' WHERE type = $1';
          params.push(type);
        }

        const dbResult = await db.query(dbQuery, params);

        if (dbResult.rows.length > 0) {
          // Convert database format to standard format
          const dbLocations = dbResult.rows.map(row => ({
            id: `db_${row.id}`,
            name: row.name,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            type: row.type,
            marker_color: row.marker_color,
            source: 'database'
          }));

          allLocations = [...dbLocations];

          // If auto mode and database has data, skip JSON file to avoid duplicates
          if (source === 'auto') {
            useJsonFile = false;
            console.log(`[Locations API] Using ${dbResult.rows.length} locations from database`);
          }
        }
      } catch (dbError) {
        console.warn('[Locations API] Database query failed:', dbError.message);
      }
    }

    // Load from JSON file if needed (OSM data)
    if (useJsonFile && allLocations.length === 0) {
      const locationsFilePath = path.join(__dirname, '../../locations.json');
      if (fs.existsSync(locationsFilePath)) {
        const locationsData = JSON.parse(fs.readFileSync(locationsFilePath, 'utf-8'));
        allLocations = [...locationsData.locations];
        console.log(`[Locations API] Using ${allLocations.length} locations from JSON file`);
      }
    } else if (useJsonFile && source === 'both') {
      // Only combine if explicitly requested
      const locationsFilePath = path.join(__dirname, '../../locations.json');
      if (fs.existsSync(locationsFilePath)) {
        const locationsData = JSON.parse(fs.readFileSync(locationsFilePath, 'utf-8'));
        allLocations = [...allLocations, ...locationsData.locations];
      }
    }
    
    // Filter by type if specified
    if (type) {
      allLocations = allLocations.filter(loc => loc.type === type);
    }
    
    // Convert to GeoJSON FeatureCollection format
    const features = allLocations.map(location => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude] // GeoJSON uses [lon, lat]
      },
      properties: {
        id: location.id,
        name: location.name,
        type: location.type,
        marker_color: location.marker_color,
        source: location.source
      }
    }));
    
    // Calculate bounds from actual data
    const lats = allLocations.map(loc => loc.latitude).filter(lat => !isNaN(lat));
    const lons = allLocations.map(loc => loc.longitude).filter(lon => !isNaN(lon));
    
    const bounds = lats.length > 0 ? {
      south: Math.min(...lats),
      west: Math.min(...lons),
      north: Math.max(...lats),
      east: Math.max(...lons)
    } : {
      south: 8.1047,
      west: -12.0798,
      north: 8.1209,
      east: -12.0622
    };
    
    const campus_center = [
      (bounds.south + bounds.north) / 2,
      (bounds.west + bounds.east) / 2
    ];
    
    // Generate statistics
    const statistics = {
      total_locations: allLocations.length,
      by_type: {}
    };
    
    allLocations.forEach(location => {
      statistics.by_type[location.type] = (statistics.by_type[location.type] || 0) + 1;
    });

    const geojson = {
      type: 'FeatureCollection',
      features: features,
      properties: {
        bounds,
        campus_center,
        statistics,
        color_scheme: {
          hostel: '#FF6B6B',
          merchant: '#4ECDC4',
          pickup_point: '#2ECC71',
          staff_quarter: '#F39C12',
          office: '#9B59B6',
          road: '#95A5A6',
          building: '#95E1D3',
          landmark: '#FFE66D'
        },
        generated_at: new Date().toISOString()
      }
    };

    // Set caching headers for mobile optimization
    res.set({
      'Cache-Control': 'public, max-age=1800, s-maxage=3600', // 30 min client, 1 hour server
      'Content-Type': 'application/geo+json',
      'ETag': `"${Buffer.from(JSON.stringify(geojson)).toString('base64').slice(0, 16)}"`,
      'Last-Modified': new Date().toUTCString()
    });

    res.json(geojson);
  } catch (error) {
    console.error('[Locations API] Error serving GeoJSON:', error);
    res.status(500).json({
      error: 'Failed to serve locations data',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/locations/types
 * @desc    Get available location types and their color codes
 * @access  Public
 */
router.get('/types', (req, res) => {
  const locationTypes = {
    hostel: {
      name: 'Hostels & Dormitories',
      color: '#FF6B6B',
      description: 'Student accommodation facilities'
    },
    merchant: {
      name: 'Merchants & Shops',
      color: '#4ECDC4',
      description: 'Shops, restaurants, and commercial services'
    },
    pickup_point: {
      name: 'Rider Pickup Points',
      color: '#2ECC71',
      description: 'Designated pickup locations for delivery riders'
    },
    staff_quarter: {
      name: 'Staff Quarters',
      color: '#F39C12',
      description: 'Faculty and staff residential areas'
    },
    office: {
      name: 'Offices & Administration',
      color: '#9B59B6',
      description: 'Administrative and academic offices'
    },
    road: {
      name: 'Roads & Paths',
      color: '#95A5A6',
      description: 'Campus roads and pathways'
    },
    building: {
      name: 'Buildings',
      color: '#95E1D3',
      description: 'Academic and service buildings'
    },
    landmark: {
      name: 'Landmarks',
      color: '#FFE66D',
      description: 'Notable campus landmarks and facilities'
    }
  };
  
  res.json({
    types: locationTypes,
    total_types: Object.keys(locationTypes).length
  });
});

/**
 * @route   GET /api/v1/locations/stats
 * @desc    Get location statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        type,
        COUNT(*) as count,
        AVG(latitude) as avg_lat,
        AVG(longitude) as avg_lon
      FROM locations 
      GROUP BY type
      ORDER BY count DESC
    `);
    
    const totalResult = await db.query('SELECT COUNT(*) as total FROM locations');
    
    res.json({
      by_type: result.rows,
      total_locations: parseInt(totalResult.rows[0].total),
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
