import React, { useState, useEffect } from 'react';
import Dudwalls from 'dudwalls';

// Initialize Dudwalls client
const client = new Dudwalls({
  endpoint: process.env.REACT_APP_DUDWALLS_ENDPOINT || 'https://your-dudwalls-instance.com',
  apiKey: process.env.REACT_APP_DUDWALLS_API_KEY || 'your-api-key-here'
});

interface User {
  id?: string;
  name: string;
  email: string;
  age: number;
  active: boolean;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    name: '',
    email: '',
    age: 0,
    active: true
  });

  const db = client.database('react-app');
  const usersCollection = db.collection('users');

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const userData = await usersCollection.find();
      setUsers(userData as User[]);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    try {
      await usersCollection.insertOne(newUser);
      setNewUser({ name: '', email: '', age: 0, active: true });
      await loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await usersCollection.deleteOne(id);
      await loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const toggleUserStatus = async (user: User) => {
    if (!user.id) return;
    
    try {
      await usersCollection.updateOne(user.id, {
        active: !user.active
      });
      await loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Dudwalls React Example</h1>
      
      {/* Create User Form */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Create New User</h2>
        <form onSubmit={createUser}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              style={{ padding: '8px', marginRight: '10px', width: '200px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              style={{ padding: '8px', marginRight: '10px', width: '200px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="number"
              placeholder="Age"
              value={newUser.age}
              onChange={(e) => setNewUser({ ...newUser, age: parseInt(e.target.value) || 0 })}
              style={{ padding: '8px', marginRight: '10px', width: '100px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              <input
                type="checkbox"
                checked={newUser.active}
                onChange={(e) => setNewUser({ ...newUser, active: e.target.checked })}
                style={{ marginRight: '5px' }}
              />
              Active
            </label>
          </div>
          <button 
            type="submit"
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Create User
          </button>
        </form>
      </div>

      {/* Users List */}
      <div>
        <h2>Users ({users.length})</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {users.map((user) => (
              <div 
                key={user.id} 
                style={{ 
                  padding: '15px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  backgroundColor: user.active ? '#f8f9fa' : '#f5f5f5'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>{user.name}</h3>
                    <p style={{ margin: '0 0 5px 0', color: '#666' }}>{user.email}</p>
                    <p style={{ margin: '0', fontSize: '14px', color: '#888' }}>
                      Age: {user.age} | Status: {user.active ? '✅ Active' : '❌ Inactive'}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => toggleUserStatus(user)}
                      style={{
                        padding: '5px 10px',
                        marginRight: '10px',
                        backgroundColor: user.active ? '#ffc107' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {user.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => user.id && deleteUser(user.id)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 && !loading && (
              <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                No users found. Create your first user above!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h3>Statistics</h3>
        <p>Total Users: {users.length}</p>
        <p>Active Users: {users.filter(u => u.active).length}</p>
        <p>Inactive Users: {users.filter(u => !u.active).length}</p>
        <p>Average Age: {users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.age, 0) / users.length) : 0}</p>
      </div>
    </div>
  );
}

export default App;
