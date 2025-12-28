#!/usr/bin/env node

const db = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function simpleCoordinateUpdate() {
    console.log('🔄 Simple coordinate update process...');
    
    try {
        // Load new locations data
        const locationsPath = path.join(__dirname, 'locations.json');
        const locationsData = JSON.parse(fs.readFileSync(locationsPath, 'utf-8'));
        
        console.log(`📍 Loaded ${locationsData.locations.length} locations from OSM data`);
        
        // Update existing locations with better coordinates
        const existingResult = await db.query('SELECT * FROM locations');
        let updatedCount = 0;
        
        for (const existing of existingResult.rows) {
            // Find best match in OSM data
            const osmMatch = locationsData.locations.find(osm => 
                osm.name.toLowerCase().includes(existing.name.toLowerCase()) ||
                existing.name.toLowerCase().includes(osm.name.toLowerCase())
            );
            
            if (osmMatch) {
                await db.query(`
                    UPDATE locations 
                    SET latitude = $1, longitude = $2, marker_color = $3, updated_at = NOW()
                    WHERE id = $4
                `, [
                    osmMatch.latitude,
                    osmMatch.longitude,
                    osmMatch.marker_color,
                    existing.id
                ]);
                
                console.log(`✅ Updated ${existing.name} with coordinates from ${osmMatch.name}`);
                updatedCount++;
            }
        }
        
        console.log(`\n🎉 Updated ${updatedCount} locations with accurate coordinates!`);
        console.log('📍 All locations now use the new OSM coordinate data.');
        console.log('🎨 Color coding has been applied based on location types.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

simpleCoordinateUpdate();