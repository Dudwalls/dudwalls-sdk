# Dudwalls SDK Installation Guide

Complete guide to install and set up the Dudwalls SDK in your projects.

## 📦 Installation

### Node.js / JavaScript / TypeScript

```bash
# Using npm
npm install dudwalls

# Using yarn
yarn add dudwalls

# Using pnpm
pnpm add dudwalls
```

### Browser (CDN)

```html
<!-- Latest version -->
<script src="https://unpkg.com/dudwalls@latest/lib/index.js"></script>

<!-- Specific version -->
<script src="https://unpkg.com/dudwalls@1.0.0/lib/index.js"></script>
```

## 🚀 Quick Setup

### 1. Get Your API Credentials

1. Visit your Dudwalls dashboard at `https://your-dudwalls-instance.com`
2. Navigate to **Settings** → **API Keys**
3. Copy your API key (starts with `dudw_live_sk_` or `dw_admin_`)

### 2. Basic Usage

#### ES6 Modules / TypeScript

```typescript
import Dudwalls from 'dudwalls';

const client = new Dudwalls({
  endpoint: 'https://your-dudwalls-instance.com',
  apiKey: 'your-api-key-here'
});

// Test connection
const health = await client.ping();
console.log('Connected:', health.data);
```

#### CommonJS / Node.js

```javascript
const Dudwalls = require('dudwalls');

const client = new Dudwalls({
  endpoint: 'https://your-dudwalls-instance.com',
  apiKey: 'your-api-key-here'
});

// Test connection
client.ping().then(health => {
  console.log('Connected:', health.data);
});
```

#### Browser

```html
<script src="https://unpkg.com/dudwalls@latest/lib/index.js"></script>
<script>
  const client = new Dudwalls({
    endpoint: 'https://your-dudwalls-instance.com',
    apiKey: 'your-api-key-here'
  });
  
  client.ping().then(health => {
    console.log('Connected:', health.data);
  });
</script>
```

## 🔧 Environment Configuration

### Environment Variables

Create a `.env` file in your project root:

```bash
# .env
DUDWALLS_ENDPOINT=https://your-dudwalls-instance.com
DUDWALLS_API_KEY=your-api-key-here
DUDWALLS_TIMEOUT=10000
DUDWALLS_DEBUG=false
```

Then use in your code:

```typescript
import Dudwalls from 'dudwalls';

const client = new Dudwalls({
  endpoint: process.env.DUDWALLS_ENDPOINT!,
  apiKey: process.env.DUDWALLS_API_KEY!,
  timeout: parseInt(process.env.DUDWALLS_TIMEOUT || '10000'),
  debug: process.env.DUDWALLS_DEBUG === 'true'
});
```

### Configuration Options

```typescript
interface DudwallsConfig {
  endpoint: string;        // Required: Your Dudwalls instance URL
  apiKey: string;          // Required: Your API key
  timeout?: number;        // Optional: Request timeout (default: 10000ms)
  debug?: boolean;         // Optional: Enable debug logging (default: false)
  headers?: Record<string, string>; // Optional: Custom headers
}
```

## 🌐 Framework Integration

### React

```bash
npm install dudwalls
```

```typescript
// hooks/useDudwalls.ts
import { useState, useEffect } from 'react';
import Dudwalls from 'dudwalls';

const client = new Dudwalls({
  endpoint: process.env.REACT_APP_DUDWALLS_ENDPOINT!,
  apiKey: process.env.REACT_APP_DUDWALLS_API_KEY!
});

export function useDudwalls(database: string, collection: string) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const db = client.database(database);
  const coll = db.collection(collection);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const documents = await coll.find();
      setData(documents);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [database, collection]);
  
  return { data, loading, refetch: fetchData, collection: coll };
}
```

### Next.js

```typescript
// lib/dudwalls.ts
import Dudwalls from 'dudwalls';

export const client = new Dudwalls({
  endpoint: process.env.DUDWALLS_ENDPOINT!,
  apiKey: process.env.DUDWALLS_API_KEY!
});

// pages/api/users.ts
import { client } from '../../lib/dudwalls';

export default async function handler(req, res) {
  const users = client.database('app').collection('users');
  
  if (req.method === 'GET') {
    const data = await users.find();
    res.json(data);
  } else if (req.method === 'POST') {
    const newUser = await users.insertOne(req.body);
    res.json(newUser);
  }
}
```

### Vue.js

