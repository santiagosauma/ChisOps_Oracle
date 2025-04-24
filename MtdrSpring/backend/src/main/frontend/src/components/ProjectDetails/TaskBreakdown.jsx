import React from 'react';
import '../../styles/ProjectDetails/TaskBreakdown.css';

const TaskBreakdown = ({ tasks = [] }) => {
  // Calculate task distribution
  const calculateTaskDistribution = () => {
    const total = tasks.length || 1; // Avoid division by zero
    
    const completed = tasks.filter(task => {
      const status = task.status?.toLowerCase() || '';
      return status === 'completed' || 
             status === 'done' || 
             status === 'finalizada' || 
             status === 'completado';
    }).length;
    
    const inProgress = tasks.filter(task => {
      const status = task.status?.toLowerCase() || '';
      return status === 'doing' || 
             status === 'in progress' || 
             status === 'en progreso';
    }).length;
    
    const incomplete = total - completed - inProgress;
    
    return {
      completed: (completed / total) * 100,
      inProgress: (inProgress / total) * 100,
      incomplete: (incomplete / total) * 100,
      counts: { completed, inProgress, incomplete, total }
    };
  };

  const distribution = calculateTaskDistribution();

  return (
    <div className="task-breakdown">
      <h2>Tasks Breakdown</h2>
      <div className="task-breakdown-content">
        <div className="task-breakdown-bar-container">
          <div className="task-breakdown-bar">
            <div 
              className="breakdown-segment completed" 
              style={{ width: `${distribution.completed}%` }}
              title={`Completed: ${distribution.counts.completed} tasks (${distribution.completed.toFixed(0)}%)`}
            ></div>
            <div 
              className="breakdown-segment in-progress" 
              style={{ width: `${distribution.inProgress}%` }}
              title={`In Progress: ${distribution.counts.inProgress} tasks (${distribution.inProgress.toFixed(0)}%)`}
            ></div>
            <div 
              className="breakdown-segment incomplete" 
              style={{ width: `${distribution.incomplete}%` }}
              title={`Incomplete: ${distribution.counts.incomplete} tasks (${distribution.incomplete.toFixed(0)}%)`}
            ></div>
          </div>
        </div>
        
        <div className="task-breakdown-legend">
          <div className="legend-item">
            <div className="legend-color completed"></div>
            <span className="legend-label">Completed ({distribution.counts.completed})</span>
          </div>
          <div className="legend-item">
            <div className="legend-color in-progress"></div>
            <span className="legend-label">In Progress ({distribution.counts.inProgress})</span>
          </div>
          <div className="legend-item">
            <div className="legend-color incomplete"></div>
            <span className="legend-label">Incomplete ({distribution.counts.incomplete})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskBreakdown;
