# Dudwalls SDK API Reference

Complete API documentation for the Dudwalls NoSQL Database SDK.

## Table of Contents

- [Client Configuration](#client-configuration)
- [Database Operations](#database-operations)
- [Collection Operations](#collection-operations)
- [Document Operations](#document-operations)
- [Query Operations](#query-operations)
- [Aggregation](#aggregation)
- [Bulk Operations](#bulk-operations)
- [Utility Methods](#utility-methods)
- [Error Handling](#error-handling)
- [Type Definitions](#type-definitions)

## Client Configuration

### DudwallsClient

The main client class for connecting to Dudwalls.

```typescript
import Dudwalls from 'dudwalls';

const client = new Dudwalls(config: DudwallsConfig);
```

#### DudwallsConfig

```typescript
interface DudwallsConfig {
  endpoint: string;        // Required: Your Dudwalls instance URL
  apiKey: string;          // Required: Your API key
  timeout?: number;        // Optional: Request timeout (default: 10000ms)
  debug?: boolean;         // Optional: Enable debug logging (default: false)
  headers?: Record<string, string>; // Optional: Custom headers
}
```

#### Methods

##### `ping(): Promise<DudwallsResponse>`

Test connection to the Dudwalls server.

```typescript
const health = await client.ping();
console.log(health.data); // { status: 'healthy', timestamp: '...' }
```

##### `getDatabases(): Promise<string[]>`

Get list of all databases for the authenticated user.

```typescript
const databases = await client.getDatabases();
console.log(databases); // ['app1', 'app2', 'test']
```

##### `createDatabase(name: string): Promise<DatabaseInfo>`

Create a new database.

```typescript
const db = await client.createDatabase('my-app');
console.log(db); // { name: 'my-app' }
```

##### `deleteDatabase(name: string): Promise<{ success: boolean }>`

Delete a database and all its collections.

```typescript
await client.deleteDatabase('old-app');
```

##### `renameDatabase(oldName: string, newName: string): Promise<DatabaseInfo>`

Rename an existing database.

```typescript
const renamed = await client.renameDatabase('old-name', 'new-name');
```

##### `database(name: string): Database`

Get a database instance for operations.

```typescript
const db = client.database('my-app');
// or
const db = client.db('my-app');
```

## Database Operations

### Database

Represents a database instance with collections.

#### Methods

##### `getName(): string`

Get the database name.

```typescript
const name = db.getName(); // 'my-app'
```

##### `getCollections(): Promise<string[]>`

Get all collections in the database.

```typescript
const collections = await db.getCollections();
console.log(collections); // ['users', 'posts', 'comments']
```

##### `createCollection(name: string): Promise<CollectionInfo>`

Create a new collection.

```typescript
const collection = await db.createCollection('users');
```

##### `deleteCollection(name: string): Promise<{ success: boolean }>`

Delete a collection and all its documents.

```typescript
await db.deleteCollection('old-collection');
```

##### `renameCollection(oldName: string, newName: string): Promise<CollectionInfo>`

Rename a collection.

```typescript
const renamed = await db.renameCollection('old-name', 'new-name');
```

##### `collection(name: string): Collection`

Get a collection instance.

```typescript
const users = db.collection('users');
```

##### `hasCollection(name: string): Promise<boolean>`

Check if a collection exists.

```typescript
const exists = await db.hasCollection('users'); // true/false
```

##### `getCollectionCount(): Promise<number>`

Get the number of collections in the database.

```typescript
const count = await db.getCollectionCount(); // 5
```

##### `drop(): Promise<{ success: boolean }>`

Delete the entire database.

```typescript
await db.drop();
```

##### `getStats(): Promise<DatabaseStats>`

Get database statistics.

```typescript
const stats = await db.getStats();
console.log(stats);
// {
//   name: 'my-app',
//   collections: 3,
//   totalDocuments: 150,
//   estimatedSize: 1024000
// }
```

##### `exportData(): Promise<Record<string, any[]>>`

Export all data from the database.

```typescript
const data = await db.exportData();
console.log(data);
// {
//   users: [{ id: '1', name: 'John' }, ...],
//   posts: [{ id: '1', title: 'Hello' }, ...]
// }
```

##### `importData(data: Record<string, any[]>, options?: ImportOptions): Promise<ImportResult>`

Import data into the database.

```typescript
const result = await db.importData(exportedData, {
  overwrite: true,
  createCollections: true
});
console.log(result);
// {
//   success: true,
//   imported: 150,
//   errors: []
// }
```

## Collection Operations

### Collection

Represents a collection instance for document operations.

#### Methods

##### `getName(): string`

Get the collection name.

```typescript
const name = collection.getName(); // 'users'
```

##### `getDatabaseName(): string`

Get the parent database name.

```typescript
const dbName = collection.getDatabaseName(); // 'my-app'
```

##### `getFullName(): string`

Get the full collection path.

```typescript
const fullName = collection.getFullName(); // 'my-app.users'
```

## Document Operations

### Insert Operations

##### `insertOne(document: DudwallsDocument): Promise<DudwallsDocument>`

Insert a single document.

```typescript
const user = await users.insertOne({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});
console.log(user.id); // Auto-generated ID
```

##### `insertMany(documents: DudwallsDocument[]): Promise<DudwallsDocument[]>`

Insert multiple documents.

```typescript
const newUsers = await users.insertMany([
  { name: 'Jane', email: 'jane@example.com' },
  { name: 'Bob', email: 'bob@example.com' }
]);
```

### Find Operations

##### `find(query?: DudwallsQuery): Promise<DudwallsDocument[]>`

Find documents with optional query.

```typescript
// Find all
const allUsers = await users.find();

// Find with query
const activeUsers = await users.find({
  where: { active: true },
  orderBy: { createdAt: 'desc' },
  limit: 10,
  skip: 0,
  select: ['name', 'email']
});
```

##### `findOne(id: string): Promise<DudwallsDocument | null>`

Find a single document by ID.

```typescript
const user = await users.findOne('user-123');
if (user) {
  console.log(user.name);
}
```

##### `findFirst(query?: DudwallsQuery): Promise<DudwallsDocument | null>`

Find the first document matching the query.

```typescript
const firstActive = await users.findFirst({
  where: { active: true }
});
```

### Update Operations

##### `updateOne(id: string, update: Partial<DudwallsDocument>): Promise<DudwallsDocument>`

Update a single document by ID.

```typescript
const updated = await users.updateOne('user-123', {
  age: 31,
  lastLogin: new Date().toISOString()
});
```

##### `updateMany(query: DudwallsQuery, update: Partial<DudwallsDocument>): Promise<UpdateResult>`

Update multiple documents matching the query.

```typescript
const result = await users.updateMany(
  { where: { active: false } },
  { active: true, reactivatedAt: new Date().toISOString() }
);
console.log(result.modifiedCount); // Number of updated documents
```

##### `replaceOne(id: string, document: DudwallsDocument): Promise<DudwallsDocument>`

Replace an entire document.

```typescript
const replaced = await users.replaceOne('user-123', {
  name: 'John Smith',
  email: 'johnsmith@example.com',
  age: 31
});
```

##### `upsert(document: DudwallsDocument): Promise<DudwallsDocument>`

Update if exists, insert if not.

```typescript
const upserted = await users.upsert({
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com'
});
```

### Delete Operations

##### `deleteOne(id: string): Promise<{ success: boolean }>`

Delete a single document by ID.

```typescript
await users.deleteOne('user-123');
```

##### `deleteMany(query?: DudwallsQuery): Promise<{ deletedCount: number }>`

Delete multiple documents matching the query.

```typescript
const result = await users.deleteMany({
  where: { active: false }
});
console.log(result.deletedCount); // Number of deleted documents
```

## Query Operations

### DudwallsQuery Interface

```typescript
interface DudwallsQuery {
  where?: Record<string, any>;           // Filter conditions
  select?: string[] | Record<string, boolean>; // Field selection
  orderBy?: Record<string, 'asc' | 'desc'>;   // Sort order
  limit?: number;                        // Limit results
  skip?: number;                         // Skip results
}
```

### Query Operators

#### Comparison Operators

```typescript
await users.find({
  where: {
    age: { $eq: 30 },        // Equal to 30
    age: { $ne: 30 },        // Not equal to 30
    age: { $gt: 18 },        // Greater than 18
    age: { $gte: 18 },       // Greater than or equal to 18
    age: { $lt: 65 },        // Less than 65
    age: { $lte: 65 },       // Less than or equal to 65
    status: { $in: ['active', 'pending'] },     // In array
    status: { $nin: ['banned', 'deleted'] },    // Not in array
    name: { $regex: '^John' }                   // Regular expression
  }
});
```

#### Logical Operators

```typescript
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

### Field Selection

```typescript
// Include specific fields
await users.find({
  select: ['name', 'email', 'age']
});

// Include/exclude with boolean values
await users.find({
  select: {
    name: true,
    email: true,
    password: false  // Exclude password
  }
});
```

### Sorting

```typescript
await users.find({
  orderBy: {
    createdAt: 'desc',
    name: 'asc'
  }
});
```

### Pagination

```typescript
// Get page 2 with 10 items per page
await users.find({
  limit: 10,
  skip: 10
});
```

## Aggregation

##### `aggregate(pipeline: AggregationPipeline[]): Promise<any[]>`

Perform aggregation operations.

```typescript
// Basic statistics
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

### Aggregation Operators

- `$match`: Filter documents
- `$group`: Group documents by field
- `$sort`: Sort results
- `$limit`: Limit number of results
- `$skip`: Skip number of results
- `$sum`: Sum values
- `$avg`: Average values
- `$min`: Minimum value
- `$max`: Maximum value

## Bulk Operations

##### `bulkWrite(operations: BulkOperation[]): Promise<BulkResult>`

Perform multiple operations in a single request.

```typescript
const operations = [
  { operation: 'create', data: { name: 'New User', email: 'new@example.com' } },
  { operation: 'update', id: 'user-123', data: { age: 31 } },
  { operation: 'delete', id: 'user-456' }
];

const result = await users.bulkWrite(operations);
console.log(result);
// {
//   success: 2,
//   failed: 1,
//   results: [...]
// }
```

## Utility Methods

##### `count(query?: DudwallsQuery): Promise<number>`

Count documents in the collection.

```typescript
const total = await users.count();
const activeCount = await users.count({ where: { active: true } });
```

##### `exists(id: string): Promise<boolean>`

Check if a document exists.

```typescript
const exists = await users.exists('user-123');
```

##### `distinct(field: string, query?: DudwallsQuery): Promise<any[]>`

Get distinct values for a field.

```typescript
const roles = await users.distinct('role');
const activeRoles = await users.distinct('role', { where: { active: true } });
```

##### `drop(): Promise<{ success: boolean }>`

Delete the entire collection.

```typescript
await users.drop();
```

## Error Handling

### DudwallsError

All SDK errors are instances of `DudwallsError`.

```typescript
interface DudwallsError {
  message: string;    // Error message
  code: string;       // Error code
  status: number;     // HTTP status code
  details?: any;      // Additional error details
}
```

### Error Handling Example

```typescript
import { DudwallsError } from 'dudwalls';

try {
  const user = await users.findOne('non-existent-id');
} catch (error) {
  if (error instanceof DudwallsError) {
    console.error('Dudwalls Error:', {
      message: error.message,
      code: error.code,
      status: error.status
    });
    
    // Handle specific error types
    switch (error.code) {
      case 'NETWORK_ERROR':
        console.log('Check your internet connection');
        break;
      case 'HTTP_ERROR':
        if (error.status === 401) {
          console.log('Invalid API key');
        }
        break;
    }
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Type Definitions

### Core Types

```typescript
interface DudwallsDocument {
  id?: string;
  [key: string]: any;
}

interface DatabaseInfo {
  name: string;
  createdAt?: string;
  updatedAt?: string;
  collections?: number;
  size?: number;
}

interface CollectionInfo {
  name: string;
  createdAt?: string;
  updatedAt?: string;
  documents?: number;
  size?: number;
}

interface UpdateResult {
  modifiedCount: number;
  documents: DudwallsDocument[];
}

interface BulkOperation {
  operation: 'create' | 'update' | 'delete';
  id?: string;
  data?: DudwallsDocument;
}

interface BulkResult {
  success: number;
  failed: number;
  results: Array<{
    operation: BulkOperation;
    success: boolean;
    error?: string;
    data?: DudwallsDocument;
  }>;
}
```

### Response Types

```typescript
interface DudwallsResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  timestamp: string;
}
```

This completes the comprehensive API documentation for the Dudwalls SDK. Each method includes examples and detailed explanations of parameters and return values.
