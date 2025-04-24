import React from 'react';
import '../../styles/UserDetails/UserInformation.css';

function UserInformation({ userData }) {
  if (!userData) {
    return <div className="user-info-loading">Loading user information...</div>;
  }

  return (
    <div className="user-information">
      <h2 className="user-info-title">User Information</h2>
      
      <div className="user-info-grid">
        <div className="info-row top-row">
          <div className="info-item">
            <span className="info-label">Name:</span>
            <span className="info-value">{userData.firstName} {userData.lastName}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Telegram:</span>
            <span className="info-value">{userData.telegram || 'Not provided'}</span>
          </div>
        </div>
        
        <div className="info-row">
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{userData.email || 'Not provided'}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Phone:</span>
            <span className="info-value">{userData.phone || 'Not provided'}</span>
          </div>
        </div>
        
        <div className="info-row">
          <div className="info-item">
            <span className="info-label">Role:</span>
            <span className="info-value">{userData.rol || 'Team Member'}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span className={`info-value status-${userData.status?.toLowerCase()}`}>
              {userData.status || 'Unknown'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInformation;