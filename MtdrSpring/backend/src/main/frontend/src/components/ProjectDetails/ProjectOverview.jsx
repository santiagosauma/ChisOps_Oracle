import React from 'react';
import '../../styles/ProjectDetails/ProjectOverview.css';

const ProjectOverview = ({ tasksInfo }) => {
  return (
    <div className="project-overview">
      <h2>Tasks Info</h2>
      <div className="project-overview-cards">
        <div className="overview-card overdue">
          <h3>Overdue</h3>
          <span className="card-value">{tasksInfo.overdue}</span>
        </div>
        <div className="overview-card progress">
          <h3>Progress</h3>
          <span className="card-value">{tasksInfo.progress}</span>
        </div>
        <div className="overview-card completed-pending">
          <h3>Completed/Pending</h3>
          <span className="card-value">{tasksInfo.completed}/{tasksInfo.pending}</span>
        </div>
      </div>
      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ width: tasksInfo.progress }}
          title={`${tasksInfo.progress} completed`}
        ></div>
      </div>
    </div>
  );
};

export default ProjectOverview;