package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// DudwallsClient represents the Dudwalls client
type DudwallsClient struct {
	Endpoint string
	APIKey   string
	BaseURL  string
	Client   *http.Client
}

// Document represents a Dudwalls document
type Document map[string]interface{}

// NewClient creates a new Dudwalls client
func NewClient(endpoint, apiKey string) *DudwallsClient {
	return &DudwallsClient{
		Endpoint: endpoint,
		APIKey:   apiKey,
		BaseURL:  endpoint + "/api/dudwalls",
		Client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// request makes an HTTP request to the Dudwalls API
func (c *DudwallsClient) request(method, path string, data interface{}) (map[string]interface{}, error) {
	url := c.BaseURL + path
	
	var body io.Reader
	if data != nil {
		jsonData, err := json.Marshal(data)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal JSON: %v", err)
		}
		body = bytes.NewBuffer(jsonData)
	}
	
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}
	
	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "Dudwalls-Go-SDK/1.0.0")
	
	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %v", err)
	}
	defer resp.Body.Close()
	
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %v", err)
	}
	
	if resp.StatusCode >= 400 {
		var errorResp map[string]interface{}
		json.Unmarshal(responseBody, &errorResp)
		if errorMsg, ok := errorResp["error"].(string); ok {
			return nil, fmt.Errorf("API error: %s", errorMsg)
		}
		return nil, fmt.Errorf("HTTP %d", resp.StatusCode)
	}
	
	var result map[string]interface{}
	if err := json.Unmarshal(responseBody, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %v", err)
	}
	
	return result, nil
}

// Ping tests the connection to Dudwalls
func (c *DudwallsClient) Ping() (map[string]interface{}, error) {
	resp, err := c.Client.Get(c.Endpoint + "/api/health")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	
	return result, nil
}

// GetDatabases returns all databases
func (c *DudwallsClient) GetDatabases() ([]string, error) {
	result, err := c.request("GET", "/", nil)
	if err != nil {
		return nil, err
	}
	
	var databases []string
	for _, db := range result["data"].([]interface{}) {
		databases = append(databases, db.(string))
	}
	
	return databases, nil
}

// CreateDatabase creates a new database
func (c *DudwallsClient) CreateDatabase(name string) (map[string]interface{}, error) {
	return c.request("POST", "/", map[string]string{"name": name})
}

// DeleteDatabase deletes a database
func (c *DudwallsClient) DeleteDatabase(name string) (map[string]interface{}, error) {
	return c.request("DELETE", "/"+name, nil)
}

// GetCollections returns all collections in a database
func (c *DudwallsClient) GetCollections(database string) ([]string, error) {
	result, err := c.request("GET", "/"+database, nil)
	if err != nil {
		return nil, err
	}
	
	var collections []string
	if data, ok := result["data"].([]interface{}); ok {
		for _, coll := range data {
			collections = append(collections, coll.(string))
		}
	}
	
	return collections, nil
}

// CreateCollection creates a new collection
func (c *DudwallsClient) CreateCollection(database, collection string) (map[string]interface{}, error) {
	return c.request("POST", "/"+database, map[string]string{"name": collection})
}

// Find returns all documents in a collection
func (c *DudwallsClient) Find(database, collection string) ([]Document, error) {
	result, err := c.request("GET", "/"+database+"/"+collection, nil)
	if err != nil {
		return nil, err
	}
	
	var documents []Document
	if data, ok := result["data"].([]interface{}); ok {
		for _, doc := range data {
			if docMap, ok := doc.(map[string]interface{}); ok {
				documents = append(documents, Document(docMap))
			}
		}
	}
	
	return documents, nil
}

// FindOne returns a single document by ID
func (c *DudwallsClient) FindOne(database, collection, docID string) (Document, error) {
	result, err := c.request("GET", "/"+database+"/"+collection+"/"+docID, nil)
	if err != nil {
		return nil, err
	}
	
	if data, ok := result["data"].(map[string]interface{}); ok {
		return Document(data), nil
	}
	
	return nil, fmt.Errorf("invalid response format")
}

// InsertOne inserts a single document
func (c *DudwallsClient) InsertOne(database, collection string, document Document) (Document, error) {
	result, err := c.request("POST", "/"+database+"/"+collection, document)
	if err != nil {
		return nil, err
	}
	
	if data, ok := result["data"].(map[string]interface{}); ok {
		return Document(data), nil
	}
	
	return Document(result), nil
}

// UpdateOne updates a single document
func (c *DudwallsClient) UpdateOne(database, collection, docID string, update Document) (Document, error) {
	result, err := c.request("PUT", "/"+database+"/"+collection+"/"+docID, update)
	if err != nil {
		return nil, err
	}
	
	if data, ok := result["data"].(map[string]interface{}); ok {
		return Document(data), nil
	}
	
	return Document(result), nil
}

// DeleteOne deletes a single document
func (c *DudwallsClient) DeleteOne(database, collection, docID string) (map[string]interface{}, error) {
	return c.request("DELETE", "/"+database+"/"+collection+"/"+docID, nil)
}

func main() {
	// Initialize client
	client := NewClient(
		"https://your-dudwalls-instance.com",
		"your-api-key-here",
	)
	
	fmt.Println("🔗 Testing connection...")
	health, err := client.Ping()
	if err != nil {
		fmt.Printf("❌ Connection failed: %v\n", err)
		return
	}
	fmt.Printf("✅ Connected successfully: %v\n", health)
	
	// Create database
	fmt.Println("\n📁 Creating database...")
	_, err = client.CreateDatabase("go-app")
	if err != nil {
		fmt.Printf("❌ Failed to create database: %v\n", err)
		return
	}
	
	// Create collection
	fmt.Println("📄 Creating collection...")
	_, err = client.CreateCollection("go-app", "users")
	if err != nil {
		fmt.Printf("❌ Failed to create collection: %v\n", err)
		return
	}
	
	// Insert documents
	fmt.Println("\n➕ Inserting documents...")
	user1, err := client.InsertOne("go-app", "users", Document{
		"name":   "John Doe",
		"email":  "john@example.com",
		"age":    30,
		"active": true,
	})
	if err != nil {
		fmt.Printf("❌ Failed to insert user: %v\n", err)
		return
	}
	fmt.Printf("Inserted user: %v\n", user1)
	
	user2, err := client.InsertOne("go-app", "users", Document{
		"name":   "Jane Smith",
		"email":  "jane@example.com",
		"age":    25,
		"active": true,
	})
	if err != nil {
		fmt.Printf("❌ Failed to insert user: %v\n", err)
		return
	}
	fmt.Printf("Inserted user: %v\n", user2)
	
	// Insert more users
	moreUsers := []Document{
		{"name": "Bob Wilson", "email": "bob@example.com", "age": 35, "active": false},
		{"name": "Alice Brown", "email": "alice@example.com", "age": 28, "active": true},
	}
	
	for _, user := range moreUsers {
		_, err := client.InsertOne("go-app", "users", user)
		if err != nil {
			fmt.Printf("❌ Failed to insert user: %v\n", err)
		}
	}
	fmt.Printf("Inserted %d more users\n", len(moreUsers))
	
	// Find all documents
	fmt.Println("\n🔍 Finding all users...")
	allUsers, err := client.Find("go-app", "users")
	if err != nil {
		fmt.Printf("❌ Failed to find users: %v\n", err)
		return
	}
	fmt.Printf("All users: %d found\n", len(allUsers))
	for _, user := range allUsers {
		name := user["name"].(string)
		age := user["age"].(float64)
		active := user["active"].(bool)
		status := "Inactive"
		if active {
			status = "Active"
		}
		fmt.Printf("  - %s (%.0f) - %s\n", name, age, status)
	}
	
	// Find one document
	fmt.Println("\n🔍 Finding one user...")
	userID := user1["id"].(string)
	oneUser, err := client.FindOne("go-app", "users", userID)
	if err != nil {
		fmt.Printf("❌ Failed to find user: %v\n", err)
		return
	}
	fmt.Printf("Found user: %v\n", oneUser)
	
	// Update document
	fmt.Println("\n✏️ Updating user...")
	updatedUser, err := client.UpdateOne("go-app", "users", userID, Document{
		"age":        31,
		"last_login": time.Now().Format("2006-01-02 15:04:05"),
	})
	if err != nil {
		fmt.Printf("❌ Failed to update user: %v\n", err)
		return
	}
	fmt.Printf("Updated user: %v\n", updatedUser)
	
	// Count documents (client-side)
	fmt.Println("\n🔢 Counting documents...")
	allUsers, _ = client.Find("go-app", "users")
	totalUsers := len(allUsers)
	
	activeCount := 0
	for _, user := range allUsers {
		if active, ok := user["active"].(bool); ok && active {
			activeCount++
		}
	}
	fmt.Printf("Total users: %d, Active users: %d\n", totalUsers, activeCount)
	
	// List databases and collections
	fmt.Println("\n📋 Listing databases...")
	databases, err := client.GetDatabases()
	if err != nil {
		fmt.Printf("❌ Failed to get databases: %v\n", err)
	} else {
		fmt.Printf("Databases: %v\n", databases)
	}
	
	collections, err := client.GetCollections("go-app")
	if err != nil {
		fmt.Printf("❌ Failed to get collections: %v\n", err)
	} else {
		fmt.Printf("Collections in go-app: %v\n", collections)
	}
	
	// Clean up (optional)
	fmt.Println("\n🧹 Cleaning up...")
	// client.DeleteDatabase("go-app")
	
	fmt.Println("\n✅ Go example completed successfully!")
}
