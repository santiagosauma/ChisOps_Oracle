import React from 'react';
import '../../styles/UserDetails/UserStatistics.css';

function UserStatistics({ taskStats }) {
  return (
    <div className="user-statistics">
      <div className="stats-card overdue">
        <div className="stats-number">{taskStats.overdue}</div>
        <div className="stats-label">Overdue Tasks</div>
      </div>
      <div className="stats-card pending">
        <div className="stats-number">{taskStats.pending}</div>
        <div className="stats-label">Pending Tasks</div>
      </div>
      <div className="stats-card completed">
        <div className="stats-number">{taskStats.completed}</div>
        <div className="stats-label">Tasks Done</div>
      </div>
    </div>
  );
}

export default UserStatistics;