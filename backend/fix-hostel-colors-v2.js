#!/usr/bin/env node

const db = require('./src/config/database');

async function fixHostelColorsV2() {
    console.log('🎨 Applying improved hostel color scheme...');
    
    // Better color scheme with high contrast and clear distinction
    const colorScheme = {
        hostel: '#8B5CF6',      // Purple - distinct and professional
        building: '#10B981',     // Green - for academic buildings  
        dormitory: '#F59E0B',    // Orange - for dormitories
        other: '#6B7280'         // Gray - for other locations
    };
    
    const hostelNames = [
        // Matturi Blocks A-H
        'Matturi Block A', 'Matturi Block B', 'Matturi Block C', 'Matturi Block D',
        'Matturi Block E', 'Matturi Block F', 'Matturi Block G', 'Matturi Block H',
        
        // TK Dormitories  
        'TK. Jamaica', 'TK. Africa', 'TK. Asia', 'TK. America', 'TK. Europe',
        'T.K Jamaica', 'T.K Mosque',
        
        // Other Hostels
        'Heavens 1', 'Heavens 2',
        'Postgrad & Medicine', 'Postgrad & medicines Block',
        'Quadrangle 1', 'Quadrangle 2', 'Quardrangle 1',
        'Tourist', 'Winters', 'Winters Extension'
    ];
    
    let updatedCount = 0;
    
    // Update hostels to purple
    for (const hostelName of hostelNames) {
        try {
            const result = await db.query(`
                UPDATE locations 
                SET type = 'hostel', marker_color = $1, updated_at = NOW()
                WHERE name ILIKE $2
            `, [colorScheme.hostel, `%${hostelName}%`]);
            
            if (result.rowCount > 0) {
                console.log(`🟣 Updated ${hostelName} → Purple`);
                updatedCount += result.rowCount;
            }
        } catch (error) {
            console.error(`❌ Error updating ${hostelName}:`, error.message);
        }
    }
    
    // Pattern-based hostel updates
    await db.query(`
        UPDATE locations 
        SET type = 'hostel', marker_color = $1, updated_at = NOW()
        WHERE (name ILIKE '%matturi%' OR name ILIKE '%tk%' OR name ILIKE '%heaven%' 
               OR name ILIKE '%postgrad%' OR name ILIKE '%quad%' OR name ILIKE '%tourist%' 
               OR name ILIKE '%winter%') 
        AND type != 'hostel'
    `, [colorScheme.hostel]);
    
    // Fix building colors to green
    await db.query(`
        UPDATE locations 
        SET marker_color = $1, updated_at = NOW()
        WHERE type = 'building'
    `, [colorScheme.building]);
    
    // Fix dormitory colors to orange  
    await db.query(`
        UPDATE locations 
        SET marker_color = $1, updated_at = NOW()
        WHERE type = 'dormitory'
    `, [colorScheme.dormitory]);
    
    console.log(`\n🎉 Applied new color scheme:`);
    console.log(`🟣 Hostels: ${colorScheme.hostel} (Purple)`);
    console.log(`🟢 Buildings: ${colorScheme.building} (Green)`);
    console.log(`🟠 Dormitories: ${colorScheme.dormitory} (Orange)`);
    console.log(`\n✅ Updated ${updatedCount} locations!`);
}

fixHostelColorsV2().then(() => process.exit(0)).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});