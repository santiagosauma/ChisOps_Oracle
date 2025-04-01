import React, { useState, useEffect } from 'react';
import '../../styles/Projects.css';
import dropdownIcon from '../../resources/dropdown.png';
import dropupIcon from '../../resources/dropup.png';
// Import new icons
import tableGridIcon from '../../resources/table-grid.png';
import searchIcon from '../../resources/search.png';
import settingIcon from '../../resources/setting.png';
import plusIcon from '../../resources/plus.png';

function ProjectsTable() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('projectId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    status: 'All'
  });

  useEffect(() => {
    setLoading(true);
    fetch('/proyectos')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        return response.json();
      })
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching projects:', err);
        setError(err.message);
        setProjects([]);
        setLoading(false);
      });
  }, []);

  function getProjectProgress(proyecto) {
    let totalTasks = 0;
    let completedTasks = 0;
    if (proyecto.sprints) {
      proyecto.sprints.forEach(sprint => {
        if (sprint.tareas) {
          sprint.tareas.forEach(t => {
            totalTasks++;
            if (t.status === 'Completado') {
              completedTasks++;
            }
          });
        }
      });
    }
    if (totalTasks === 0) {
      return 0;
    }
    return (completedTasks / totalTasks) * 100;
  }

  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilter = () => {
    setFilterActive(!filterActive);
  };

  const handleFilterChange = (field, value) => {
    setFilterOptions({
      ...filterOptions,
      [field]: value
    });
  };

  const handleNewProject = () => {
    alert('Create new project functionality would go here');
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-tag';
    
    switch (status.toLowerCase()) {
      case 'cancelled':
        return 'status-tag status-cancelled';
      case 'on hold':
        return 'status-tag status-on-hold';
      case 'completed':
        return 'status-tag status-completed';
      case 'in review':
        return 'status-tag status-in-review';
      case 'in progress':
        return 'status-tag status-in-progress';
      default:
        return 'status-tag';
    }
  };

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = 
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectId?.toString().includes(searchTerm);
      
      const matchesStatus = 
        filterOptions.status === 'All' || 
        project.status?.toLowerCase() === filterOptions.status.toLowerCase();
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });

  const statusOptions = ['All', ...new Set(projects.map(p => p.status).filter(Boolean))];

  return (
    <div className="home-wrapper">
      <div className="projects-container">
        <div className="toolbar">
          <div className="toolbar-left">
            <img src={tableGridIcon} alt="Table" className="table-icon" />
          </div>
          
          <div className="toolbar-right">
            <div className="search-box">
              <img src={searchIcon} alt="Search" className="search-input-icon" />
              <input 
                type="text" 
                placeholder="Search by name..." 
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <button 
              className={`filter-button ${filterActive ? 'active' : ''}`}
              onClick={toggleFilter}
            >
              Filter
              <img src={settingIcon} alt="Filter" className="button-icon" />
            </button>
            
            <button className="new-button" onClick={handleNewProject}>
              New Project
              <img src={plusIcon} alt="Add" className="button-icon" />
            </button>
          </div>
        </div>
        
        {filterActive && (
          <div className="filter-panel">
            <div className="filter-option">
              <label>Status:</label>
              <select 
                value={filterOptions.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        <div className="table-container">
          {loading ? (
            <div className="loading-indicator">Loading projects...</div>
          ) : error ? (
            <div className="error-message">Error loading projects: {error}</div>
          ) : projects.length === 0 ? (
            <div className="no-projects">No projects found</div>
          ) : (
            <table className="projects-table">
              <thead>
                <tr>
                  <th 
                    className={sortField === 'projectId' ? `sort-${sortDirection}` : ''}
                    onClick={() => handleSort('projectId')}
                  >
                    ID
                    {sortField === 'projectId' ? (
                      <img 
                        src={sortDirection === 'asc' ? dropdownIcon : dropupIcon} 
                        alt={sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'} 
                        className="sort-icon" 
                      />
                    ) : (
                      <i className="fas fa-sort"></i>
                    )}
                  </th>
                  <th 
                    className={sortField === 'name' ? `sort-${sortDirection}` : ''}
                    onClick={() => handleSort('name')}
                  >
                    Name
                    {sortField === 'name' ? (
                      <img 
                        src={sortDirection === 'asc' ? dropdownIcon : dropupIcon} 
                        alt={sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'} 
                        className="sort-icon" 
                      />
                    ) : (
                      <i className="fas fa-sort"></i>
                    )}
                  </th>
                  <th 
                    className={sortField === 'startDate' ? `sort-${sortDirection}` : ''}
                    onClick={() => handleSort('startDate')}
                  >
                    Start Date
                    {sortField === 'startDate' ? (
                      <img 
                        src={sortDirection === 'asc' ? dropdownIcon : dropupIcon} 
                        alt={sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'} 
                        className="sort-icon" 
                      />
                    ) : (
                      <i className="fas fa-sort"></i>
                    )}
                  </th>
                  <th 
                    className={sortField === 'endDate' ? `sort-${sortDirection}` : ''}
                    onClick={() => handleSort('endDate')}
                  >
                    Finish Date
                    {sortField === 'endDate' ? (
                      <img 
                        src={sortDirection === 'asc' ? dropdownIcon : dropupIcon} 
                        alt={sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'} 
                        className="sort-icon" 
                      />
                    ) : (
                      <i className="fas fa-sort"></i>
                    )}
                  </th>
                  <th 
                    className={sortField === 'status' ? `sort-${sortDirection}` : ''}
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {sortField === 'status' ? (
                      <img 
                        src={sortDirection === 'asc' ? dropdownIcon : dropupIcon} 
                        alt={sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'} 
                        className="sort-icon" 
                      />
                    ) : (
                      <i className="fas fa-sort"></i>
                    )}
                  </th>
                  <th 
                    className={sortField === 'users' ? `sort-${sortDirection}` : ''}
                    onClick={() => handleSort('users')}
                  >
                    Num. of Users
                    {sortField === 'users' ? (
                      <img 
                        src={sortDirection === 'asc' ? dropdownIcon : dropupIcon} 
                        alt={sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'} 
                        className="sort-icon" 
                      />
                    ) : (
                      <i className="fas fa-sort"></i>
                    )}
                  </th>
                  <th 
                    className={sortField === 'progress' ? `sort-${sortDirection}` : ''}
                    onClick={() => handleSort('progress')}
                  >
                    Progress
                    {sortField === 'progress' ? (
                      <img 
                        src={sortDirection === 'asc' ? dropdownIcon : dropupIcon} 
                        alt={sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'} 
                        className="sort-icon" 
                      />
                    ) : (
                      <i className="fas fa-sort"></i>
                    )}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => {
                  const progress = getProjectProgress(project);
                  const userCount = project.users ? project.users.length : 0;
                  
                  return (
                    <tr key={project.projectId}>
                      <td>{project.projectId}</td>
                      <td>{project.name}</td>
                      <td>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <span className={getStatusClass(project.status)}>
                          {project.status || 'Unknown'}
                        </span>
                      </td>
                      <td>{userCount}</td>
                      <td>
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill ${project.status === 'Cancelled' ? 'cancelled' : ''}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </td>
                      <td>
                        <button className="action-button" title="Edit Project">
                          <i className="fas fa-pencil-alt"></i>
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectsTable;