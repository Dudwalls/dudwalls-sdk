#!/usr/bin/env python3
"""
Dudwalls SDK - Python Example
Complete example showing all major features using requests library
"""

import requests
import json
import time
from typing import Dict, List, Any, Optional

class DudwallsClient:
    """Python client for Dudwalls NoSQL Database"""
    
    def __init__(self, endpoint: str, api_key: str, timeout: int = 10):
        self.endpoint = endpoint.rstrip('/')
        self.api_key = api_key
        self.timeout = timeout
        self.base_url = f"{self.endpoint}/api/dudwalls"
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'Dudwalls-Python-SDK/1.0.0'
        }
    
    def _request(self, method: str, path: str, data: Optional[Dict] = None) -> Dict:
        """Make HTTP request to Dudwalls API"""
        url = f"{self.base_url}{path}"
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self.headers,
                json=data,
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Dudwalls API error: {e}")
    
    def ping(self) -> Dict:
        """Test connection to Dudwalls server"""
        response = requests.get(f"{self.endpoint}/api/health", timeout=self.timeout)
        response.raise_for_status()
        return response.json()
    
    def get_databases(self) -> List[str]:
        """Get all databases"""
        return self._request('GET', '/')
    
    def create_database(self, name: str) -> Dict:
        """Create a new database"""
        return self._request('POST', '/', {'name': name})
    
    def delete_database(self, name: str) -> Dict:
        """Delete a database"""
        return self._request('DELETE', f'/{name}')
    
    def get_collections(self, database: str) -> List[str]:
        """Get all collections in a database"""
        return self._request('GET', f'/{database}')
    
    def create_collection(self, database: str, collection: str) -> Dict:
        """Create a new collection"""
        return self._request('POST', f'/{database}', {'name': collection})
    
    def delete_collection(self, database: str, collection: str) -> Dict:
        """Delete a collection"""
        return self._request('DELETE', f'/{database}/{collection}')
    
    def find(self, database: str, collection: str) -> List[Dict]:
        """Find all documents in a collection"""
        return self._request('GET', f'/{database}/{collection}')
    
    def find_one(self, database: str, collection: str, doc_id: str) -> Optional[Dict]:
        """Find a single document by ID"""
        try:
            return self._request('GET', f'/{database}/{collection}/{doc_id}')
        except Exception:
            return None
    
    def insert_one(self, database: str, collection: str, document: Dict) -> Dict:
        """Insert a single document"""
        return self._request('POST', f'/{database}/{collection}', document)
    
    def insert_many(self, database: str, collection: str, documents: List[Dict]) -> List[Dict]:
        """Insert multiple documents"""
        results = []
        for doc in documents:
            try:
                result = self.insert_one(database, collection, doc)
                results.append(result)
            except Exception as e:
                print(f"Failed to insert document: {e}")
        return results
    
    def update_one(self, database: str, collection: str, doc_id: str, update: Dict) -> Dict:
        """Update a single document"""
        return self._request('PUT', f'/{database}/{collection}/{doc_id}', update)
    
    def delete_one(self, database: str, collection: str, doc_id: str) -> Dict:
        """Delete a single document"""
        return self._request('DELETE', f'/{database}/{collection}/{doc_id}')
    
    def count(self, database: str, collection: str) -> int:
        """Count documents in a collection"""
        documents = self.find(database, collection)
        return len(documents)

def main():
    """Main example function"""
    # Initialize client
    client = DudwallsClient(
        endpoint='https://your-dudwalls-instance.com',
        api_key='your-api-key-here'
    )
    
    try:
        # Test connection
        print('🔗 Testing connection...')
        health = client.ping()
        print(f'✅ Connected successfully: {health}')
        
        # Create database
        print('\n📁 Creating database...')
        client.create_database('python-app')
        
        # Create collection
        print('📄 Creating collection...')
        client.create_collection('python-app', 'users')
        
        # Insert documents
        print('\n➕ Inserting documents...')
        user1 = client.insert_one('python-app', 'users', {
            'name': 'John Doe',
            'email': 'john@example.com',
            'age': 30,
            'active': True
        })
        print(f'Inserted user: {user1}')
        
        user2 = client.insert_one('python-app', 'users', {
            'name': 'Jane Smith',
            'email': 'jane@example.com',
            'age': 25,
            'active': True
        })
        print(f'Inserted user: {user2}')
        
        # Insert multiple documents
        more_users = client.insert_many('python-app', 'users', [
            {'name': 'Bob Wilson', 'email': 'bob@example.com', 'age': 35, 'active': False},
            {'name': 'Alice Brown', 'email': 'alice@example.com', 'age': 28, 'active': True}
        ])
        print(f'Inserted multiple users: {len(more_users)}')
        
        # Find all documents
        print('\n🔍 Finding all users...')
        all_users = client.find('python-app', 'users')
        print(f'All users: {len(all_users)} found')
        for user in all_users:
            print(f'  - {user["name"]} ({user["age"]}) - {"Active" if user["active"] else "Inactive"}')
        
        # Find one document
        print('\n🔍 Finding one user...')
        one_user = client.find_one('python-app', 'users', user1['id'])
        print(f'Found user: {one_user}')
        
        # Update document
        print('\n✏️ Updating user...')
        updated_user = client.update_one('python-app', 'users', user1['id'], {
            'age': 31,
            'last_login': time.strftime('%Y-%m-%d %H:%M:%S')
        })
        print(f'Updated user: {updated_user}')
        
        # Count documents
        print('\n🔢 Counting documents...')
        total_users = client.count('python-app', 'users')
        print(f'Total users: {total_users}')
        
        # Filter active users (client-side filtering)
        print('\n🔍 Finding active users...')
        all_users = client.find('python-app', 'users')
        active_users = [user for user in all_users if user.get('active', False)]
        print(f'Active users: {len(active_users)}')
        for user in active_users:
            print(f'  - {user["name"]} ({user["age"]})')
        
        # List databases and collections
        print('\n📋 Listing databases...')
        databases = client.get_databases()
        print(f'Databases: {databases}')
        
        collections = client.get_collections('python-app')
        print(f'Collections in python-app: {collections}')
        
        # Clean up (optional)
        print('\n🧹 Cleaning up...')
        # client.delete_collection('python-app', 'users')
        # client.delete_database('python-app')
        
        print('\n✅ Python example completed successfully!')
        
    except Exception as error:
        print(f'❌ Error: {error}')

if __name__ == '__main__':
    main()
