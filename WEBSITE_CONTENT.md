# Content to Add to Your Dudwalls Website

## 1. Add to your main navigation menu:
- **"SDKs & Libraries"** or **"Developer Tools"**

## 2. Create a new page: `/docs/sdks` with this content:

---

# SDKs & Client Libraries

Integrate Dudwalls into your applications using our official SDKs and client libraries.

## JavaScript/TypeScript (Node.js)

```bash
npm install dudwalls
```

```javascript
import Dudwalls from 'dudwalls';

const client = new Dudwalls({
  endpoint: 'https://dudwalls.me',
  apiKey: 'your-api-key-here'
});

// Create database and collection
const users = client.database('myapp').collection('users');

// Insert document
const user = await users.insertOne({
  name: 'John Doe',
  email: 'john@example.com'
});

// Find documents
const allUsers = await users.find();
```

## Python

```python
import requests

class DudwallsClient:
    def __init__(self, endpoint, api_key):
        self.endpoint = endpoint
        self.api_key = api_key
        self.headers = {'Authorization': f'Bearer {api_key}'}
    
    def insert_one(self, database, collection, document):
        response = requests.post(
            f'{self.endpoint}/api/dudwalls/{database}/{collection}',
            json=document,
            headers=self.headers
        )
        return response.json()

# Usage
client = DudwallsClient('https://dudwalls.me', 'your-api-key')
user = client.insert_one('myapp', 'users', {'name': 'John Doe'})
```

## PHP

```php
<?php
class DudwallsClient {
    private $endpoint;
    private $apiKey;
    
    public function __construct($endpoint, $apiKey) {
        $this->endpoint = $endpoint;
        $this->apiKey = $apiKey;
    }
    
    public function insertOne($database, $collection, $document) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => "{$this->endpoint}/api/dudwalls/{$database}/{$collection}",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($document),
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

// Usage
$client = new DudwallsClient('https://dudwalls.me', 'your-api-key');
$user = $client->insertOne('myapp', 'users', ['name' => 'John Doe']);
?>
```

## Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

type DudwallsClient struct {
    Endpoint string
    APIKey   string
}

func (c *DudwallsClient) InsertOne(database, collection string, document map[string]interface{}) (map[string]interface{}, error) {
    jsonData, _ := json.Marshal(document)
    
    req, _ := http.NewRequest("POST", 
        c.Endpoint+"/api/dudwalls/"+database+"/"+collection, 
        bytes.NewBuffer(jsonData))
    req.Header.Set("Authorization", "Bearer "+c.APIKey)
    req.Header.Set("Content-Type", "application/json")
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
    return result, nil
}

// Usage
func main() {
    client := &DudwallsClient{
        Endpoint: "https://dudwalls.me",
        APIKey:   "your-api-key",
    }
    
    user, _ := client.InsertOne("myapp", "users", map[string]interface{}{
        "name": "John Doe",
    })
}
```

## More Languages

We provide examples and documentation for:
- **Java** - HTTP client with JSON
- **C#** - HttpClient integration  
- **Ruby** - Net::HTTP usage
- **Rust** - reqwest crate
- **Swift** - URLSession

## Framework Integration

### React
```jsx
import { useState, useEffect } from 'react';
import Dudwalls from 'dudwalls';

const client = new Dudwalls({
  endpoint: 'https://dudwalls.me',
  apiKey: process.env.REACT_APP_DUDWALLS_API_KEY
});

function UserList() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    const loadUsers = async () => {
      const userData = await client.database('myapp').collection('users').find();
      setUsers(userData);
    };
    loadUsers();
  }, []);
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Next.js API Routes
```javascript
// pages/api/users.js
import Dudwalls from 'dudwalls';

const client = new Dudwalls({
  endpoint: 'https://dudwalls.me',
  apiKey: process.env.DUDWALLS_API_KEY
});

export default async function handler(req, res) {
  const users = client.database('myapp').collection('users');
  
  if (req.method === 'GET') {
    const data = await users.find();
    res.json(data);
  } else if (req.method === 'POST') {
    const newUser = await users.insertOne(req.body);
    res.json(newUser);
  }
}
```

### Express.js
```javascript
const express = require('express');
const Dudwalls = require('dudwalls');

const app = express();
const client = new Dudwalls({
  endpoint: 'https://dudwalls.me',
  apiKey: process.env.DUDWALLS_API_KEY
});

app.get('/api/users', async (req, res) => {
  const users = await client.database('myapp').collection('users').find();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const user = await client.database('myapp').collection('users').insertOne(req.body);
  res.json(user);
});
```

## Installation & Setup

1. **Get your API key** from your [Dudwalls Dashboard](https://dudwalls.me/dashboard)
2. **Install the SDK** for your preferred language
3. **Initialize the client** with your endpoint and API key
4. **Start building** with our MongoDB-like API

## Resources

- [📚 Complete API Documentation](https://dudwalls.me/docs/api)
- [🔧 SDK Reference](https://github.com/dudwalls/dudwalls-sdk)
- [💡 Code Examples](https://github.com/dudwalls/dudwalls-examples)
- [❓ Community Support](https://discord.gg/dudwalls)

---

## 3. Add to your dashboard page:

### SDK Integration Section
Add this to your dashboard where users can see their API key:

```html
<div class="sdk-integration">
  <h3>🔧 SDK Integration</h3>
  <p>Use your API key to integrate Dudwalls into your applications:</p>
  
  <div class="code-example">
    <h4>JavaScript/Node.js</h4>
    <pre><code>npm install dudwalls

import Dudwalls from 'dudwalls';

const client = new Dudwalls({
  endpoint: 'https://dudwalls.me',
  apiKey: 'YOUR_API_KEY_HERE'
});

const users = client.database('myapp').collection('users');
await users.insertOne({ name: 'John Doe' });</code></pre>
  </div>
  
  <a href="/docs/sdks" class="btn btn-primary">View All SDKs & Examples</a>
</div>
```

## 4. Add to your homepage:

### Developer-Friendly Section
```html
<section class="developer-tools">
  <h2>🚀 Developer-First NoSQL Database</h2>
  <div class="features">
    <div class="feature">
      <h3>📦 NPM Package</h3>
      <p>Install with <code>npm install dudwalls</code></p>
    </div>
    <div class="feature">
      <h3>🌐 Multi-Language</h3>
      <p>SDKs for JavaScript, Python, PHP, Go, Java, C#, Ruby</p>
    </div>
    <div class="feature">
      <h3>⚡ MongoDB-like API</h3>
      <p>Familiar syntax for easy migration</p>
    </div>
  </div>
</section>
```
