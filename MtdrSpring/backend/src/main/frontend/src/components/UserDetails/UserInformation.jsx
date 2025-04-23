import React from 'react';
import '../../styles/UserDetails/UserInformation.css';

function UserInformation({ email, telephone, telegram, joinDate, status }) {
  return (
    <div className="user-information">
      <h2>Information:</h2>
      <div className="info-content">
        <div className="info-item">
          <span className="info-label">Telegram:</span>
          <span className="info-value">{telegram}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Email:</span>
          <span className="info-value">{email}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Telephone Number:</span>
          <span className="info-value">{telephone}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Join Date:</span>
          <span className="info-value">{new Date(joinDate).toLocaleDateString()}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Status:</span>
          <span className={`info-value status-badge ${status.toLowerCase()}`}>{status}</span>
        </div>
      </div>
    </div>
  );
}

export default UserInformation;