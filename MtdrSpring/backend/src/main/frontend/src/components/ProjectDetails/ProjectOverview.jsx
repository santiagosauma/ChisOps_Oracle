import React from 'react';
import '../../styles/ProjectDetails/ProjectOverview.css';

const ProjectOverview = ({ tasksInfo }) => {
  const info = {
    overdue: tasksInfo?.overdue || 0,
    progress: tasksInfo?.progress || '0%',
    completed: tasksInfo?.completed || 0,
    pending: tasksInfo?.pending || 0
  };
  
  const progressDisplay = typeof info.progress === 'number' 
    ? `${info.progress}%` 
    : info.progress;
  
  let progressWidth = progressDisplay;
  if (typeof info.progress === 'number') {
    progressWidth = `${info.progress}%`;
  }

  return (
    <div className="project-overview">
      <h2>Tasks Info</h2>
      <div className="project-overview-cards">
        <div className="overview-card overdue">
          <h3>Overdue</h3>
          <span className="card-value">{info.overdue}</span>
        </div>
        <div className="overview-card progress">
          <h3>Progress</h3>
          <span className="card-value">{progressDisplay}</span>
        </div>
        <div className="overview-card completed-pending">
          <h3>Completed/Pending</h3>
          <span className="card-value">{info.completed}/{info.pending}</span>
        </div>
      </div>
      
      <div className="project-progress-outer-container">
        <div className="project-progress-label">
          <span>Overall Progress</span>
          <span className="project-progress-percentage">{progressDisplay}</span>
        </div>
        <div className="project-progress-bar-container">
          <div 
            className="project-progress-bar-indicator" 
            style={{ width: progressWidth }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;