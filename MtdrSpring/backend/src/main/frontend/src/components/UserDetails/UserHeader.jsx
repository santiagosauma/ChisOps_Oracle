import React from 'react';
import '../../styles/UserDetails/UserHeader.css';

function UserHeader({ userName, role, onBack }) {
  return (
    <div className="user-header">
      <div className="user-header-left">
        <button className="back-button" onClick={onBack}>
          <span className="back-arrow">←</span>
        </button>
        <h1>{userName} - Details</h1>
      </div>
      <div className="user-header-right">
        <button className="delete-user-btn">Delete User from Project</button>
        <button className="edit-role-btn">Edit Role</button>
      </div>
    </div>
  );
}

export default UserHeader;