```typescript
// plugins/dudwalls.ts
import Dudwalls from 'dudwalls';

export const client = new Dudwalls({
  endpoint: process.env.VUE_APP_DUDWALLS_ENDPOINT!,
  apiKey: process.env.VUE_APP_DUDWALLS_API_KEY!
});

// composables/useDudwalls.ts
import { ref, onMounted } from 'vue';
import { client } from '../plugins/dudwalls';

export function useDudwalls(database: string, collection: string) {
  const data = ref([]);
  const loading = ref(false);
  
  const coll = client.database(database).collection(collection);
  
  const fetchData = async () => {
    loading.value = true;
    try {
      data.value = await coll.find();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      loading.value = false;
    }
  };
  
  onMounted(fetchData);
  
  return { data, loading, refetch: fetchData, collection: coll };
}
```

### Angular

```typescript
// services/dudwalls.service.ts
import { Injectable } from '@angular/core';
import Dudwalls from 'dudwalls';

@Injectable({
  providedIn: 'root'
})
export class DudwallsService {
  private client = new Dudwalls({
    endpoint: environment.dudwallsEndpoint,
    apiKey: environment.dudwallsApiKey
  });
  
  getDatabase(name: string) {
    return this.client.database(name);
  }
  
  async getUsers() {
    const users = this.client.database('app').collection('users');
    return await users.find();
  }
}
```

### Express.js

```typescript
// server.ts
import express from 'express';
import Dudwalls from 'dudwalls';

const app = express();
const client = new Dudwalls({
  endpoint: process.env.DUDWALLS_ENDPOINT!,
  apiKey: process.env.DUDWALLS_API_KEY!
});

app.use(express.json());

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = client.database('app').collection('users');
    const data = await users.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const users = client.database('app').collection('users');
    const newUser = await users.insertOne(req.body);
    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## 🔐 Security Best Practices

### 1. Environment Variables

Never hardcode API keys in your source code:

```typescript
// ❌ Bad - API key exposed
const client = new Dudwalls({
  endpoint: 'https://api.example.com',
  apiKey: 'dudw_live_sk_exposed_key'
});

// ✅ Good - Use environment variables
const client = new Dudwalls({
  endpoint: process.env.DUDWALLS_ENDPOINT!,
  apiKey: process.env.DUDWALLS_API_KEY!
});
```

### 2. Server-Side Only

Use Dudwalls SDK only on the server side for production applications:

```typescript
// ✅ Good - Server-side API route
// pages/api/data.ts
import { client } from '../../lib/dudwalls';

export default async function handler(req, res) {
  const data = await client.database('app').collection('users').find();
  res.json(data);
}

// ❌ Bad - Client-side usage exposes API key
// components/UserList.tsx
const client = new Dudwalls({ /* API key exposed */ });
```

### 3. Input Validation

Always validate user inputs:

```typescript
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(0).max(150)
});

