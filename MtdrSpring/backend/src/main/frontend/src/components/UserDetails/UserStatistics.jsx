import React from 'react';
import '../../styles/UserDetails/UserStatistics.css';

function UserStatistics({ taskStats }) {
  // Calculate progress percentage
  const totalTasks = taskStats.overdue + taskStats.pending + taskStats.completed;
  const progressPercent = totalTasks > 0 
    ? Math.round((taskStats.completed / totalTasks) * 100) 
    : 0;

  return (
    <div className="user-tasks-info">
      <h2 className="user-tasks-info-title">Tasks Info</h2>
      
      <div className="user-stats-grid">
        <div className="user-stat-box user-stat-overdue">
          <div className="user-stat-label">Overdue</div>
          <div className="user-stat-value">{taskStats.overdue}</div>
        </div>
        
        <div className="user-stat-box user-stat-progress">
          <div className="user-stat-label">Progress</div>
          <div className="user-stat-value">{progressPercent}%</div>
        </div>
        
        <div className="user-stat-box user-stat-completed">
          <div className="user-stat-label">Completed/Pending</div>
          <div className="user-stat-value">{taskStats.completed}/{taskStats.pending}</div>
        </div>
      </div>
    </div>
  );
}

export default UserStatistics;