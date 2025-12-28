#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const hostelKeywords = [
    'matturi', 'tk', 'heaven', 'postgrad', 'quad', 'tourist', 'winter', 'dormitory', 'hostel'
];

function updateJsonHostels() {
    console.log('🔧 Updating locations.json hostel categorization...');
    
    const locationsPath = path.join(__dirname, 'locations.json');
    const data = JSON.parse(fs.readFileSync(locationsPath, 'utf-8'));
    
    let updatedCount = 0;
    
    data.locations.forEach(location => {
        const nameLC = location.name.toLowerCase();
        const isHostel = hostelKeywords.some(keyword => nameLC.includes(keyword));
        
        if (isHostel && location.type !== 'hostel') {
            location.type = 'hostel';
            location.marker_color = '#FF6B6B';
            console.log(`✅ Updated ${location.name} → hostel`);
            updatedCount++;
        }
    });
    
    // Update statistics
    data.statistics.by_type = {};
    data.locations.forEach(location => {
        data.statistics.by_type[location.type] = (data.statistics.by_type[location.type] || 0) + 1;
    });
    
    fs.writeFileSync(locationsPath, JSON.stringify(data, null, 2));
    
    console.log(`\n🎉 Updated ${updatedCount} locations in JSON file`);
    console.log('📊 New statistics:', data.statistics.by_type);
}

updateJsonHostels();