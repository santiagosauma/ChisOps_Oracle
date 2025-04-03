import React from 'react';
import '../../styles/ProjectDetails/ProjectDescription.css';

const ProjectDescription = ({ description, startDate, dueDate, status }) => {
  return (
    <div className="project-description">
      <h2>Description:</h2>
      <div className="description-content">
        <p>{description}</p>
      </div>
      
      <div className="project-dates">
        <div className="date-item">
          <label>Start Date:</label>
          <span>{startDate}</span>
        </div>
        <div className="date-item">
          <label>Due Date:</label>
          <span>{dueDate}</span>
        </div>
      </div>
      
      <div className="project-status">
        <label>Status:</label>
        <div className={`status-badge ${status.toLowerCase().replace(' ', '-')}`}>
          {status}
        </div>
      </div>
    </div>
  );
};

export default ProjectDescription;