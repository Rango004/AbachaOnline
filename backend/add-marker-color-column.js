#!/usr/bin/env node

const db = require('./src/config/database');

async function addMarkerColorColumn() {
    console.log('🔧 Adding marker_color column to locations table...');
    
    try {
        // Check if column already exists
        const checkResult = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'locations' AND column_name = 'marker_color'
        `);
        
        if (checkResult.rows.length > 0) {
            console.log('✅ marker_color column already exists');
            return;
        }
        
        // Add the column
        await db.query(`
            ALTER TABLE locations 
            ADD COLUMN marker_color VARCHAR(7),
            ADD COLUMN source_id VARCHAR(100),
            ADD COLUMN metadata JSONB,
            ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()
        `);
        
        console.log('✅ Added marker_color, source_id, metadata, and updated_at columns');
        
        // Set default colors for existing locations
        await db.query(`
            UPDATE locations 
            SET marker_color = '#FFE66D', 
                source_id = 'legacy',
                metadata = '{"source": "legacy"}',
                updated_at = NOW()
            WHERE marker_color IS NULL
        `);
        
        console.log('✅ Set default colors for existing locations');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        process.exit(0);
    }
}

addMarkerColorColumn();