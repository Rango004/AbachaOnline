#!/usr/bin/env node

const db = require('./src/config/database');

async function fixHostelColors() {
    console.log('🔧 Fixing hostel color coding...');
    
    const hostelNames = [
        // Matturi Blocks A-G
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
    
    for (const hostelName of hostelNames) {
        try {
            const result = await db.query(`
                UPDATE locations 
                SET type = 'hostel', marker_color = '#FF6B6B', updated_at = NOW()
                WHERE name ILIKE $1
            `, [`%${hostelName}%`]);
            
            if (result.rowCount > 0) {
                console.log(`✅ Updated ${hostelName} → Hostel (Red)`);
                updatedCount += result.rowCount;
            }
        } catch (error) {
            console.error(`❌ Error updating ${hostelName}:`, error.message);
        }
    }
    
    // Also update by pattern matching
    await db.query(`
        UPDATE locations 
        SET type = 'hostel', marker_color = '#FF6B6B', updated_at = NOW()
        WHERE (name ILIKE '%matturi%' OR name ILIKE '%tk%' OR name ILIKE '%heaven%' 
               OR name ILIKE '%postgrad%' OR name ILIKE '%quad%' OR name ILIKE '%tourist%' 
               OR name ILIKE '%winter%') 
        AND type != 'hostel'
    `);
    
    console.log(`\n🎉 Fixed ${updatedCount} hostel locations!`);
    console.log('🔴 All hostels now have red color coding (#FF6B6B)');
}

fixHostelColors();