app.post('/api/users', async (req, res) => {
  try {
    const validatedData = userSchema.parse(req.body);
    const users = client.database('app').collection('users');
    const newUser = await users.insertOne(validatedData);
    res.json(newUser);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});
```

## 🧪 Testing

### Unit Testing with Jest

```typescript
// __tests__/dudwalls.test.ts
import Dudwalls from 'dudwalls';

describe('Dudwalls SDK', () => {
  let client: Dudwalls;
  
  beforeAll(() => {
    client = new Dudwalls({
      endpoint: 'http://localhost:9002',
      apiKey: 'test-api-key'
    });
  });
  
  beforeEach(async () => {
    // Clean up test data
    const testDb = client.database('test-db');
    const users = testDb.collection('users');
    await users.deleteMany({});
  });
  
  it('should create and retrieve a user', async () => {
    const users = client.database('test-db').collection('users');
    
    const newUser = await users.insertOne({
      name: 'Test User',
      email: 'test@example.com'
    });
    
    expect(newUser.id).toBeDefined();
    expect(newUser.name).toBe('Test User');
    
    const retrieved = await users.findOne(newUser.id);
    expect(retrieved).toEqual(newUser);
  });
});
```

### Integration Testing

```typescript
// __tests__/integration.test.ts
import Dudwalls from 'dudwalls';

describe('Integration Tests', () => {
  let client: Dudwalls;
  
  beforeAll(async () => {
    client = new Dudwalls({
      endpoint: process.env.TEST_DUDWALLS_ENDPOINT!,
      apiKey: process.env.TEST_DUDWALLS_API_KEY!
    });
    
    // Test connection
    await client.ping();
  });
  
  it('should perform CRUD operations', async () => {
    const db = client.database('integration-test');
    const users = db.collection('users');
    
    // Create
    const user = await users.insertOne({
      name: 'Integration Test User',
      email: 'integration@test.com'
    });
    
    // Read
    const found = await users.findOne(user.id);
    expect(found.name).toBe('Integration Test User');
    
    // Update
    const updated = await users.updateOne(user.id, { age: 25 });
    expect(updated.age).toBe(25);
    
    // Delete
    await users.deleteOne(user.id);
    const deleted = await users.findOne(user.id);
    expect(deleted).toBeNull();
  });
});
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Connection Errors

```typescript
// Check if your endpoint is correct
try {
  const health = await client.ping();
  console.log('Connection successful:', health);
} catch (error) {
  console.error('Connection failed:', error.message);
  // Check:
  // - Is the endpoint URL correct?
  // - Is the server running?
  // - Are you behind a firewall?
}
```

#### 2. Authentication Errors

```typescript
try {
  const databases = await client.getDatabases();
} catch (error) {
  if (error.status === 401) {
    console.error('Invalid API key');
    // Check:
    // - Is your API key correct?
    // - Has the API key expired?
    // - Do you have the right permissions?
  }
}
```

#### 3. Timeout Errors

```typescript
// Increase timeout for slow connections
const client = new Dudwalls({
  endpoint: 'https://your-instance.com',
  apiKey: 'your-api-key',
  timeout: 30000 // 30 seconds
});
```

#### 4. Debug Mode

```typescript
// Enable debug logging to see all requests/responses
const client = new Dudwalls({
  endpoint: 'https://your-instance.com',
  apiKey: 'your-api-key',
  debug: true
});
```

### Error Handling

```typescript
import { DudwallsError } from 'dudwalls';

try {
  const user = await users.findOne('non-existent-id');
} catch (error) {
  if (error instanceof DudwallsError) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        console.log('Network issue - check your connection');
        break;
      case 'HTTP_ERROR':
        if (error.status === 404) {
          console.log('Document not found');
        } else if (error.status === 401) {
          console.log('Authentication failed');
        }
        break;
      default:
        console.log('Unknown error:', error.message);
    }
  }
}
```

## 📈 Performance Tips

### 1. Connection Reuse

```typescript
// ✅ Good - Reuse client instance
const client = new Dudwalls({ /* config */ });

// Use the same client throughout your app
export { client };

// ❌ Bad - Creating new clients
function getUsers() {
  const client = new Dudwalls({ /* config */ }); // Don't do this
  return client.database('app').collection('users').find();
}
```

### 2. Efficient Queries

```typescript
// ✅ Good - Specific query with limits
const users = await collection.find({
  where: { active: true },
  select: ['name', 'email'], // Only fetch needed fields
  limit: 100,                // Limit results
  orderBy: { createdAt: 'desc' }
});

// ❌ Bad - Fetching everything
const allUsers = await collection.find(); // Potentially huge dataset
const activeUsers = allUsers.filter(u => u.active); // Client-side filtering
```

### 3. Batch Operations

```typescript
// ✅ Good - Batch insert
const users = [
  { name: 'User 1', email: 'user1@example.com' },
  { name: 'User 2', email: 'user2@example.com' },
  // ... more users
];
await collection.insertMany(users);

// ❌ Bad - Individual inserts
for (const user of users) {
  await collection.insertOne(user); // Multiple round trips
}
```

## 🔄 Migration Guide

### From MongoDB

```typescript
// MongoDB
const { MongoClient } = require('mongodb');
const client = new MongoClient(uri);
const db = client.db('myapp');
const users = db.collection('users');

// Find documents
const docs = await users.find({ active: true }).toArray();

// Insert document
const result = await users.insertOne({ name: 'John' });

// Dudwalls equivalent
import Dudwalls from 'dudwalls';
const client = new Dudwalls({ endpoint, apiKey });
const db = client.database('myapp');
const users = db.collection('users');

// Find documents
const docs = await users.find({ where: { active: true } });

// Insert document
const result = await users.insertOne({ name: 'John' });
```

### From Firebase

```typescript
// Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get documents
const querySnapshot = await getDocs(collection(db, 'users'));
const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Add document
const docRef = await addDoc(collection(db, 'users'), { name: 'John' });

// Dudwalls equivalent
import Dudwalls from 'dudwalls';
const client = new Dudwalls({ endpoint, apiKey });
const users = client.database('app').collection('users');

// Get documents
const docs = await users.find();

// Add document
const result = await users.insertOne({ name: 'John' });
```

This completes the comprehensive installation and setup guide for the Dudwalls SDK!
