import React, { useMemo } from 'react';
import '../../styles/ProjectDetails/ProjectDescription.css';

const ProjectDescription = ({ description, startDate, dueDate, status, currentSprint, allSprints = [] }) => {
  const getStatusBadgeClass = (status) => {
    if (!status) return 'status-badge-default';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('done') || statusLower.includes('complete') || statusLower === 'finalizada') {
      return 'status-badge-success';
    } else if (statusLower.includes('progress') || statusLower === 'in progress' || statusLower === 'en progreso') {
      return 'status-badge-warning';
    } else {
      return 'status-badge-danger';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Determine the current active sprint based on date
  const activeSprintByDate = useMemo(() => {
    const today = new Date();
    
    // Find a sprint where today is between startDate and endDate
    const currentActiveSprint = allSprints.find(sprint => {
      if (!sprint.startDate || !sprint.endDate) return false;
      
      const startDate = new Date(sprint.startDate);
      const endDate = new Date(sprint.endDate);
      
      return today >= startDate && today <= endDate;
    });
    
    if (currentActiveSprint) {
      return currentActiveSprint;
    }
    
    // If no current sprint is found, find the next upcoming sprint
    const upcomingSprints = allSprints
      .filter(sprint => {
        if (!sprint.startDate) return false;
        const startDate = new Date(sprint.startDate);
        return startDate > today;
      })
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    return upcomingSprints.length > 0 
      ? { name: `${upcomingSprints[0].name} (Upcoming)`, upcoming: true }
      : null;
  }, [allSprints]);

  return (
    <div className="project-description">
      <h2>Project Information</h2>
      <div className="description-content">
        <div className="description-text">
          <p>{description || 'No description available'}</p>
        </div>
        <div className="project-details-table">
          <div className="project-detail-item">
            <span className="detail-label">Start Date:</span>
            <span className="detail-value">{formatDate(startDate)}</span>
          </div>
          <div className="project-detail-item">
            <span className="detail-label">Due Date:</span>
            <span className="detail-value">{formatDate(dueDate)}</span>
          </div>
          <div className="project-detail-item">
            <span className="detail-label">Current Sprint:</span>
            <span className="detail-value">
              {activeSprintByDate 
                ? activeSprintByDate.name 
                : 'No active sprint'}
            </span>
          </div>
          <div className="project-detail-item">
            <span className="detail-label">Status:</span>
            <span className={`status-badge ${getStatusBadgeClass(status)}`}>
              {status || 'Not set'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDescription;