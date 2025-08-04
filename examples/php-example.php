<?php
/**
 * Dudwalls SDK - PHP Example
 * Complete example showing all major features using cURL
 */

class DudwallsClient {
    private $endpoint;
    private $apiKey;
    private $timeout;
    private $baseUrl;
    
    public function __construct($endpoint, $apiKey, $timeout = 10) {
        $this->endpoint = rtrim($endpoint, '/');
        $this->apiKey = $apiKey;
        $this->timeout = $timeout;
        $this->baseUrl = $this->endpoint . '/api/dudwalls';
    }
    
    private function request($method, $path, $data = null) {
        $url = $this->baseUrl . $path;
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->apiKey,
                'Content-Type: application/json',
                'User-Agent: Dudwalls-PHP-SDK/1.0.0'
            ]
        ]);
        
        if ($data !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            throw new Exception("cURL error: " . $error);
        }
        
        if ($httpCode >= 400) {
            $errorData = json_decode($response, true);
            $errorMessage = isset($errorData['error']) ? $errorData['error'] : 'HTTP ' . $httpCode;
            throw new Exception("Dudwalls API error: " . $errorMessage);
        }
        
        return json_decode($response, true);
    }
    
    public function ping() {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $this->endpoint . '/api/health',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->timeout
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("Health check failed");
        }
        
        return json_decode($response, true);
    }
    
    public function getDatabases() {
        return $this->request('GET', '/');
    }
    
    public function createDatabase($name) {
        return $this->request('POST', '/', ['name' => $name]);
    }
    
    public function deleteDatabase($name) {
        return $this->request('DELETE', '/' . $name);
    }
    
    public function getCollections($database) {
        return $this->request('GET', '/' . $database);
    }
    
    public function createCollection($database, $collection) {
        return $this->request('POST', '/' . $database, ['name' => $collection]);
    }
    
    public function deleteCollection($database, $collection) {
        return $this->request('DELETE', '/' . $database . '/' . $collection);
    }
    
    public function find($database, $collection) {
        return $this->request('GET', '/' . $database . '/' . $collection);
    }
    
    public function findOne($database, $collection, $docId) {
        try {
            return $this->request('GET', '/' . $database . '/' . $collection . '/' . $docId);
        } catch (Exception $e) {
            return null;
        }
    }
    
    public function insertOne($database, $collection, $document) {
        return $this->request('POST', '/' . $database . '/' . $collection, $document);
    }
    
    public function insertMany($database, $collection, $documents) {
        $results = [];
        foreach ($documents as $doc) {
            try {
                $results[] = $this->insertOne($database, $collection, $doc);
            } catch (Exception $e) {
                echo "Failed to insert document: " . $e->getMessage() . "\n";
            }
        }
        return $results;
    }
    
    public function updateOne($database, $collection, $docId, $update) {
        return $this->request('PUT', '/' . $database . '/' . $collection . '/' . $docId, $update);
    }
    
    public function deleteOne($database, $collection, $docId) {
        return $this->request('DELETE', '/' . $database . '/' . $collection . '/' . $docId);
    }
    
    public function count($database, $collection) {
        $documents = $this->find($database, $collection);
        return count($documents);
    }
}

function main() {
    // Initialize client
    $client = new DudwallsClient(
        'https://your-dudwalls-instance.com',
        'your-api-key-here'
    );
    
    try {
        // Test connection
        echo "🔗 Testing connection...\n";
        $health = $client->ping();
        echo "✅ Connected successfully: " . json_encode($health) . "\n";
        
        // Create database
        echo "\n📁 Creating database...\n";
        $client->createDatabase('php-app');
        
        // Create collection
        echo "📄 Creating collection...\n";
        $client->createCollection('php-app', 'users');
        
        // Insert documents
        echo "\n➕ Inserting documents...\n";
        $user1 = $client->insertOne('php-app', 'users', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'age' => 30,
            'active' => true
        ]);
        echo "Inserted user: " . json_encode($user1) . "\n";
        
        $user2 = $client->insertOne('php-app', 'users', [
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'age' => 25,
            'active' => true
        ]);
        echo "Inserted user: " . json_encode($user2) . "\n";
        
        // Insert multiple documents
        $moreUsers = $client->insertMany('php-app', 'users', [
            ['name' => 'Bob Wilson', 'email' => 'bob@example.com', 'age' => 35, 'active' => false],
            ['name' => 'Alice Brown', 'email' => 'alice@example.com', 'age' => 28, 'active' => true]
        ]);
        echo "Inserted multiple users: " . count($moreUsers) . "\n";
        
        // Find all documents
        echo "\n🔍 Finding all users...\n";
        $allUsers = $client->find('php-app', 'users');
        echo "All users: " . count($allUsers) . " found\n";
        foreach ($allUsers as $user) {
            $status = $user['active'] ? 'Active' : 'Inactive';
            echo "  - {$user['name']} ({$user['age']}) - {$status}\n";
        }
        
        // Find one document
        echo "\n🔍 Finding one user...\n";
        $oneUser = $client->findOne('php-app', 'users', $user1['id']);
        echo "Found user: " . json_encode($oneUser) . "\n";
        
        // Update document
        echo "\n✏️ Updating user...\n";
        $updatedUser = $client->updateOne('php-app', 'users', $user1['id'], [
            'age' => 31,
            'last_login' => date('Y-m-d H:i:s')
        ]);
        echo "Updated user: " . json_encode($updatedUser) . "\n";
        
        // Count documents
        echo "\n🔢 Counting documents...\n";
        $totalUsers = $client->count('php-app', 'users');
        echo "Total users: {$totalUsers}\n";
        
        // Filter active users (client-side filtering)
        echo "\n🔍 Finding active users...\n";
        $allUsers = $client->find('php-app', 'users');
        $activeUsers = array_filter($allUsers, function($user) {
            return isset($user['active']) && $user['active'];
        });
        echo "Active users: " . count($activeUsers) . "\n";
        foreach ($activeUsers as $user) {
            echo "  - {$user['name']} ({$user['age']})\n";
        }
        
        // List databases and collections
        echo "\n📋 Listing databases...\n";
        $databases = $client->getDatabases();
        echo "Databases: " . json_encode($databases) . "\n";
        
        $collections = $client->getCollections('php-app');
        echo "Collections in php-app: " . json_encode($collections) . "\n";
        
        // Clean up (optional)
        echo "\n🧹 Cleaning up...\n";
        // $client->deleteCollection('php-app', 'users');
        // $client->deleteDatabase('php-app');
        
        echo "\n✅ PHP example completed successfully!\n";
        
    } catch (Exception $error) {
        echo "❌ Error: " . $error->getMessage() . "\n";
    }
}

// Run the example
main();
?>
