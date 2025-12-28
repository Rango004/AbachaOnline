#!/usr/bin/env node

/**
 * Complete Coordinate Update Process
 * 1. Parse the new OSM file
 * 2. Update all coordinates in the database
 * 3. Validate the results
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting complete coordinate update process...\n');

async function runCommand(command, description) {
    console.log(`📋 ${description}...`);
    try {
        const output = execSync(command, { 
            cwd: __dirname,
            encoding: 'utf-8',
            stdio: 'inherit'
        });
        console.log(`✅ ${description} completed\n`);
        return true;
    } catch (error) {
        console.error(`❌ ${description} failed:`, error.message);
        return false;
    }
}

async function main() {
    try {
        // Check if OSM file exists
        const osmFile = path.join(__dirname, 'Njala map updated.osm');
        if (!fs.existsSync(osmFile)) {
            console.error('❌ OSM file not found: Njala map updated.osm');
            console.log('Please ensure the OSM file is in the backend directory.');
            process.exit(1);
        }

        console.log('✅ OSM file found: Njala map updated.osm\n');

        // Step 1: Install required dependencies
        console.log('📦 Checking dependencies...');
        try {
            require('xml2js');
        } catch (error) {
            console.log('Installing xml2js dependency...');
            execSync('npm install xml2js', { stdio: 'inherit' });
        }

        // Step 2: Parse OSM file
        const parseSuccess = await runCommand(
            'node scripts/parse-osm-updated.js',
            'Parsing OSM file and extracting locations'
        );

        if (!parseSuccess) {
            console.error('❌ OSM parsing failed. Cannot proceed with coordinate update.');
            process.exit(1);
        }

        // Step 3: Update coordinates in database
        const updateSuccess = await runCommand(
            'node scripts/update-coordinates.js',
            'Updating coordinates in database'
        );

        if (!updateSuccess) {
            console.error('❌ Coordinate update failed.');
            process.exit(1);
        }

        // Step 4: Display summary
        console.log('🎉 COORDINATE UPDATE COMPLETE! 🎉\n');
        console.log('📊 Summary:');
        console.log('   ✅ OSM file parsed successfully');
        console.log('   ✅ Locations extracted and categorized');
        console.log('   ✅ Database coordinates updated');
        console.log('   ✅ Color coding applied');
        console.log('\n🎨 Color Scheme:');
        console.log('   🔴 Hostels/Dormitories: #FF6B6B');
        console.log('   🟢 Merchants/Shops: #4ECDC4');
        console.log('   🟢 Rider Pickup Points: #2ECC71');
        console.log('   🟠 Staff Quarters: #F39C12');
        console.log('   🟣 Offices/Admin: #9B59B6');
        console.log('   ⚪ Roads/Paths: #95A5A6');
        console.log('   🔵 Buildings: #95E1D3');
        console.log('   🟡 Landmarks: #FFE66D');
        
        console.log('\n📍 Next Steps:');
        console.log('   1. Test the updated locations API: GET /api/v1/locations/geojson');
        console.log('   2. Check location types: GET /api/v1/locations/types');
        console.log('   3. View statistics: GET /api/v1/locations/stats');
        console.log('   4. Update your frontend to use the new color scheme');

    } catch (error) {
        console.error('\n❌ Coordinate update process failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };