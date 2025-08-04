/**
 * Dudwalls SDK - Node.js Example
 * Complete example showing all major features
 */

const Dudwalls = require('dudwalls');

async function main() {
  // Initialize client
  const client = new Dudwalls({
    endpoint: 'https://your-dudwalls-instance.com',
    apiKey: 'your-api-key-here',
    debug: true
  });

  try {
    // Test connection
    console.log('🔗 Testing connection...');
    const health = await client.ping();
    console.log('✅ Connected successfully:', health.data);

    // Create database
    console.log('\n📁 Creating database...');
    await client.createDatabase('my-app');
    
    // Get database instance
    const db = client.database('my-app');
    
    // Create collection
    console.log('📄 Creating collection...');
    await db.createCollection('users');
    
    // Get collection instance
    const users = db.collection('users');

    // Insert documents
    console.log('\n➕ Inserting documents...');
    const user1 = await users.insertOne({
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      active: true
    });
    console.log('Inserted user:', user1);

    const user2 = await users.insertOne({
      name: 'Jane Smith',
      email: 'jane@example.com',
      age: 25,
      active: true
    });
    console.log('Inserted user:', user2);

    // Insert multiple documents
    const moreUsers = await users.insertMany([
      { name: 'Bob Wilson', email: 'bob@example.com', age: 35, active: false },
      { name: 'Alice Brown', email: 'alice@example.com', age: 28, active: true }
    ]);
    console.log('Inserted multiple users:', moreUsers.length);

    // Find all documents
    console.log('\n🔍 Finding all users...');
    const allUsers = await users.find();
    console.log('All users:', allUsers);

    // Find with query
    console.log('\n🔍 Finding active users...');
    const activeUsers = await users.find({
      where: { active: true },
      orderBy: { age: 'desc' },
      limit: 2
    });
    console.log('Active users:', activeUsers);

    // Find one document
    console.log('\n🔍 Finding one user...');
    const oneUser = await users.findOne(user1.id);
    console.log('Found user:', oneUser);

    // Update document
    console.log('\n✏️ Updating user...');
    const updatedUser = await users.updateOne(user1.id, {
      age: 31,
      lastLogin: new Date().toISOString()
    });
    console.log('Updated user:', updatedUser);

    // Update multiple documents
    console.log('\n✏️ Updating multiple users...');
    const updateResult = await users.updateMany(
      { where: { active: false } },
      { active: true, reactivatedAt: new Date().toISOString() }
    );
    console.log('Updated users:', updateResult);

    // Count documents
    console.log('\n🔢 Counting documents...');
    const totalUsers = await users.count();
    const activeCount = await users.count({ where: { active: true } });
    console.log(`Total users: ${totalUsers}, Active users: ${activeCount}`);

    // Aggregation
    console.log('\n📊 Aggregation example...');
    const ageStats = await users.aggregate([
      { $match: { active: true } },
      { $group: { 
        _id: null, 
        avgAge: { $avg: '$age' },
        minAge: { $min: '$age' },
        maxAge: { $max: '$age' },
        count: { $sum: 1 }
      }}
    ]);
    console.log('Age statistics:', ageStats);

    // Bulk operations
    console.log('\n📦 Bulk operations...');
    const bulkResult = await users.bulkWrite([
      { operation: 'create', data: { name: 'New User', email: 'new@example.com', age: 22 } },
      { operation: 'update', id: user2.id, data: { age: 26 } },
      { operation: 'delete', id: moreUsers[0].id }
    ]);
    console.log('Bulk operation result:', bulkResult);

    // Database statistics
    console.log('\n📈 Database statistics...');
    const dbStats = await db.getStats();
    console.log('Database stats:', dbStats);

    // Export data
    console.log('\n💾 Exporting data...');
    const exportedData = await db.exportData();
    console.log('Exported data:', Object.keys(exportedData));

    // List all databases
    console.log('\n📋 Listing databases...');
    const databases = await client.getDatabases();
    console.log('Databases:', databases);

    // Clean up (optional)
    console.log('\n🧹 Cleaning up...');
    // await users.drop(); // Delete collection
    // await client.deleteDatabase('my-app'); // Delete database

    console.log('\n✅ Example completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the example
main().catch(console.error);

// Export for testing
module.exports = { main };
