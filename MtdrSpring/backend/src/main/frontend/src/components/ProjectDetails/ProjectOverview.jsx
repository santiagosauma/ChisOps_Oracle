import React from 'react';
import '../../styles/ProjectDetails/ProjectOverview.css';

const ProjectOverview = ({ tasksInfo }) => {
  const info = {
    overdue: tasksInfo?.overdue || 0,
    progress: tasksInfo?.progress || '0%',
    completed: tasksInfo?.completed || 0,
    pending: tasksInfo?.pending || 0,
    total: tasksInfo?.total || 0
  };
  
  const progressDisplay = typeof info.progress === 'number' 
    ? `${info.progress}%` 
    : info.progress;
  
  let progressWidth = progressDisplay;
  if (typeof info.progress === 'number') {
    progressWidth = `${info.progress}%`;
  }

  // Calculate the task status distribution for visualization
  const calculateDistribution = () => {
    const total = Math.max(1, info.total); // Avoid division by zero
    
    const completedPercent = (info.completed / total) * 100;
    const pendingPercent = (info.pending / total) * 100;
    const overduePercent = (info.overdue / total) * 100;
    
    return {
      completed: completedPercent,
      pending: pendingPercent,
      overdue: overduePercent
    };
  };

  const distribution = calculateDistribution();

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
      
      {/* Task Breakdown Section */}
      <div className="task-breakdown-section">
        <div className="task-breakdown-label">
          <span>Tasks Breakdown</span>
        </div>
        <div className="task-breakdown-container">
          <div className="task-breakdown-bar">
            <div 
              className="breakdown-segment completed" 
              style={{ width: `${distribution.completed}%` }}
              title={`Completed: ${info.completed} tasks (${distribution.completed.toFixed(0)}%)`}
            ></div>
            <div 
              className="breakdown-segment pending" 
              style={{ width: `${distribution.pending}%` }}
              title={`In Progress: ${info.pending} tasks (${distribution.pending.toFixed(0)}%)`}
            ></div>
            <div 
              className="breakdown-segment overdue" 
              style={{ width: `${distribution.overdue}%` }}
              title={`Overdue: ${info.overdue} tasks (${distribution.overdue.toFixed(0)}%)`}
            ></div>
          </div>
        </div>
        <div className="task-breakdown-legend">
          <div className="legend-item">
            <div className="legend-color completed"></div>
            <span className="legend-label">Completed</span>
          </div>
          <div className="legend-item">
            <div className="legend-color pending"></div>
            <span className="legend-label">In Progress</span>
          </div>
          <div className="legend-item">
            <div className="legend-color overdue"></div>
            <span className="legend-label">Overdue</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;