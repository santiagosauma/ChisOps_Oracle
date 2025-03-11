import React, { useState } from 'react';
import '../../styles/Projects.css';
 
// Dummy data for projects
const projectsData = [
  { id: '01', name: 'Proyecto 1', startDate: 'Jan 1, 2020', finishDate: 'Jan 1, 2020', status: 'Cancelled', users: 10, progress: 45 },
  { id: '02', name: 'Proyecto 2', startDate: 'Jan 2, 2020', finishDate: 'Jan 2, 2020', status: 'On Hold', users: 20, progress: 60 },
  { id: '03', name: 'Proyecto 3', startDate: 'Jan 3, 2020', finishDate: 'Jan 3, 2020', status: 'Completed', users: 20, progress: 100 },
  { id: '04', name: 'Proyecto 4', startDate: 'Jan 3, 2020', finishDate: 'Jan 3, 2020', status: 'In Review', users: 20, progress: 80 },
  { id: '05', name: 'Proyecto 5', startDate: 'Jan 3, 2020', finishDate: 'Jan 3, 2020', status: 'In Progress', users: 20, progress: 65 },
  { id: '06', name: 'Proyecto 6', startDate: 'Jan 1, 2020', finishDate: 'Jan 1, 2020', status: 'Completed', users: 20, progress: 100 },
  { id: '07', name: 'Proyecto 7', startDate: 'Jan 2, 2020', finishDate: 'Jan 2, 2020', status: 'In Progress', users: 20, progress: 30 },
  { id: '08', name: 'Proyecto 8', startDate: 'Jan 3, 2020', finishDate: 'Jan 3, 2020', status: 'Cancelled', users: 20, progress: 50 },
  { id: '09', name: 'Proyecto 9', startDate: 'Jan 3, 2020', finishDate: 'Jan 3, 2020', status: 'On Hold', users: 20, progress: 75 },
  { id: '10', name: 'Proyecto 10', startDate: 'Jan 3, 2020', finishDate: 'Jan 3, 2020', status: 'Completed', users: 20, progress: 100 },
  { id: '11', name: 'Proyecto 11', startDate: 'Jan 1, 2020', finishDate: 'Jan 1, 2020', status: 'In Review', users: 20, progress: 75 },
  { id: '12', name: 'Proyecto 12', startDate: 'Jan 2, 2020', finishDate: 'Jan 2, 2020', status: 'In Progress', users: 20, progress: 85 },
  { id: '13', name: 'Proyecto 13', startDate: 'Jan 3, 2020', finishDate: 'Jan 3, 2020', status: 'Completed', users: 20, progress: 100 },
  { id: '14', name: 'Proyecto 14', startDate: 'Jan 3, 2020', finishDate: 'Jan 3, 2020', status: 'Cancelled', users: 20, progress: 50 },
  { id: '15', name: 'Proyecto 15', startDate: 'Jan 3, 2020', finishDate: 'Jan 3, 2020', status: 'Cancelled', users: 20, progress: 80 },
];

function ProjectsTable() {
  const [projects, setProjects] = useState(projectsData);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(false);

  // Sort projects based on sortField and sortDirection
  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Filter projects based on search term
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter toggle
  const toggleFilter = () => {
    setFilterActive(!filterActive);
  };

  // Create new project
  const handleNewProject = () => {
    alert('Create new project functionality would go here');
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'Cancelled':
        return 'status-cancelled';
      case 'On Hold':
        return 'status-onhold';
      case 'Completed':
        return 'status-completed';
      case 'In Review':
        return 'status-review';
      case 'In Progress':
        return 'status-progress';
      default:
        return '';
    }
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.id.includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });

  return (
    <div className="home-wrapper">

      <div className="projects-container">
        <div className="toolbar">
          <div className="search-container">
            <button className="icon-button">
              <i className="fas fa-link"></i>
            </button>
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search" 
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className="search-icon">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
          
          <div className="actions">
            <button 
              className={`filter-button ${filterActive ? 'active' : ''}`}
              onClick={toggleFilter}
            >
              <i className="fas fa-filter"></i>
              Filter
            </button>
            
            <button className="new-button" onClick={handleNewProject}>
              New
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>
        
        <div className="table-container">
          <table className="projects-table">
            <thead>
              <tr>
                <th 
                  className={sortField === 'id' ? `sort-${sortDirection}` : ''}
                  onClick={() => handleSort('id')}
                >
                  ID
                  <i className="fas fa-sort"></i>
                </th>
                <th 
                  className={sortField === 'name' ? `sort-${sortDirection}` : ''}
                  onClick={() => handleSort('name')}
                >
                  Name
                  <i className="fas fa-sort"></i>
                </th>
                <th 
                  className={sortField === 'startDate' ? `sort-${sortDirection}` : ''}
                  onClick={() => handleSort('startDate')}
                >
                  Start Date
                  <i className="fas fa-sort"></i>
                </th>
                <th 
                  className={sortField === 'finishDate' ? `sort-${sortDirection}` : ''}
                  onClick={() => handleSort('finishDate')}
                >
                  Finish Date
                  <i className="fas fa-sort"></i>
                </th>
                <th 
                  className={sortField === 'status' ? `sort-${sortDirection}` : ''}
                  onClick={() => handleSort('status')}
                >
                  Status
                  <i className="fas fa-sort"></i>
                </th>
                <th 
                  className={sortField === 'users' ? `sort-${sortDirection}` : ''}
                  onClick={() => handleSort('users')}
                >
                  Num. of Users
                  <i className="fas fa-sort"></i>
                </th>
                <th 
                  className={sortField === 'progress' ? `sort-${sortDirection}` : ''}
                  onClick={() => handleSort('progress')}
                >
                  Progress
                  <i className="fas fa-sort"></i>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td>{project.id}</td>
                  <td>{project.name}</td>
                  <td>{project.startDate}</td>
                  <td>{project.finishDate}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td>{project.users}</td>
                  <td>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${project.status === 'Cancelled' ? 'cancelled' : ''}`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </td>
                  <td>
                    <button className="action-button">
                      <i className="fas fa-pencil-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProjectsTable;