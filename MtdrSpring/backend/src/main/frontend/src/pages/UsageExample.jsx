import React, { useState } from 'react';
import UserDetails from './UserDetails';
import '../styles/UsageExample.css';

function UsageExample() {
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  // Mock user list for demonstration
  const users = [
    { id: 'user1', name: 'Isaac Rojas' },
    { id: 'user2', name: 'Ana Martínez' },
    { id: 'user3', name: 'Carlos López' },
  ];
  
  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
  };
  
  const handleBack = () => {
    setSelectedUserId(null);
  };
  
  if (selectedUserId) {
    return <UserDetails userId={selectedUserId} onBack={handleBack} />;
  }
  
  return (
    <div className="users-list-container">
      <h1>Users List</h1>
      <div className="users-table">
        <div className="table-header">
          <div className="header-cell">User ID</div>
          <div className="header-cell">Name</div>
          <div className="header-cell">Actions</div>
        </div>
        <div className="table-body">
          {users.map((user) => (
            <div key={user.id} className="table-row">
              <div className="cell">{user.id}</div>
              <div className="cell">{user.name}</div>
              <div className="cell">
                <button className="view-details-btn" onClick={() => handleUserClick(user.id)}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UsageExample;