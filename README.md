# Dudwalls SDK

[![npm version](https://badge.fury.io/js/dudwalls.svg)](https://badge.fury.io/js/dudwalls)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**Official SDK for Dudwalls NoSQL Database** - A modern, self-hosted alternative to MongoDB and Firebase with enterprise features and zero vendor lock-in.

## 🚀 Features

- **🔥 Modern API**: MongoDB-like interface with TypeScript support
- **⚡ High Performance**: Optimized for speed with connection pooling
- **🛡️ Type Safe**: Full TypeScript definitions included
- **🌐 Multi-Language**: SDKs available for 8+ programming languages
- **📊 Advanced Querying**: Complex filters, aggregation, and sorting
- **🔄 Real-time Updates**: WebSocket support for live data
- **📦 Bulk Operations**: Efficient batch processing
- **🎯 Zero Dependencies**: Lightweight with minimal footprint
- **🔐 Secure**: API key authentication with user isolation
- **📈 Analytics Ready**: Built-in logging and monitoring

## 📦 Installation

```bash
# npm
npm install dudwalls

# yarn
yarn add dudwalls

# pnpm
pnpm add dudwalls
```

## 🏃‍♂️ Quick Start

```typescript
import Dudwalls from 'dudwalls';

// Initialize client
const client = new Dudwalls({
  endpoint: 'https://your-dudwalls-instance.com',
  apiKey: 'your-api-key-here'
});

// Create database and collection
const db = client.database('my-app');
const users = db.collection('users');

// Insert document
const user = await users.insertOne({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});

// Find documents
const allUsers = await users.find();
const activeUsers = await users.find({
  where: { active: true },
  orderBy: { createdAt: 'desc' },
  limit: 10
});

// Update document
await users.updateOne(user.id, {
  lastLogin: new Date().toISOString()
});

// Delete document
await users.deleteOne(user.id);
```

## 📚 Documentation

### Client Configuration

```typescript
const client = new Dudwalls({
  endpoint: 'https://your-dudwalls-instance.com',  // Required
  apiKey: 'your-api-key-here',                     // Required
  timeout: 10000,                                  // Optional (default: 10000ms)
  debug: false,                                    // Optional (default: false)
  headers: {                                       // Optional
    'Custom-Header': 'value'
  }
});
```

### Database Operations

```typescript
// List all databases
const databases = await client.getDatabases();

// Create database
await client.createDatabase('my-app');

// Delete database
await client.deleteDatabase('my-app');

// Get database instance
const db = client.database('my-app');
// or
const db = client.db('my-app');
```

### Collection Operations

```typescript
const db = client.database('my-app');

// List collections
const collections = await db.getCollections();

// Create collection
await db.createCollection('users');

// Delete collection
await db.deleteCollection('users');

// Get collection instance
const users = db.collection('users');
```

### Document Operations

#### Insert Documents

```typescript
// Insert single document
const user = await users.insertOne({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  active: true
});

// Insert multiple documents
const newUsers = await users.insertMany([
  { name: 'Jane Smith', email: 'jane@example.com', age: 25 },
  { name: 'Bob Wilson', email: 'bob@example.com', age: 35 }
]);
```

#### Find Documents

```typescript
// Find all documents
const allUsers = await users.find();

// Find with query
const results = await users.find({
  where: {
    age: { $gte: 18, $lt: 65 },
    active: true,
    name: { $regex: 'John' }
  },
  orderBy: { createdAt: 'desc', age: 'asc' },
  limit: 10,
  skip: 20,
  select: ['name', 'email', 'age']
});

// Find one document
const user = await users.findOne('user-id');

// Find first matching document
const firstActive = await users.findFirst({
  where: { active: true }
});
```

#### Update Documents

```typescript
// Update single document
const updated = await users.updateOne('user-id', {
  age: 31,
  lastLogin: new Date().toISOString()
});

// Update multiple documents
const result = await users.updateMany(
  { where: { active: false } },
  { active: true, reactivatedAt: new Date().toISOString() }
);

// Replace entire document
const replaced = await users.replaceOne('user-id', {
  name: 'John Smith',
  email: 'johnsmith@example.com',
  age: 31
});

// Upsert (update or insert)
const upserted = await users.upsert({
  id: 'user-123',
  name: 'New User',
  email: 'new@example.com'
});
```

#### Delete Documents

```typescript
// Delete single document
await users.deleteOne('user-id');

// Delete multiple documents
const result = await users.deleteMany({
  where: { active: false }
});
```

### Advanced Querying

#### Query Operators

```typescript
// Comparison operators
await users.find({
  where: {
    age: { $eq: 30 },        // Equal
    age: { $ne: 30 },        // Not equal
    age: { $gt: 18 },        // Greater than
    age: { $gte: 18 },       // Greater than or equal
    age: { $lt: 65 },        // Less than
    age: { $lte: 65 },       // Less than or equal
    status: { $in: ['active', 'pending'] },     // In array
    status: { $nin: ['banned', 'deleted'] },    // Not in array
    name: { $regex: '^John' }                   // Regular expression
  }
});

// Logical operators
await users.find({
  where: {
    $and: [
      { age: { $gte: 18 } },
      { active: true }
    ],
    $or: [
      { role: 'admin' },
      { role: 'moderator' }
    ]
  }
});
```

#### Aggregation

```typescript
// Basic aggregation
const stats = await users.aggregate([
  { $match: { active: true } },
  { $group: {
    _id: null,
    totalUsers: { $sum: 1 },
    avgAge: { $avg: '$age' },
    minAge: { $min: '$age' },
    maxAge: { $max: '$age' }
  }}
]);

// Group by field
const usersByRole = await users.aggregate([
  { $group: {
    _id: '$role',
    count: { $sum: 1 },
    avgAge: { $avg: '$age' }
  }},
  { $sort: { count: -1 } }
]);
```

### Bulk Operations

```typescript
const operations = [
  { operation: 'create', data: { name: 'New User', email: 'new@example.com' } },
  { operation: 'update', id: 'user-123', data: { age: 31 } },
  { operation: 'delete', id: 'user-456' }
];

const result = await users.bulkWrite(operations);
console.log(`Success: ${result.success}, Failed: ${result.failed}`);
```

### Utility Methods

```typescript
// Count documents
const total = await users.count();
const activeCount = await users.count({ where: { active: true } });

// Check if document exists
const exists = await users.exists('user-id');

// Get distinct values
const roles = await users.distinct('role');
const activeRoles = await users.distinct('role', { where: { active: true } });

// Drop collection
await users.drop();
```

### Database Statistics

```typescript
// Get database statistics
const stats = await db.getStats();
console.log(`Collections: ${stats.collections}`);
console.log(`Total Documents: ${stats.totalDocuments}`);
console.log(`Estimated Size: ${stats.estimatedSize} bytes`);

// Export all data
const exportData = await db.exportData();

// Import data
const importResult = await db.importData(exportData, {
  overwrite: true,
  createCollections: true
});
```

## 🌍 Multi-Language Support

Dudwalls provides official SDKs for multiple programming languages:

### JavaScript/TypeScript (Node.js)
```bash
npm install dudwalls
```

### Python
```python
# Install via pip (coming soon)
pip install dudwalls

# Or use the HTTP client directly
import requests

class DudwallsClient:
    def __init__(self, endpoint, api_key):
        self.endpoint = endpoint
        self.api_key = api_key
        self.headers = {'Authorization': f'Bearer {api_key}'}
    
    def find(self, database, collection):
        response = requests.get(
            f'{self.endpoint}/api/dudwalls/{database}/{collection}',
            headers=self.headers
        )
        return response.json()
```

### PHP
```php
<?php
class DudwallsClient {
    private $endpoint;
    private $apiKey;
    
    public function __construct($endpoint, $apiKey) {
        $this->endpoint = $endpoint;
        $this->apiKey = $apiKey;
    }
    
    public function find($database, $collection) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => "{$this->endpoint}/api/dudwalls/{$database}/{$collection}",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer {$this->apiKey}",
                "Content-Type: application/json"
            ]
        ]);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
}
?>
```

### Go
```go
package main

import (
    "encoding/json"
    "net/http"
)

type DudwallsClient struct {
    Endpoint string
    APIKey   string
}

func (c *DudwallsClient) Find(database, collection string) ([]map[string]interface{}, error) {
    req, _ := http.NewRequest("GET", 
        c.Endpoint+"/api/dudwalls/"+database+"/"+collection, nil)
    req.Header.Set("Authorization", "Bearer "+c.APIKey)
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    var result []map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
    return result, nil
}
```

### Java
```java
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

public class DudwallsClient {
    private String endpoint;
    private String apiKey;
    private HttpClient client;
    
    public DudwallsClient(String endpoint, String apiKey) {
        this.endpoint = endpoint;
        this.apiKey = apiKey;
        this.client = HttpClient.newHttpClient();
    }
    
    public String find(String database, String collection) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(endpoint + "/api/dudwalls/" + database + "/" + collection))
            .header("Authorization", "Bearer " + apiKey)
            .GET()
            .build();
            
        HttpResponse<String> response = client.send(request, 
            HttpResponse.BodyHandlers.ofString());
        return response.body();
    }
}
```

### C#
```csharp
using System.Net.Http;
using System.Threading.Tasks;

public class DudwallsClient
{
    private readonly HttpClient _httpClient;
    private readonly string _endpoint;
    
    public DudwallsClient(string endpoint, string apiKey)
    {
        _endpoint = endpoint;
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
    }
    
    public async Task<string> FindAsync(string database, string collection)
    {
        var response = await _httpClient.GetAsync(
            $"{_endpoint}/api/dudwalls/{database}/{collection}");
        return await response.Content.ReadAsStringAsync();
    }
}
```

### Ruby
```ruby
require 'net/http'
require 'json'

class DudwallsClient
  def initialize(endpoint, api_key)
    @endpoint = endpoint
    @api_key = api_key
  end
  
  def find(database, collection)
    uri = URI("#{@endpoint}/api/dudwalls/#{database}/#{collection}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == 'https'
    
    request = Net::HTTP::Get.new(uri)
    request['Authorization'] = "Bearer #{@api_key}"
    
    response = http.request(request)
    JSON.parse(response.body)
  end
end
```

## 🔧 Configuration

### Environment Variables

```bash
# .env file
DUDWALLS_ENDPOINT=https://your-dudwalls-instance.com
DUDWALLS_API_KEY=your-api-key-here
DUDWALLS_TIMEOUT=10000
DUDWALLS_DEBUG=false
```

```typescript
import Dudwalls from 'dudwalls';

const client = new Dudwalls({
  endpoint: process.env.DUDWALLS_ENDPOINT!,
  apiKey: process.env.DUDWALLS_API_KEY!,
  timeout: parseInt(process.env.DUDWALLS_TIMEOUT || '10000'),
  debug: process.env.DUDWALLS_DEBUG === 'true'
});
```

### Connection String

```typescript
import { parseConnectionString, createClient } from 'dudwalls';

// Parse connection string
const config = parseConnectionString('dudwalls://api-key@your-instance.com/database');
const client = createClient(config);

// Create connection string
const connectionString = createConnectionString(
  'https://your-instance.com',
  'api-key',
  'database'
);
```

## 🚨 Error Handling

```typescript
import { DudwallsError } from 'dudwalls';

try {
  const user = await users.findOne('non-existent-id');
} catch (error) {
  if (error instanceof DudwallsError) {
    console.error('Dudwalls Error:', {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    });
  } else {
    console.error('Unknown error:', error);
  }
}
```

## 🔄 Real-time Updates (Coming Soon)

```typescript
// Subscribe to real-time updates
const subscription = users.subscribe({
  events: ['create', 'update', 'delete'],
  filter: { active: true }
}, (event) => {
  console.log('Real-time event:', event);
});

// Unsubscribe
subscription.unsubscribe();
```

## 📊 Performance Tips

1. **Use Indexes**: Create indexes on frequently queried fields
2. **Limit Results**: Always use `limit` for large datasets
3. **Select Fields**: Use `select` to fetch only needed fields
4. **Batch Operations**: Use `insertMany` and `bulkWrite` for multiple operations
5. **Connection Pooling**: Reuse client instances across your application

```typescript
// Good: Efficient query
const users = await collection.find({
  where: { active: true },
  select: ['name', 'email'],
  limit: 100,
  orderBy: { createdAt: 'desc' }
});

// Bad: Inefficient query
const allUsers = await collection.find(); // Fetches everything
const activeUsers = allUsers.filter(u => u.active); // Client-side filtering
```

## 🧪 Testing

```typescript
import Dudwalls from 'dudwalls';

// Use a test database
const testClient = new Dudwalls({
  endpoint: 'http://localhost:9002',
  apiKey: 'test-api-key',
  debug: true
});

describe('User operations', () => {
  let users: Collection;
  
  beforeEach(async () => {
    const db = testClient.database('test-db');
    users = db.collection('users');
    
    // Clean up before each test
    await users.deleteMany({});
  });
  
  it('should create a user', async () => {
    const user = await users.insertOne({
      name: 'Test User',
      email: 'test@example.com'
    });
    
    expect(user.id).toBeDefined();
    expect(user.name).toBe('Test User');
  });
});
```

## 🔐 Security Best Practices

1. **API Key Security**: Never expose API keys in client-side code
2. **Environment Variables**: Store credentials in environment variables
3. **HTTPS Only**: Always use HTTPS in production
4. **Rate Limiting**: Implement rate limiting in your application
5. **Input Validation**: Validate all user inputs before database operations

```typescript
// Good: Server-side usage
const client = new Dudwalls({
  endpoint: process.env.DUDWALLS_ENDPOINT,
  apiKey: process.env.DUDWALLS_API_KEY
});

// Bad: Client-side exposure
const client = new Dudwalls({
  endpoint: 'https://api.example.com',
  apiKey: 'exposed-api-key' // Never do this!
});
```

## 📈 Monitoring & Analytics

```typescript
// Enable debug logging
const client = new Dudwalls({
  endpoint: 'https://your-instance.com',
  apiKey: 'your-api-key',
  debug: true // Logs all requests/responses
});

// Custom request logging
client.on('request', (request) => {
  console.log('Request:', request);
});

client.on('response', (response) => {
  console.log('Response:', response);
});
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [https://docs.dudwalls.me](https://docs.dudwalls.me)
- **GitHub Issues**: [https://github.com/dudwalls/dudwalls-sdk/issues](https://github.com/dudwalls/dudwalls-sdk/issues)
- **Discord Community**: [https://discord.gg/dudwalls](https://discord.gg/dudwalls)
- **Email Support**: [support@dudwalls.me](mailto:support@dudwalls.me)

## 🎯 Roadmap

- [ ] Real-time subscriptions with WebSockets
- [ ] Advanced indexing and query optimization
- [ ] GraphQL API support
- [ ] Offline-first capabilities with sync
- [ ] Built-in caching layer
- [ ] Schema validation and migrations
- [ ] Multi-region replication
- [ ] Advanced analytics and monitoring

## ⭐ Show Your Support

If you find Dudwalls useful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs and issues
- 💡 Suggesting new features
- 📖 Contributing to documentation
- 💬 Joining our community discussions

---

**Built with ❤️ by the Dudwalls Team**

*Dudwalls - The modern NoSQL database for developers who value freedom, performance, and simplicity.*
