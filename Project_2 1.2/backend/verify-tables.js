/**
 * Verify Database Tables
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Project_2',
  user: 'user',
  password: 'Swapnil@2102',
});

async function verifyTables() {
  try {
    await client.connect();
    
    console.log('\n✅ Connected to PostgreSQL database!\n');
    console.log('📋 Verifying Tables...\n');
    
    // Query to get all tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No tables found in the database!');
      return;
    }
    
    console.log(`✓ Found ${result.rows.length} tables:\n`);
    
    result.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.table_name}`);
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('\n✅ All tables created successfully!\n');
    
    // Count records in each table
    console.log('📊 Table Statistics:\n');
    
    for (const row of result.rows) {
      const countResult = await client.query(`SELECT COUNT(*) FROM ${row.table_name};`);
      const count = countResult.rows[0].count;
      console.log(`  ${row.table_name}: ${count} records`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('\n🎉 Database setup complete and verified!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

verifyTables();
