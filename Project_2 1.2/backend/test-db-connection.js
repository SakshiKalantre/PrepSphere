/**
 * Test PostgreSQL Connection
 */

const { Client } = require('pg');

console.log('Testing PostgreSQL connection...\n');

const testConnections = [
  {
    name: 'Connection 1: Project_2 database',
    config: {
      host: 'localhost',
      port: 5432,
      database: 'Project_2',
      user: 'user',
      password: 'Swapnil@2102',
    }
  },
  {
    name: 'Connection 2: Postgres superuser',
    config: {
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: '',
    }
  }
];

async function testConnection(testConfig) {
  const client = new Client(testConfig.config);
  
  try {
    console.log(`🔄 Testing: ${testConfig.name}`);
    console.log(`   Host: ${testConfig.config.host}:${testConfig.config.port}`);
    console.log(`   Database: ${testConfig.config.database}`);
    console.log(`   User: ${testConfig.config.user}`);
    
    await client.connect();
    console.log(`✓ Connection successful!\n`);
    
    // Test query
    const result = await client.query('SELECT version();');
    console.log(`PostgreSQL Version: ${result.rows[0].version.split(',')[0]}\n`);
    
    await client.end();
    return true;
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(60) + '\n');
  
  for (const testConfig of testConnections) {
    await testConnection(testConfig);
  }
  
  console.log('='.repeat(60));
  console.log('\nTroubleshooting tips:');
  console.log('1. Ensure PostgreSQL is running');
  console.log('2. Verify database "Project_2" exists');
  console.log('3. Check username "user" and password "Swapnil@2102"');
  console.log('4. If connection fails, try connecting with psql:');
  console.log('   psql -h localhost -U user -d Project_2');
}

runTests();
