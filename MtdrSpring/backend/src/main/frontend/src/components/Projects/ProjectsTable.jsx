import React, { useState, useEffect } from 'react';
import '../../styles/Projects.css';
import dropdownIcon from '../../resources/dropdown.png';
import dropupIcon from '../../resources/dropup.png';
import tableGridIcon from '../../resources/table-grid.png';
import searchIcon from '../../resources/search.png';
import settingIcon from '../../resources/setting.png';
import plusIcon from '../../resources/plus.png';

function ProjectsTable({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('projectId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    status: 'All',
    activeState: 'All',
    date: ''
  });
  const [allProjects, setAllProjects] = useState([]);
  const [projectsProgress, setProjectsProgress] = useState({});
  const progressCache = React.useRef({});
  const progressTimestamps = React.useRef({});
  const CACHE_TTL = 60000;

  useEffect(() => {
    setLoading(true);
    let url = '/proyectos';

    if (filterOptions.status !== 'All' && filterOptions.status) {
      url = `/proyectos/estado/${filterOptions.status}`;
    } else if (filterOptions.activeState === 'Active') {
      url = '/proyectos/activos';
    } else if (searchTerm.trim() !== '') {
      url = `/proyectos/buscar?term=${encodeURIComponent(searchTerm)}`;
    }

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        return response.json();
      })
      .then(data => {
        setAllProjects(data);
        filterProjectsByDate(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching projects:', err);
        setError(err.message);
        setProjects([]);
        setAllProjects([]);
        setLoading(false);
      });
  }, [filterOptions.status, filterOptions.activeState, searchTerm]);

  useEffect(() => {
    filterProjectsByDate(allProjects);
  }, [filterOptions.date, allProjects]);

  const filterProjectsByDate = (projectsToFilter) => {
    if (!projectsToFilter || projectsToFilter.length === 0) {
      setProjects([]);
      return;
    }

    const { date } = filterOptions;
    
    if (!date) {
      setProjects(projectsToFilter);
      return;
    }

    const selectedDate = new Date(date);
    
    const filteredByDate = projectsToFilter.filter(project => {
      const projectStartDate = project.startDate ? new Date(project.startDate) : null;
      const projectEndDate = project.endDate ? new Date(project.endDate) : null;
      
      if (projectStartDate && projectEndDate) {
        return selectedDate >= projectStartDate && selectedDate <= projectEndDate;
      }
      
      if (projectStartDate && !projectEndDate) {
        return selectedDate >= projectStartDate;
      }
      
      if (!projectStartDate && projectEndDate) {
        return selectedDate <= projectEndDate;
      }
      
      return true;
    });
    
    setProjects(filteredByDate);
  };

  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('.sidebar');
      if (sidebarElement && sidebarElement.classList.contains('expanded')) {
        document.body.classList.add('sidebar-expanded');
      } else {
        document.body.classList.remove('sidebar-expanded');
      }
    };

    handleSidebarChange();

    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('.sidebar');
    
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true, attributeFilter: ['class'] });
    }

    return () => {
      observer.disconnect();
      document.body.classList.remove('sidebar-expanded');
    };
  }, []);

  useEffect(() => {
    const fetchProgressForProjects = async () => {
      if (!projects.length) return;
      
      const now = Date.now();
      const progressData = { ...progressCache.current };
      const projectsToFetch = [];
      
      projects.forEach(project => {
        const projectId = project.projectId;
        const lastFetchTime = progressTimestamps.current[projectId] || 0;
        
        if (!progressData[projectId] || (now - lastFetchTime > CACHE_TTL)) {
          projectsToFetch.push(project);
        }
      });
      
      if (projectsToFetch.length === 0) {
        setProjectsProgress(progressData);
        return;
      }
      
      const sprintsPromises = projectsToFetch.map(project => 
        fetch(`/sprints/proyecto/${project.projectId}`)
          .then(res => res.ok ? res.json() : [])
          .then(sprints => ({ projectId: project.projectId, sprints }))
      );
      
      const projectsSprints = await Promise.all(sprintsPromises);
      
      const allSprintsWithProject = projectsSprints.flatMap(
        ({ projectId, sprints }) => sprints.map(sprint => ({ 
          projectId, 
          sprintId: sprint.sprintId 
        }))
      );
      
      const tasksPromises = allSprintsWithProject.map(({ projectId, sprintId }) => 
        fetch(`/tareas/sprint/${sprintId}`)
          .then(res => res.ok ? res.json() : [])
          .then(tasks => ({ projectId, sprintId, tasks }))
      );
      
      const allSprintTasks = await Promise.all(tasksPromises);
      
      const projectTasks = {};
      allSprintTasks.forEach(({ projectId, tasks }) => {
        if (!projectTasks[projectId]) {
          projectTasks[projectId] = [];
        }
        projectTasks[projectId] = [...projectTasks[projectId], ...tasks];
      });
      
      projectsToFetch.forEach(project => {
        const projectId = project.projectId;
        const tasks = projectTasks[projectId] || [];
        
        if (tasks.length === 0) {
          progressData[projectId] = { progress: 5, taskCount: 0, completedCount: 0 };
        } else {
          const completedTasks = tasks.filter(task => {
            const status = task.status ? task.status.toLowerCase() : '';
            return status === 'done' || 
                   status === 'completed' || 
                   status === 'finalizado' || 
                   status === 'terminado' ||
                   status === 'ready';
          }).length;
          
          const calculatedProgress = Math.round((completedTasks / tasks.length) * 100);
          const progress = calculatedProgress > 0 ? calculatedProgress : 5;
          
          progressData[projectId] = { 
            progress, 
            taskCount: tasks.length, 
            completedCount: completedTasks 
          };
        }
        
        progressTimestamps.current[projectId] = now;
      });
      
      progressCache.current = progressData;
      setProjectsProgress(progressData);
    };
    
    if (projects.length > 0) {
      fetchProgressForProjects();
    }
  }, [projects]);

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
    if (field === 'status' && value !== 'All') {
      setFilterOptions({
        ...filterOptions,
        status: value,
        activeState: 'All'
      });
    } else if (field === 'activeState' && value !== 'All') {
      setFilterOptions({
        ...filterOptions,
        status: 'All',
        activeState: value
      });
    } else {
      setFilterOptions({
        ...filterOptions,
        [field]: value
      });
    }
  };

  const handleProjectClick = (projectId) => {
    if (onSelectProject) {
      onSelectProject(projectId);
    }
  };

  const filteredProjects = projects.sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  }).map(project => {
    const progressInfo = projectsProgress[project.projectId] || { progress: 0 };
    return {
      ...project,
      progress: progressInfo.progress,
      users: project.users ? project.users.slice(0, 4) : Array(4).fill({ id: 1 })
    };
  });

  const statusOptions = ['All', ...new Set(allProjects.map(p => p.status).filter(Boolean))];
  const activeStateOptions = ['All', 'Active'];

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
            
            <button className="new-button" onClick={() => alert('Create new project functionality would go here')}>
              New Project
              <img src={plusIcon} alt="Add" className="add-icon" />
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

            <div className="filter-option">
              <label>State:</label>
              <select 
                value={filterOptions.activeState} 
                onChange={(e) => handleFilterChange('activeState', e.target.value)}
              >
                {activeStateOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="filter-option">
              <label>Date:</label>
              <input 
                type="date" 
                value={filterOptions.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="date-input"
                style={{
                  padding: '6px 10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  outline: 'none',
                  minWidth: '150px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        )}
        
        <div className="table-container">
          {loading ? (
            <div className="loading-indicator">Loading projects...</div>
          ) : error ? (
            <div className="error-message">Error loading projects: {error}</div>
          ) : projects.length === 0 ? (
            <div className="no-projects">No projects found matching your search criteria.</div>
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
                  const progress = project.progress || 0;
                  const userCount = 4;
                  
                  return (
                    <tr key={project.projectId}>
                      <td>{project.projectId}</td>
                      <td> <a 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            handleProjectClick(project.projectId);
                          }}
                          className="project-name-link"
                        >
                          {project.name}
                        </a></td>
                      <td>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{project.status || 'Unknown'}</td>
                      <td>{userCount}</td>
                      <td>
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill ${project.status === 'Cancelled' ? 'cancelled' : ''}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="progress-text">
                          {progress}%
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