import React from 'react';
import '../../styles/UserDetails/UserProjectHistory.css';

function UserProjectHistory({ projects, selectedProject, onProjectChange }) {
  return (
    <div className="user-project-history">
      <h2>History of Projects</h2>
      <div className="project-history-table">
        <div className="table-header">
          <div className="header-cell name">Name</div>
          <div className="header-cell date">Start Date</div>
          <div className="header-cell date">Finish Date</div>
          <div className="header-cell status">Status</div>
        </div>
        <div className="table-body">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className={`table-row ${selectedProject === project.id ? 'selected' : ''}`}
              onClick={() => onProjectChange(project.id)}
            >
              <div className="cell name">{project.name}</div>
              <div className="cell date">
                {new Date(project.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="cell date">
                {new Date(project.endDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="cell status">
                <span className={`status-badge ${project.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {project.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserProjectHistory;