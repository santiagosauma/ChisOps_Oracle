import React from 'react';
import '../../styles/UserDetails/UserInformation.css';

function UserInformation({ userData }) {
  return (
    <div className="user-information"> 
      <h2>Information:</h2>
      <div className="info-content">
        <div className="info-item">
          <span className="info-label">Telegram:</span>
          <span className="info-value">{userData.telegramUsername}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Name:</span>
          <span className="info-value">{`${userData.firstName || ''} ${userData.lastName || ''}`}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Email:</span>
          <span className="info-value">{userData.email}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Telephone Number:</span>
          <span className="info-value">{userData.phone}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Status:</span>
          <span className={`info-value status-badge ${userData.deleted === 0 ? 'active' : 'inactive'}`}>
            {userData.deleted === 0 ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default UserInformation;